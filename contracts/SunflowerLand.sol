// contracts/MyContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";


import "./Inventory.sol";
import "./Token.sol";
import "./Farm.sol";
 

// Do we need Ownable - what would happen if we renounced ownership?

contract SunflowerLand is Ownable {
    using ECDSA for bytes32;

    mapping(bytes32 => bool) public executed;

    function deposit() external payable {}

    SunflowerLandInventory inventory;
    SunflowerLandToken token;
    SunflowerLandFarm farm;

    constructor(SunflowerLandInventory _inventory, SunflowerLandToken _token, SunflowerLandFarm _farm) public payable {
        inventory = _inventory;
        token = _token;
        farm = _farm;
    }

    // A unique nonce identifer for the account
    function session() public view returns(bytes32) {
        return keccak256(abi.encodePacked(_msgSender(), block.timestamp)).toEthSignedMessageHash();
    }

    function verify(bytes32 hash, bytes memory signature) public returns (bool) {
        bytes32 ethSignedHash = hash.toEthSignedMessageHash();
        return ethSignedHash.recover(signature) == owner();
    }
    
    function createFarm(
        // Verification
        bytes memory signature,
        // Data
        address charity,
        uint amount
    ) public payable {
        // Verify
        bytes32 txHash = keccak256(abi.encodePacked(charity, amount));
        require(!executed[txHash], "SunflowerLand: Tx Executed");
        require(verify(txHash, signature), "SunflowerLand: Unauthorised");

        executed[txHash] = true;

        if (amount > 0) {
            (bool sent, bytes memory data) = charity.call{value: amount}("");
            require(sent, "SunflowerLand: Donation Failed");
        }

        farm.mint(_msgSender());
    }

    /**
     * Bring off chain data on chain
     */
    function save(
        // Verification
        bytes memory signature,
        // Data
        uint farmId,
        uint256[] memory mintIds,
        uint256[] memory mintAmounts,
        uint256[] memory burnIds,
        uint256[] memory burnAmounts,
        uint256 mintTokens,
        uint256 burnTokens
    ) public {
        // Verify
        bytes32 txHash = keccak256(abi.encodePacked(farmId, mintIds, mintAmounts, burnIds, burnAmounts));
        require(!executed[txHash], "SunflowerLand: Tx Executed");
        require(verify(txHash, signature), "SunflowerLand: Unauthorised");
        executed[txHash] = true;

        address farmOwner = farm.ownerOf(farmId);

        // Check they own the farm
        require(
            farmOwner == _msgSender(),
            "SunflowerLand: You do not own this farm"
        );

        // Get the holding address of the farm
        address farmAddress = farm.getFarm(farmId);

        // Update tokens
        inventory.gameMint(farmAddress, mintIds, mintAmounts, signature);
        inventory.gameBurn(farmAddress, burnIds, burnAmounts);

        if (mintTokens > 0) {
            token.gameMint(farmAddress, mintTokens);
        }
        
        if (burnTokens > 0) {
            // Send to the burn address so total supply keeps increasing
            token.gameTransfer(farmAddress, 0x0000000000000000000000000000000000000000, burnTokens);
        }
    }

    // Withdraw resources from farm to another account
    function withdraw(
        // Verification
        bytes memory signature,
        // Data
        uint farmId,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        uint tokenAmount
    ) public  {
        // Verify
        bytes32 txHash = keccak256(abi.encodePacked(farmId, to, ids, amounts));
        require(!executed[txHash], "SunflowerLand: Tx Executed");
        require(verify(txHash, signature), "SunflowerLand: Unauthorised");
        executed[txHash] = true;

        address farmOwner = farm.ownerOf(farmId);

        // Check they own the farm
        require(
            farmOwner == _msgSender(),
            "SunflowerLand: You do not own this farm"
        );

        address farmAddress = farm.getFarm(farmId);

        // Withdraw from farm
        inventory.gameTransferFrom(farmAddress, to, ids, amounts, signature);
        token.gameTransfer(farmAddress, to, tokenAmount);
    }
}