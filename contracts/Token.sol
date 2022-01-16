
   
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";

contract SunflowerLandToken is ERC20Pausable, Ownable {
  address private game;

  constructor() payable ERC20("Sunflower Land", "SFL") {}

  function passGameRole(address _game) public onlyOwner returns (bool) {
    game = _game;

    return true;
  }
  
  function gameMint(address account, uint256 amount) public {
    require(game == _msgSender(), "SunflowerLandToken: You are not the game");
	_mint(account, amount);
 }

  function gameBurn(address account, uint256 amount) public {
    require(game == _msgSender() , "SunflowerLandToken: You are not the game");
	_burn(account, amount);
  }

  function gameTransfer(address from, address to, uint256 amount) public {
    require(game == _msgSender() , "SunflowerLandToken: You are not the game");
	_transfer(from, to, amount);
  }

  function gameApprove(address spender, uint256 amount) public returns (bool) {
    require(game == _msgSender() , "SunflowerLandToken: You are not the game");
    _approve(_msgSender(), spender, amount);
    return true;
  }

  // TODO: Taxation Fee on transferFrom
}
