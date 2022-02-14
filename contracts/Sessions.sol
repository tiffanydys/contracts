// contracts/MyContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";


import "./Inventory.sol";
import "./Token.sol";
import "./Farm.sol";
// import "./Uniswap.sol";

contract SunflowerLandSession is Ownable {
    using ECDSA for bytes32;

    mapping(bytes32 => bool) public executed;

    // Farm ID to saved timestamp
    mapping(uint => bytes32) public sessions;

    function deposit() external payable {}

    address private signer;
    address private team;
    address private wishingWell;

    // 0.1
    uint private syncFee = 1 * (10 ** 17);

    // 30% of the tax goes into the wishing well
    uint private wishingWellTax = 30;

    // Whether to liquidate fees instead of sending SFL token
    bool private liquify = false;

    SunflowerLandInventory inventory;
    SunflowerLandToken token;
    SunflowerLand farm;

    // Enable for deploy - disable for testing
    //IUniswapV2Router02 public immutable uniswapV2Router;

    constructor(SunflowerLandInventory _inventory, SunflowerLandToken _token, SunflowerLand _farm) payable {
        inventory = _inventory;
        token = _token;
        farm = _farm;
        signer = _msgSender();
        team = _msgSender();

        // Enable for deploy - disable for testing
        //uniswapV2Router = IUniswapV2Router02(0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff);
    }

    function transferSigner(address _signer) public onlyOwner {
        signer = _signer;
    }

    function transferTeam(address _team) public onlyOwner {
        team = _team;
    }

    function setSyncFee(uint _fee) public onlyOwner {
        syncFee = _fee;
    }

    function setWithdrawFee(uint _fee) public onlyOwner {
        syncFee = _fee;
    }

    function setWishingWellTax(uint _tax) public onlyOwner {
        wishingWellTax = _tax;
    }

    function setLiquify(bool _liquify) public onlyOwner {
        liquify = _liquify;
    }

    function setWishingWell(address _wishingWell) public onlyOwner {
        wishingWell = _wishingWell;
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
    ) public payable returns(bool success) {
       require(msg.value >= syncFee, "SunflowerLand: Missing fee");
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

        (bool teamSent,) = team.call{value: msg.value}("");
        require(teamSent, "SunflowerLand: Fee Failed");

        return true;
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

    function withdraw(
        // Verification
        bytes memory signature,
        bytes32 sessionId,
        uint deadline,
        // Data
        uint farmId,
        uint256[] memory ids,
        uint256[] memory amounts,
        uint256 sfl,
        // 100 = 10%
        uint tax
    ) public returns (bool) {
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
        bytes32 txHash = keccak256(abi.encodePacked(sessionId, deadline,  _msgSender(), farmId, ids, amounts, sfl, tax));
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

        // Withdrawal tax
        uint teamFee = sfl * tax / 1000;
        takeFee(farmNFT.account, teamFee);

        // Withdraw from farm
        uint remaining = sfl - teamFee;
        inventory.gameTransferFrom(farmNFT.account, _msgSender(), ids, amounts, "");
        token.gameTransfer(farmNFT.account, _msgSender(), remaining);

        return true;
    }

    function takeFee(address from, uint amount) private {
        token.gameTransfer(from, address(this), amount);

        uint wishingWellFee = amount * wishingWellTax / 100;
        uint remaining = amount - wishingWellFee;

        token.transfer(wishingWell, wishingWellFee);

        if (liquify) {
            // Enable for deploy - disable for testing
            //liquidate(remaining);
        } else {
            token.transfer(team, remaining);
        }
    }

    // Enable for deploy - disable for testing

    // function liquidate(uint amount) private {
    //     token.approve(address(uniswapV2Router), amount);

    //     address[] memory path = new address[](2);
    //     path[0] = address(token);
    //     path[1] = uniswapV2Router.WETH();

    //     // make the swap
    //     uniswapV2Router.swapExactTokensForETHSupportingFeeOnTransferTokens(
    //         amount,
    //         0, // accept any amount of ETH
    //         path,
    //         team,
    //         block.timestamp
    //     );
    // }
}