// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ComprehensiveSample {
    // GAS-005: small variables separated by a full-slot variable can be packed better.
    uint128 public totalStaked;
    uint256 public rewardPerShare;
    uint128 public totalRewards;

    // GAS-004: assigned only in the constructor.
    address public owner;

    // GAS-001: literal initializer can be constant.
    uint256 public protocolFee = 5;

    // Used by GAS-008 duplicate SLOAD examples.
    mapping(address => uint256) public balances;

    // Used by GAS-009 storage slot estimate.
    bool public depositsOpen;

    constructor() {
        owner = msg.sender;
        depositsOpen = true;
    }

    // GAS-002: public function is not called internally.
    function getBalance(address user)
        public
        view
        returns (uint256)
    {
        return balances[user];
    }

    // Guard case for GAS-002: this public function is called internally.
    function internalHelper()
        public
        pure
        returns (uint256)
    {
        return 1;
    }

    function usesInternalHelper()
        external
        pure
        returns (uint256)
    {
        return internalHelper();
    }

    // GAS-003, GAS-006, GAS-007: memory array in external function, length read in loop,
    // and checked increment.
    function sum(uint256[] memory values)
        external
        pure
        returns (uint256 total)
    {
        for (uint256 i = 0; i < values.length; i++) {
            total += values[i];
        }
    }

    // Guard case for GAS-007: memory parameter is mutated, so calldata is not safe.
    function normalizeFirst(uint256[] memory values)
        external
        pure
        returns (uint256)
    {
        values[0] = 1;
        return values[0];
    }

    // GAS-008: same storage read appears twice and can be cached.
    function duplicateStorageRead(address user)
        external
        view
        returns (uint256)
    {
        return balances[user] + balances[user];
    }

    // GAS-010 plus additional GAS-003, GAS-006, GAS-007 findings.
    function sumMatrix(uint256[][] memory matrix)
        external
        pure
        returns (uint256 total)
    {
        for (uint256 i = 0; i < matrix.length; i++) {
            for (uint256 j = 0; j < matrix[i].length; j++) {
                total += matrix[i][j];
            }
        }
    }

    // GAS-011: inline assembly should be reviewed against equivalent Solidity.
    function assemblyIncrement(uint256 value)
        external
        pure
        returns (uint256 result)
    {
        assembly {
            result := add(value, 1)
        }
    }

    function deposit()
        external
        payable
    {
        require(depositsOpen, "deposits closed");

        balances[msg.sender] += msg.value;
    }
}
