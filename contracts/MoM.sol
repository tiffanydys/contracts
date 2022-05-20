// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "./Inventory.sol";
import "./GameOwner.sol";

contract MoMNFT is GameOwner, ERC721 {
    SunflowerLandInventory inventory;
    uint private supply = 0;

    constructor(SunflowerLandInventory _inventory) ERC721("MoM Sunflower Crossover", "MSF")  {
        inventory = _inventory;
    }

    function destroy() public onlyOwner payable {
        address payable addr = payable(address(owner()));
        selfdestruct(addr);
    }

    function mint(address[] memory) public onlyGame {
    }

    function trade() public {
    }

    function totalSupply() public view returns (uint) {
        return supply;
    }

/*
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        //solhint-disable-next-line max-line-length
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");

        _transfer(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        safeTransferFrom(from, to, tokenId, "");
    }


    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public virtual override {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
        _safeTransfer(from, to, tokenId, _data);
    }
}