// contracts/MyContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";

import "./GameOwner.sol";

import "./Inventory.sol";
import "./Farm.sol";

contract MutantCrops is GameOwner, ERC721Enumerable, Pausable {
    using ECDSA for bytes32;

    mapping(bytes32 => bool) public executed;

    // Farm ID to saved timestamp
    mapping(uint => uint) public mintedAt;

    uint private inventoryId = 912;

    address private signer;

    SunflowerLandInventory inventory;
    SunflowerLand farm;

    string private baseURI = "https://sunflower-land.com/play/nfts/mutant-crops/";

    constructor(SunflowerLandInventory _inventory, SunflowerLand _farm) ERC721("Sunflower Land Mutant Crop", "SLM") {
        inventory = _inventory;
        farm = _farm;
        signer = _msgSender();
        addGameRole(_msgSender());
    }

    function setBaseUri(string memory uri) public onlyOwner {
        baseURI = uri;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    /**
     * Update it in the ERC1155 contract
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        // Always let base contracts run first
        super._beforeTokenTransfer(from, to, tokenId);

        require(!paused(), "ERC721Pausable: token transfer while paused");

        bool isMint = from == address(0);

        uint256[] memory ids = new uint256[](1);
        uint256[] memory amounts = new uint256[](1);

        // Intialises the only element in the array
        ids[0] = inventoryId;
        amounts[0] = 1;

        if (isMint) {
            // Mint it
            inventory.gameMint(to, ids, amounts, "");
        } else {
            // Move it around
            inventory.gameTransferFrom(from, to, ids, amounts, "");
        }
    }

    /**
     * Withdraw from farm to personal wallet
     */
    function gameTransfer(
        address from,
        address to,
        uint256 tokenId
    ) external onlyGame {
        _transfer(from, to, tokenId);
    }

    function gameMint(
        address to,
        uint256 tokenId
    ) external onlyGame {
        _mint(to, tokenId);
    }

    function gameBurn(
        uint256 tokenId
    ) external onlyGame {
        _burn(tokenId);
    }
}
