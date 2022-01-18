// contracts/MyContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

struct MintInput {
    address to;
    uint256[] ids;
    uint256[] amounts;
    bytes data;
}

contract SunflowerLandInventory is ERC1155Pausable, Ownable {
    address private game;

    constructor() ERC1155("https://sunflower-land/api/item/{id}.json") payable {}

    function passGameRole(address _game) public onlyOwner returns (bool) {
        game = _game;

        return true;
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function gameMint(
        MintInput memory input
    ) public {
        require(game == _msgSender(), "SunflowerLandInventory: You are not the game");

        _mintBatch(input.to, input.ids, input.amounts, input.data);

        // Emit
    }

    function gameBurn(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) public {
        require(game == _msgSender(), "SunflowerLandInventory: You are not the game");

        // Burn
        _burnBatch(to, ids, amounts);

        // Emit
    }

    function gameTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public {
        require(game == _msgSender(), "SunflowerLandInventory: You are not the game");

        _safeBatchTransferFrom(from, to, ids, amounts, data);

        // Emit
    }

    function gameSetApproval(
        address owner,
        address operator,
        bool approved
    ) internal virtual {
        require(game == _msgSender(), "SunflowerLandInventory: You are not the game");

        _setApprovalForAll(owner, operator, approved);
    }
}