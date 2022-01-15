// contracts/MyContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleStorage is Ownable {
    uint storedData;

    function set(uint x) public onlyOwner {
        storedData = x;
    }

    function get() public view returns (uint) {
        return storedData;
    }
}