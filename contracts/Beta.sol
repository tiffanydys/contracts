// contracts/MyContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "./Farm.sol";

contract SunflowerLandBeta is Ownable {
    using ECDSA for bytes32;

    mapping(bytes32 => bool) public executed;

    function deposit() external payable {}

    address private signer;
    address private team;
    SunflowerLandFarm farm;

    constructor(SunflowerLandFarm _farm) payable {
        farm = _farm;
        signer = _msgSender();
        team = _msgSender();
    }

    function transferSigner(address _signer) public onlyOwner {
        signer = _signer;
    }

    function transferTeam(address _team) public onlyOwner {
        team = _team;
    }

    function verify(bytes32 hash, bytes memory signature) public view returns (bool) {
        bytes32 ethSignedHash = hash.toEthSignedMessageHash();
        return ethSignedHash.recover(signature) == signer;
    }
    
    /**
     * V1: An address can only create 1 farm - txHash is 
     */
    function createFarm(
        // Verification
        bytes memory signature,
        uint nonce,
        // Data
        address charity,
        uint amount
    ) public payable {
        // Verify
        bytes32 txHash = keccak256(abi.encodePacked(nonce, charity, amount, _msgSender()));
        require(!executed[txHash], "Land: Tx Executed");
        require(verify(txHash, signature), "Land: Unauthorised");

        executed[txHash] = true;

        // 90% to team
        uint teamAmount = amount * 90 / 100;
        (bool teamSent,) = team.call{value: teamAmount}("");
        require(teamSent, "Land: Team Donation Failed");

        // 10% to charity
        uint charityAmount = amount - teamAmount;
        (bool charitySent,) = charity.call{value: charityAmount}("");
        require(charitySent, "Land: Charity Donation Failed");

        farm.mint(_msgSender());
    }
}