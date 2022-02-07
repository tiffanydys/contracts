// contracts/MyContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";


import "./Inventory.sol";
import "./Token.sol";
import "./Farm.sol";

// Do we need Ownable - what would happen if we renounced ownership?

contract SunflowerLandSession is Ownable {
    using ECDSA for bytes32;

    mapping(bytes32 => bool) public executed;

    // Farm ID to saved timestamp
    mapping(uint => bytes32) public sessions;

    function deposit() external payable {}

    address private signer;
    SunflowerLandInventory inventory;
    SunflowerLandToken token;
    SunflowerLandFarm farm;

    constructor(SunflowerLandInventory _inventory, SunflowerLandToken _token, SunflowerLandFarm _farm) payable {
        inventory = _inventory;
        token = _token;
        farm = _farm;
        signer = _msgSender();
    }

    function transferSigner(address _signer) public onlyOwner {
        signer = _signer;
    }

    // A unique nonce identifer for the account
    function generateSessionId(uint tokenId) public view returns(bytes32) {
        return keccak256(abi.encodePacked(_msgSender(), sessions[tokenId], block.timestamp)).toEthSignedMessageHash();
    }

    function getSessionId(uint tokenId) public view returns(bytes32) {
        return sessions[tokenId];
    }

    function verify(bytes32 hash, bytes memory signature) public view returns (bool) {
        bytes32 ethSignedHash = hash.toEthSignedMessageHash();
        return ethSignedHash.recover(signature) == signer;
    }
    
    /**
     * Bring off chain data on chain
     */
    function sync(
        // Verification
        bytes memory signature,
        bytes32 sessionId,
        uint deadline,
        // Data
        uint farmId,
        uint256[] memory mintIds,
        uint256[] memory mintAmounts,
        uint256[] memory burnIds,
        uint256[] memory burnAmounts,
        int256 tokens
    ) public {
       require(deadline >= block.timestamp, "SunflowerLand: Deadline Passed");

        // Check the session is new or has not changed (already saved or withdrew funds)
        bytes32 farmSessionId = sessions[farmId];
        require(
            farmSessionId == sessionId,
            "SunflowerLand: Session has changed"
        );

        // Start a new session
        sessions[farmId] = generateSessionId(farmId);

        // Verify
        bytes32 txHash = keccak256(abi.encodePacked(sessionId, deadline,  _msgSender(), farmId, mintIds, mintAmounts, burnIds, burnAmounts, tokens));
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
        Farm memory farmNFT = farm.getFarm(farmId);

        updateBalance(farmNFT.account, mintIds, mintAmounts, burnIds, burnAmounts, tokens);
    }

    function updateBalance(
        address account,
        uint256[] memory mintIds,
        uint256[] memory mintAmounts,
        uint256[] memory burnIds,
        uint256[] memory burnAmounts,
        int256 tokens
    ) private {
        if (mintIds.length > 0) {
            inventory.gameMint(account, mintIds, mintAmounts, "");
        }

        if (burnIds.length > 0) {
            inventory.gameBurn(account, burnIds, burnAmounts);
        }

        if (tokens > 0) {
            token.gameMint(account, uint256(tokens));
        }
        
        if (tokens < 0) {
            // Send to the burn address so total supply keeps increasing
            token.gameTransfer(account, 0x000000000000000000000000000000000000dEaD, uint256(-tokens));
        }
    }

    // TODO!
    // Withdraw resources from farm to another account
    // function withdraw(
    //     uint256 farmId,
    //     address to,
    //     uint256[] memory ids,
    //     uint256[] memory amounts,
    //     uint256 tokenAmount
    // ) public  {
    //     // Start a new session
    //     sessions[farmId] = generateSessionId(farmId);

    //     address farmOwner = farm.ownerOf(farmId);

    //     // Check they own the farm
    //     require(
    //         farmOwner == _msgSender(),
    //         "SunflowerLand: You do not own this farm"
    //     );



    //     // Get the holding address of the tokens
    //     Farm memory farmNFT = farm.getFarm(farmId);

    //     // TODO - validate the max limits on the withrdraw
    //         // E.g. No more than 10,000 tokens at a time

    //     // Withdraw from farm
    //     inventory.gameTransferFrom(farmNFT.account, to, ids, amounts, "");
    //     token.gameTransfer(farmNFT.account, to, tokenAmount);
    // }
}