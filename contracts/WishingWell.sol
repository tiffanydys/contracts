
   
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./Token.sol";
import "./Farm.sol";
import "./Uniswap.sol";

contract WishingWell is ERC20Pausable {
  using SafeMath for uint256;

  SunflowerLandToken token;
  SunflowerLandFarm farm;
  IUniswapV2Router02 public immutable uniswapV2Router;

    mapping(address => uint) rewardsOpenedAt;

    constructor(SunflowerLandToken _token) payable ERC20("WishingWell", "WW") {
        token = _token;

        uniswapV2Router = IUniswapV2Router02(0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff);
    }

    function throwTokens(uint farmId) private {
        Farm memory farmNFT = farm.getFarm(farmId);

        // Check they own the farm
        require(
            farmNFT.owner == _msgSender(),
            "SunflowerLand: You do not own this farm"
        );
        
        address[] memory path = new address[](2);

        // Token
        path[0] = address(token);
        // Weth
        path[1] = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270;


        uint[] memory values = uniswapV2Router.getAmountsIn(msg.value, path);

        // Transfer the sender's tokens here
        token.gameTransfer(msg.sender, address(this), values[0]);

        // Approve the router just in case
        token.gameApprove(address(uniswapV2Router), values[0]);

        (uint amountToken, uint amountETH, uint liquidity) = uniswapV2Router.addLiquidityETH{ value: msg.value }(
            address(token),
            // Sunflower Tokens to use
            values[1],
            0, 
            0,
            0x000000000000000000000000000000000000dEaD,
            block.timestamp
        );

        // Mint a wrapped WishingWell token representing liquidity given and send to farm
        _mint(farmNFT.account, liquidity);

        rewardsOpenedAt[msg.sender] = block.timestamp;
  }

    function searchWell(address account) public view returns (uint amount) {        
        uint lastOpenDate = rewardsOpenedAt[account];

        // Block timestamp is seconds based
        uint oneDayAgo = block.timestamp.sub(60 * 60 * 24 * 1); 
        require(lastOpenDate < oneDayAgo, "NOTHING_IN_WELL");
        
        // 10 / 100 = 0.10%
        uint luck = balanceOf(account).div(totalSupply());

        // Total of 200 LP tokens
        uint tokensInWell = token.balanceOf(address(this));

        // 200 * 0.10% = 20
        return tokensInWell.mul(luck);
    }

    function collectFromWell(uint farmId) public {
        Farm memory farmNFT = farm.getFarm(farmId);

        // Check they own the farm
        require(
            farmNFT.owner == _msgSender(),
            "SunflowerLand: You do not own this farm"
        );

        uint amount = searchWell(farmNFT.account);

        require(amount > 0, "NO_REWARD_AMOUNT");

        rewardsOpenedAt[msg.sender] = block.timestamp;

        token.gameTransfer(address(this), msg.sender, amount);
    }
}
