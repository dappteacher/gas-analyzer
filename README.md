# Gas Analyzer

A modular Solidity gas optimization analyzer built with JavaScript and AST-based static analysis.

---

# Overview

Gas Analyzer is a lightweight static analysis framework for Solidity smart contracts.

It detects:

* Gas optimization opportunities
* Storage inefficiencies
* Loop-related optimizations
* Visibility improvements
* Immutable/constant candidates
* Calldata optimizations

The project is inspired by professional Web3 tooling such as:

* Slither
* MythX
* Semgrep
* CodeQL

---

# Features

## AST-Based Static Analysis

* Solidity AST parsing
* Recursive AST traversal
* Parser abstraction layer
* Modular rule engine

---

## Optimization Rules

### GAS-001 — Constant Variable Detection

Detects state variables that can use:

```solidity
constant
```

---

### GAS-002 — Public To External

Detects public functions that can be converted to:

```solidity
external
```

---

### GAS-003 — Cache Array Length

Detects repeated:

```solidity
array.length
```

reads inside loops.

---

### GAS-004 — Immutable Variable Detection

Detects variables assigned only in constructors.

---

### GAS-005 — Storage Packing Analysis

Detects inefficient storage variable ordering.

---

### GAS-006 — Unchecked Increment

Detects loop increments that can use:

```solidity
unchecked {
    ++i;
}
```

---

### GAS-007 — Calldata Optimization

Detects memory parameters that can use:

```solidity
calldata
```

---

# Architecture

```text
.
├── analyzer/
│   └── runRules.js
│
├── ast/
│   ├── functions.js
│   └── loops.js
│
├── contracts/
│   └── Sample.sol
│
├── parser/
│   └── parse.js
│
├── reporters/
│   └── sarif.js
│
├── rules/
│   ├── calldataOptimization.js
│   ├── constantVariable.js
│   ├── immutableVariable.js
│   ├── loopLength.js
│   ├── metadata.js
│   ├── publicToExternal.js
│   ├── storagePacking.js
│   └── uncheckedIncrement.js
│
├── utils/
│   ├── createFinding.js
│   ├── summary.js
│   └── traverse.js
│
└── index.js
```

---

# Installation

## Clone Repository

```bash
git clone <your-repository-url>
cd gas-analyzer-version2
```

---

## Install Dependencies

```bash
npm install
```

---

# Usage

## Standard Report

```bash
node index.js contracts/Sample.sol
```

---

## JSON Output

```bash
node index.js contracts/Sample.sol --json
```

---

## SARIF Export

```bash
node index.js contracts/Sample.sol --sarif
```

This generates:

```text
results.sarif
```

---

## Severity Filtering

### HIGH Only

```bash
node index.js contracts/Sample.sol --severity HIGH
```

### MEDIUM Only

```bash
node index.js contracts/Sample.sol --severity MEDIUM
```

### LOW Only

```bash
node index.js contracts/Sample.sol --severity LOW
```

---

# Example Output

```text
=== GAS ANALYSIS REPORT ===

[GAS-001] [HIGH]
Variable can be constant
Line: 13
Variable: fee
Impact: Reduces storage gas costs
Recommendation: Use constant for immutable fixed values

[GAS-003] [LOW]
Cache array length outside loop
Line: 29
Detail: Array length is read during every loop iteration
Impact: Avoids repeated length reads
Recommendation: Store array length in local variable

=== SUMMARY ===

HIGH: 1
MEDIUM: 3
LOW: 2
TOTAL: 6
```

---

# GitHub Actions Integration

The project includes GitHub Actions support.

Workflow location:

```text
.github/workflows/gas-analyzer.yml
```

Every push or pull request automatically runs the analyzer.

---

# SARIF + GitHub Code Scanning

Gas Analyzer supports SARIF output.

This allows:

* GitHub Security integration
* Pull request annotations
* CI/CD security reporting
* IDE integration

---

# Technical Highlights

* AST traversal engine
* Semantic analysis
* Parser abstraction layer
* Modular rule architecture
* CLI tooling
* Structured findings
* SARIF reporting
* CI/CD integration

---

# Future Roadmap

## Planned Features

* CFG (Control Flow Graph) analysis
* Duplicate SLOAD detection
* Expensive operations inside loops
* Nested loop analysis
* Solidity version awareness
* VSCode extension
* GitHub PR annotations
* AI-assisted optimization suggestions
* SaaS dashboard

---

# Why This Project Matters

Gas Analyzer is designed as a foundation for:

* Web3 developer tooling
* Smart contract optimization
* Automated audit tooling
* Security infrastructure
* AI-powered smart contract analysis

---

# License

MIT License

---

# Author

Yaghoub Adelzadeh
