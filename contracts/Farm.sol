// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

struct Farm {
    address owner;
    address account;
}

// Should we make pausable as well?
contract SunflowerLandFarm is ERC721Enumerable, Ownable {
    address private game;

    /*
     * Each farm has its own contract address deployed
     * This enables the NFT to actually own the resources and tokens
    */
    mapping (uint => address) farms;

    mapping (address => bool) gameRoles;

    string private baseURI = "https://sunflower-land.com/api/nfts/farm/";

    constructor() public ERC721("Sunflower Land Farm", "SLF") {
        gameRoles[msg.sender] = true;
    }


    function addGameRole(address _game) public onlyOwner {
        gameRoles[_game] = true;
    }

    function removeGameRole(address _game) public onlyOwner {
        gameRoles[_game] = false;
    }

    function setBaseUri(string memory uri) public onlyOwner returns (bool) {
        baseURI = uri;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }


    function mint(address account) public {
        require(gameRoles[_msgSender()] == true, "SunflowerLandFarm: You are not the game");

        uint256 tokenId = totalSupply() + 1;

        // Create identifiable farm contract
        FarmHolder farm = new FarmHolder();
        farms[tokenId] = address(farm);

        _mint(account, tokenId);
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


/**
 * @dev _Available since v3.1._
 */
interface IERC1155Receiver is IERC165 {
    /**
     * @dev Handles the receipt of a single ERC1155 token type. This function is
     * called at the end of a `safeTransferFrom` after the balance has been updated.
     *
     * NOTE: To accept the transfer, this must return
     * `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`
     * (i.e. 0xf23a6e61, or its own function selector).
     *
     * @param operator The address which initiated the transfer (i.e. msg.sender)
     * @param from The address which previously owned the token
     * @param id The ID of the token being transferred
     * @param value The amount of tokens being transferred
     * @param data Additional data with no specified format
     * @return `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))` if transfer is allowed
     */
    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external returns (bytes4);

    /**
     * @dev Handles the receipt of a multiple ERC1155 token types. This function
     * is called at the end of a `safeBatchTransferFrom` after the balances have
     * been updated.
     *
     * NOTE: To accept the transfer(s), this must return
     * `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`
     * (i.e. 0xbc197c81, or its own function selector).
     *
     * @param operator The address which initiated the batch transfer (i.e. msg.sender)
     * @param from The address which previously owned the token
     * @param ids An array containing ids of each token being transferred (order and length must match values array)
     * @param values An array containing amounts of each token being transferred (order and length must match ids array)
     * @param data Additional data with no specified format
     * @return `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))` if transfer is allowed
     */
    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external returns (bytes4);
}

contract FarmHolder is ERC165, IERC1155Receiver {
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(IERC1155Receiver).interfaceId || super.supportsInterface(interfaceId);
    }
}