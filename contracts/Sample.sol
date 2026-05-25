// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Sample {

    // -------------------------------------------------
    // STORAGE PACKING TESTS
    // -------------------------------------------------

    uint128 public totalStaked;

    uint256 public rewardPerShare;

    uint128 public totalRewards;


    // -------------------------------------------------
    // IMMUTABLE TEST
    // -------------------------------------------------

    address public owner;


    // -------------------------------------------------
    // CONSTANT TEST
    // -------------------------------------------------

    uint256 public fee = 5;


    // -------------------------------------------------
    // DUPLICATE SLOAD TEST (future rule)
    // -------------------------------------------------

    mapping(address => uint256)
        public balances;


    // -------------------------------------------------
    // CONSTRUCTOR
    // -------------------------------------------------

    constructor() {

        owner = msg.sender;
    }


    // -------------------------------------------------
    // PUBLIC -> EXTERNAL TEST
    // -------------------------------------------------

    function getBalance(
        address user
    )
        public
        view
        returns(uint256)
    {

        return balances[user];
    }


    // -------------------------------------------------
    // CALLDATA + LOOP RULES
    // -------------------------------------------------

    function sum(
        uint256[] memory nums
    )
        external
        pure
        returns(uint256)
    {

        uint256 total = 0;

        for(
            uint256 i = 0;
            i < nums.length;
            i++
        ) {

            total += nums[i];
        }

        return total;
    }


    // -------------------------------------------------
    // EXPENSIVE LOOP TEST
    // -------------------------------------------------

    function multiRead(
        address user,
        uint256[] memory ids
    )
        external
        view
        returns(uint256 total)
    {

        for(
            uint256 i = 0;
            i < ids.length;
            i++
        ) {

            // duplicate SLOAD candidate
            total += balances[user];

            total += balances[user];
        }
    }


    // -------------------------------------------------
    // STORAGE WRITE TEST
    // -------------------------------------------------

    function deposit()
        external
        payable
    {

        balances[msg.sender] +=
            msg.value;
    }
}