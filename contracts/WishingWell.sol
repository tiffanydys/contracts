
   
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./Token.sol";

contract WishingWell is ERC20Pausable, Ownable {
  using SafeMath for uint256;

    SunflowerLandToken token;
    ERC20 liquidityToken;

    uint private lockedPeriod = 60 * 60 * 24 * 3; // 3 days

    mapping(address => uint) updatedAt;

    constructor(SunflowerLandToken _token, ERC20 _liquidityToken) payable ERC20("WishingWell", "WW") {
        token = _token;
        liquidityToken = _liquidityToken;
    }

    function setLockedPeriod(uint period) public onlyOwner {
        lockedPeriod = period;
    }

    function throwTokens(uint amount) public {
        updatedAt[msg.sender] = block.timestamp;

        liquidityToken.transferFrom(msg.sender, address(this), amount);

        _mint(msg.sender, amount);
    }

    function canCollect(address account) public view returns (bool) {
        uint lastOpenDate = updatedAt[account];

        uint threeDaysAgo = block.timestamp.sub(lockedPeriod); 
        return lastOpenDate < threeDaysAgo;
    }

    function searchWell(address account) private view returns (uint amount) {        
        // Total of 200 LP tokens
        uint tokensInWell = token.balanceOf(address(this));

        // Give them their portion
        return tokensInWell.mul(balanceOf(account)).div(totalSupply());
    }

    function collectFromWell() public {
        require (canCollect(msg.sender), "WishingWell: Good things come for those who wait");
        updatedAt[msg.sender] = block.timestamp;
        uint amount = searchWell(msg.sender);
        require(amount > 0, "WishingWell: Nothing today");

        
        token.transfer(msg.sender, amount);
    }

    function takeOut(uint amount) public {
        require (canCollect(msg.sender), "WishingWell: Wait 3 days after throwing in or collecting");

        updatedAt[msg.sender] = block.timestamp;

        _burn(msg.sender, amount);

        liquidityToken.transfer(msg.sender, amount);
    }

    function lastUpdatedAt(address account) public view returns (uint) {
        return updatedAt[account];
    }
}
