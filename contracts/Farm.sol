// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./FarmHolder.sol";

// Should we make pausable as well?
contract SunflowerLandFarm is ERC721Enumerable, Ownable {
    address private game;

    /*
     * Each farm has its own contract address deployed
     * This enables the NFT to actually own the resources and tokens
    */
    mapping (uint => address) farms;

    string private baseURI = "https://sunflower-land.com/api/nfts/farm/";

    constructor() public ERC721("Sunflower Land Farm", "SLF") {
        game = msg.sender;
    }


    function passGameRole(address _game) public onlyOwner returns (bool) {
        game = _game;

        return true;
    }

    function setBaseUri(string memory uri) public onlyOwner returns (bool) {
        baseURI = uri;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }


    function mint(address account) public {
        require(game == _msgSender(), "SunflowerLandFarm: You are not the game");

        uint256 tokenId = totalSupply() + 1;

        // Create identifiable farm contract
        FarmHolder farm = new FarmHolder();
        farms[tokenId] = address(farm);

        _mint(account, tokenId);
	}

    struct Farm {
        address owner;
        address account;
    }

    function getFarm(uint256 tokenId) public view returns (Farm memory) {
        address account = farms[tokenId];
        address owner = ownerOf(tokenId);

        return Farm({
            account: account,
            owner: owner
        });
    }
}