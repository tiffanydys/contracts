// contracts/MyContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "./GameOwner.sol";

import "./Farm.sol";
import "./MutantCrops.sol";

contract MutantCropMinter is GameOwner {
    using ECDSA for bytes32;

    mapping(bytes32 => bool) public executed;

    // Farm ID -> Crop ID -> Timestamp
    mapping(uint256 => mapping(uint256 => uint256)) public mintedAt;

    address private signer;

    SunflowerLand farm;
    MutantCrops mutantCrops;

    constructor(SunflowerLand _farm, MutantCrops _mutantCrops) {
        farm = _farm;
        mutantCrops = _mutantCrops;
        signer = _msgSender();
        addGameRole(_msgSender());
    }

    function transferSigner(address _signer) public onlyOwner {
        signer = _signer;
    }

    function verify(bytes32 hash, bytes memory signature) private view returns (bool) {
        bytes32 ethSignedHash = hash.toEthSignedMessageHash();
        return ethSignedHash.recover(signature) == signer;
    }

    function mintSignature(
        uint256 deadline,
        uint256 cropId,
        uint256 farmId
    ) private view returns(bytes32 success) {
        /**
         * Distinct order and abi.encode to avoid hash collisions
         */
        return keccak256(abi.encode("mutant-crops", deadline, _msgSender(), cropId, farmId));
    }

    function mint(
        // Verification
        bytes memory signature,
        uint256 deadline,
        // Data
        uint256 cropId,
        uint256 farmId
    ) external returns(bool success) {
        require(deadline >= block.timestamp, "MutantCrops: Deadline Passed");
        require(mintedAt[farmId][cropId] == 0, "MutantCrop: Already minted");

        // Verify
        bytes32 txHash = mintSignature(deadline, cropId, farmId);
        require(!executed[txHash], "MutantCrops: Tx Executed");
        require(verify(txHash, signature), "MutantCrops: Unauthorised");
        executed[txHash] = true;
        mintedAt[farmId][cropId] = block.timestamp;
        
        Farm memory farmNFT = farm.getFarm(farmId);
        require(farmNFT.owner == _msgSender(), "MutantCrops: You do not own this farm");

        uint totalSupply = mutantCrops.totalSupply();
        uint nextMutantCropId = totalSupply % 10;
        require(nextMutantCropId == cropId, "MutantCrops: Crop is not ready");

        mutantCrops.gameMint(farmNFT.account, totalSupply + 1);
        
        return true;
    }
}
