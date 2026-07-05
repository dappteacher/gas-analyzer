// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MutableConstantCandidate {
    uint256 public fee = 5;

    function setFee(uint256 newFee) external {
        fee = newFee;
    }
}
