# ⛽ Gas Analyzer

AST-powered Solidity Gas Optimization Analyzer.

Gas Analyzer is an open-source static analysis tool for Solidity smart contracts that detects gas inefficiencies and optimization opportunities through Abstract Syntax Tree (AST) analysis.

It helps developers, auditors, and protocol teams identify common gas-related issues before deployment and generate reports compatible with modern security tooling.

---

## ✨ Features

### Static Analysis Engine

- AST-based Solidity analysis
- Modular rule architecture
- Extensible rule engine
- Fast contract inspection

### Gas Optimization Rules

Currently supported:

| Rule ID | Severity | Description |
|----------|----------|-------------|
| GAS-001 | HIGH | Variable can be constant |
| GAS-002 | MEDIUM | Function can be external |
| GAS-003 | LOW | Cache array length outside loop |
| GAS-004 | MEDIUM | Variable can be immutable |
| GAS-005 | MEDIUM | Storage packing optimization |
| GAS-006 | LOW | Unchecked increment optimization |
| GAS-007 | MEDIUM | Use calldata instead of memory |

### Report Formats

- Human-readable console output
- JSON export
- SARIF export

### CI/CD Integration

- GitHub Actions
- GitHub Code Scanning
- SARIF-compatible security dashboards

### Quality Assurance

- Automated test framework
- Rule validation suite
- Regression testing support

---

# Architecture

```text
┌─────────────────────┐
│ Solidity Contract   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Solidity Parser     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ AST Representation  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Rule Engine         │
└──────────┬──────────┘
           │
 ┌─────────┼─────────┐
 ▼         ▼         ▼
Console    JSON     SARIF
```

---

# Installation

Clone the repository:

```bash
git clone https://github.com/dappteacher/gas-analyzer.git

cd gas-analyzer
```

Install dependencies:

```bash
npm install
```

---

# Usage

Analyze a Solidity contract:

```bash
node index.js contracts/Sample.sol
```

---

## JSON Output

Generate machine-readable JSON:

```bash
node index.js contracts/Sample.sol --json
```

Example:

```json
[
  {
    "id": "GAS-001",
    "severity": "HIGH",
    "name": "fee"
  }
]
```

---

## SARIF Output

Generate SARIF output:

```bash
node index.js contracts/Sample.sol --sarif
```

This creates:

```text
results.sarif
```

which can be uploaded to GitHub Code Scanning or other SARIF-compatible platforms.

---

# Example

## Contract

```solidity
pragma solidity ^0.8.24;

contract Sample {

    uint256 public fee = 5;

}
```

## Analyzer Output

```text
=== GAS ANALYSIS REPORT ===

[GAS-001] [HIGH]

Variable can be constant

Line: 5

Variable: fee

Impact:
Reduces storage gas costs

Recommendation:
Use constant for immutable fixed values
```

---

# Supported Rules

## GAS-001 — Variable Can Be Constant

Detects state variables initialized with fixed values that can be declared as `constant`.

Example:

```solidity
uint256 public fee = 5;
```

Suggested:

```solidity
uint256 public constant fee = 5;
```

---

## GAS-002 — Function Can Be External

Detects public functions that are never called internally.

Example:

```solidity
function foo() public {}
```

Suggested:

```solidity
function foo() external {}
```

---

## GAS-003 — Cache Array Length

Detects repeated reads of `.length` inside loops.

Example:

```solidity
for(uint i = 0; i < users.length; i++)
```

Suggested:

```solidity
uint len = users.length;

for(uint i = 0; i < len; i++)
```

---

## GAS-004 — Variable Can Be Immutable

Detects variables assigned only in the constructor.

Example:

```solidity
address public owner;

constructor() {
    owner = msg.sender;
}
```

Suggested:

```solidity
address public immutable owner;
```

---

## GAS-005 — Storage Packing Optimization

Detects inefficient ordering of storage variables.

Example:

```solidity
uint128 a;

uint256 b;

uint128 c;
```

Suggested:

```solidity
uint128 a;

uint128 c;

uint256 b;
```

---

## GAS-006 — Unchecked Increment

Detects loop increments that can use `unchecked`.

Example:

```solidity
for(uint i = 0; i < len; i++)
```

Suggested:

```solidity
unchecked {
    ++i;
}
```

---

## GAS-007 — Calldata Optimization

Detects external functions using `memory` arrays unnecessarily.

Example:

```solidity
function sum(
    uint256[] memory nums
)
    external
{}
```

Suggested:

```solidity
function sum(
    uint256[] calldata nums
)
    external
{}
```

---

# Running Tests

Execute the complete test suite:

```bash
npm test
```

Example:

```text
PASS immutable/valid.sol
PASS immutable/invalid.sol
PASS calldata/valid.sol
PASS calldata/invalid.sol

4/4 tests passed
```

---

# GitHub Code Scanning

Generate SARIF:

```bash
node index.js contracts/Sample.sol --sarif
```

Upload results through GitHub Actions and review findings directly inside Pull Requests.

---

# Project Structure

```text
gas-analyzer/

├── analyzer/
│   └── runRules.js
│
├── parser/
│   └── parse.js
│
├── rules/
│   ├── constantVariable.js
│   ├── immutableVariable.js
│   ├── storagePacking.js
│   ├── calldataOptimization.js
│   └── ...
│
├── exporters/
│   ├── jsonExporter.js
│   └── sarifExporter.js
│
├── utils/
│
├── tests/
│   ├── contracts/
│   ├── expected/
│   └── runner.js
│
├── .github/
│   └── workflows/
│
├── index.js
├── package.json
└── README.md
```

---

# Roadmap

## v0.2

- Duplicate SLOAD detection
- Snapshot testing
- Rule coverage metrics

## v0.3

- Storage slot estimator
- Nested loop analysis
- Assembly optimization checks

## v0.4

- VS Code extension
- GitHub App integration

## v1.0

- SaaS dashboard
- Multi-contract analysis
- AI-powered optimization suggestions

---

# Contributing

Contributions are welcome.

If you would like to add a new rule, improve analysis accuracy, or expand testing coverage, please open an issue before submitting large changes.

---

# Author

**Yaghoub Adelzadeh**

Senior Smart Contract Engineer • Security Researcher • Blockchain Educator

GitHub: https://github.com/YOUR_USERNAME

LinkedIn: https://linkedin.com/in/YOUR_PROFILE

---

⭐ If this project helps you optimize your Solidity contracts, consider giving it a star.