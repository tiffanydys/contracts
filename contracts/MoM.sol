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

    function mint(address[] memory) public onlyGame {
    }

    function trade() public {
    }

    function totalSupply() public view returns (uint) {
        return supply;
    }
}