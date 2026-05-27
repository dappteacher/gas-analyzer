// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AllRules {
    uint128 public packedA;
    uint256 public gap;
    uint128 public packedB;

    address public owner;
    uint256 public fee = 5;
    uint256 public runtimeValue = block.timestamp;

    mapping(address => uint256) public balances;

    constructor() {
        owner = msg.sender;
    }

    function exposed(address user)
        public
        view
        returns (uint256)
    {
        return balances[user];
    }

    function calledInternally()
        public
        pure
        returns (uint256)
    {
        return 1;
    }

    function caller()
        external
        pure
        returns (uint256)
    {
        return calledInternally();
    }

    function sum(uint256[] memory nums)
        external
        pure
        returns (uint256 total)
    {
        for (uint256 i = 0; i < nums.length; i++) {
            total += nums[i];
        }
    }

    function mutate(uint256[] memory nums)
        external
        pure
        returns (uint256)
    {
        nums[0] = 1;
        return nums[0];
    }
}
