# Gas Analyzer v0.3

AST-powered Solidity Gas Optimization Analyzer.

Gas Analyzer is an open-source static analysis tool for Solidity smart contracts that detects gas inefficiencies and optimization opportunities through Abstract Syntax Tree (AST) analysis.

It helps developers, auditors, and protocol teams identify common gas-related issues before deployment and generate reports compatible with modern security tooling.

Static analysis is intentionally conservative, but every finding should still be reviewed before changing production Solidity code.

---

## Features

### Static Analysis Engine

- AST-based Solidity analysis
- Modular rule architecture
- Extensible rule engine
- Fast contract inspection
- File and directory analysis
- Storage slot estimation
- Nested loop analysis
- Inline assembly optimization review
- Automatic heuristic gas estimates before and after recommendations

### Gas Optimization Rules

Currently supported:

| Rule ID | Severity | Description |
| --- | --- | --- |
| GAS-001 | HIGH | Literal state variable can be `constant` |
| GAS-002 | MEDIUM | Public function can likely be `external` |
| GAS-003 | LOW | Cache array length outside loop |
| GAS-004 | MEDIUM | Constructor-only state variable can be `immutable` |
| GAS-005 | MEDIUM | Packable storage variables can be grouped more efficiently |
| GAS-006 | LOW | Loop increment can use an `unchecked` block |
| GAS-007 | MEDIUM | External read-only dynamic parameter can use `calldata` |
| GAS-008 | MEDIUM | Duplicate storage read can be cached locally |
| GAS-009 | LOW | Estimate contract storage slot usage |
| GAS-010 | HIGH | Nested loop can cause rapidly growing gas costs |
| GAS-011 | LOW | Inline assembly should be reviewed for gas value |

### Report Formats

- Human-readable console output
- JSON export
- SARIF export
- Custom SARIF output path with `--out`
- Per-finding gas estimate data in console and JSON output

### CI/CD Integration

- GitHub Actions
- GitHub Code Scanning
- SARIF-compatible security dashboards

### Quality Assurance

- Automated test framework
- Rule validation suite
- Snapshot testing
- Rule coverage metrics
- Regression testing support

---

## Architecture

```text
Solidity Contract
        |
        v
Solidity Parser
        |
        v
AST Representation
        |
        v
Rule Engine
        |
        +--> Console
        +--> JSON
        +--> SARIF
```

---

## Installation

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

## Usage

Analyze a Solidity contract:

```bash
node index.js contracts/Sample.sol
```

Analyze every Solidity file in a directory:

```bash
node index.js contracts
```

Show CLI help:

```bash
node index.js --help
```

Filter by severity:

```bash
node index.js contracts/Sample.sol --severity MEDIUM
```

Severity values are case-insensitive:

```bash
node index.js contracts --severity medium
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
    "rule": {
      "id": "GAS-001",
      "title": "Variable can be constant",
      "severity": "HIGH",
      "impact": "Reduces storage gas costs",
      "recommendation": "Use constant for immutable fixed values"
    },
    "line": 28,
    "name": "fee",
    "gasEstimate": {
      "estimable": true,
      "currentGas": 2100,
      "optimizedGas": 3,
      "savedGas": 2097,
      "decreasePercent": 99.86,
      "unit": "per state variable read",
      "confidence": "medium",
      "assumption": "Replaces an SLOAD with a compile-time constant access"
    },
    "file": "contracts/Sample.sol"
  }
]
```

---

## Gas Estimation

Gas Analyzer adds a heuristic `gasEstimate` to each finding where a static estimate is meaningful.

Each estimate includes:

- `currentGas`: estimated cost before applying the recommendation
- `optimizedGas`: estimated cost after applying the recommendation
- `savedGas`: estimated gas saved
- `decreasePercent`: estimated percentage decrease
- `unit`: what the estimate applies to, such as per read, per call, or per loop iteration
- `confidence`: rough confidence level
- `assumption`: the assumption behind the estimate

Example for replacing a storage variable with `constant`:

```text
Gas Estimate: 2100 -> 3 per state variable read
Estimated Savings: 2097 gas (99.86%, medium confidence)
```

The console summary also includes an aggregate heuristic estimate:

```text
=== GAS ESTIMATE ===

ESTIMABLE FINDINGS: 11
CURRENT: 25150
AFTER RECOMMENDATIONS: 302
SAVINGS: 24848 (98.8%)
NOTE: Static heuristic estimate. Use compiler/runtime gas reports for exact transaction costs.
```

These numbers are useful for prioritization, but they are not a substitute for compiler output, Foundry gas snapshots, Hardhat gas reporter, or transaction-level traces. Real gas depends on compiler version, optimizer settings, calldata size, storage warmth, branching, and runtime inputs.

---

## SARIF Output

Generate SARIF output:

```bash
node index.js contracts/Sample.sol --sarif
```

By default, this creates:

```text
results.sarif
```

Write SARIF to a custom path:

```bash
node index.js contracts --sarif --out gas-results.sarif
```

SARIF output can be uploaded to GitHub Code Scanning or other SARIF-compatible platforms.

---

## Example

### Contract

```solidity
pragma solidity ^0.8.24;

contract Sample {
    uint256 public fee = 5;
}
```

### Analyzer Output

```text
=== GAS ANALYSIS REPORT ===

[GAS-001] [HIGH]
Variable can be constant
File: contracts/Sample.sol
Line: 28
Name: fee
Impact: Reduces storage gas costs
Recommendation: Use constant for immutable fixed values

=== SUMMARY ===

HIGH: 1
MEDIUM: 0
LOW: 0
TOTAL: 1
```

---

## Supported Rules

### GAS-001 - Variable Can Be Constant

Detects state variables initialized with compile-time literal-style values that can be declared as `constant`.

Example:

```solidity
uint256 public fee = 5;
```

Suggested:

```solidity
uint256 public constant fee = 5;
```

The rule avoids runtime expressions such as `block.timestamp` or `msg.sender`.

---

### GAS-002 - Function Can Be External

Detects public functions that are not called internally and can likely be marked `external`.

Example:

```solidity
function foo() public {}
```

Suggested:

```solidity
function foo() external {}
```

This rule tracks simple internal calls and skips constructors, fallback functions, receive functions, and override functions.

---

### GAS-003 - Cache Array Length

Detects repeated reads of `.length` inside loop conditions.

Example:

```solidity
for (uint256 i = 0; i < users.length; i++) {
    total += users[i];
}
```

Suggested:

```solidity
uint256 length = users.length;

for (uint256 i = 0; i < length; i++) {
    total += users[i];
}
```

---

### GAS-004 - Variable Can Be Immutable

Detects state variables assigned in the constructor and not reassigned elsewhere.

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

constructor() {
    owner = msg.sender;
}
```

---

### GAS-005 - Storage Packing Optimization

Detects storage variable ordering where smaller packable variables can be grouped more efficiently.

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

### GAS-006 - Unchecked Increment

Detects loop increments that can potentially use `unchecked` to avoid overflow checks.

Example:

```solidity
for (uint256 i = 0; i < length; i++) {
    total += users[i];
}
```

Suggested pattern:

```solidity
for (uint256 i = 0; i < length;) {
    total += users[i];

    unchecked {
        i++;
    }
}
```

Review loop bounds before applying this optimization.

---

### GAS-007 - Calldata Optimization

Detects external functions using read-only dynamic `memory` parameters that can use `calldata`.

Example:

```solidity
function sum(uint256[] memory nums)
    external
    pure
    returns (uint256)
{}
```

Suggested:

```solidity
function sum(uint256[] calldata nums)
    external
    pure
    returns (uint256)
{}
```

The rule skips parameters that are mutated in the function body.

---

### GAS-008 - Duplicate SLOAD Detection

Detects repeated reads of the same state variable or mapping/index access inside a function.

Example:

```solidity
function multiRead(address user)
    external
    view
    returns (uint256 total)
{
    total += balances[user];
    total += balances[user];
}
```

Suggested:

```solidity
function multiRead(address user)
    external
    view
    returns (uint256 total)
{
    uint256 balance = balances[user];

    total += balance;
    total += balance;
}
```

---

### GAS-009 - Storage Slot Estimate

Estimates how many storage slots a contract's state variables occupy, excluding `constant` and `immutable` variables.

Example:

```solidity
contract Example {
    uint128 a;
    uint256 b;
    uint128 c;
}
```

Analyzer detail:

```text
Estimated storage slots: 3 for 3 state variables
```

Use this estimate to review storage layout before reordering variables. The estimate is intentionally lightweight and should be treated as a guide, not a replacement for compiler storage-layout output.

---

### GAS-010 - Nested Loop Analysis

Detects loops inside other loops. Nested loops can become expensive quickly when either loop depends on user-controlled or unbounded input.

Example:

```solidity
for (uint256 i = 0; i < matrix.length; i++) {
    for (uint256 j = 0; j < matrix[i].length; j++) {
        total += matrix[i][j];
    }
}
```

Suggested approaches:

- Avoid nested loops over unbounded input
- Cache repeated values where possible
- Precompute results off-chain or across multiple transactions
- Add practical input limits when the loop is unavoidable

---

### GAS-011 - Assembly Optimization Checks

Detects inline assembly blocks and asks for gas-focused review.

Example:

```solidity
assembly {
    result := add(value, 1)
}
```

Inline assembly can be valuable, but it can also bypass optimizer assumptions or duplicate what modern Solidity already compiles efficiently. Review whether the assembly block is cheaper, safer, and clearer than equivalent Solidity.

---

## Running Tests

Execute the complete test suite:

```bash
npm test
```

The test runner:

- Parses `tests/fixtures/all-rules.sol`
- Compares normalized findings against `tests/snapshots/all-rules.json`
- Checks important false-positive guards
- Verifies CLI directory scanning, severity filtering, and SARIF output
- Reports rule coverage metrics

Example:

```text
8 findings across 8 rules
Rule coverage: 8/8 (100%)
```

Update snapshots after intentional rule-output changes:

```bash
npm run test:update-snapshots
```

Every rule ID in `rules/metadata.js` should be represented in the fixture so rule coverage stays meaningful.

---

## GitHub Code Scanning

Generate SARIF:

```bash
node index.js contracts --sarif --out results.sarif
```

Upload results through GitHub Actions and review findings directly inside pull requests.

The workflow in `.github/workflows/gas-analyzer.yml` installs dependencies, runs tests, generates SARIF, and uploads it to GitHub Code Scanning.

---

## Project Structure

```text
gas-analyzer/
  analyzer/
    runRules.js

  ast/
    functions.js
    loops.js
    storage.js
    variables.js

  contracts/
    Sample.sol

  parser/
    parse.js

  reporters/
    sarif.js

  rules/
    assemblyOptimization.js
    calldataOptimization.js
    constantVariable.js
    duplicateSload.js
    immutableVariable.js
    loopLength.js
    metadata.js
    nestedLoop.js
    publicToExternal.js
    storageSlotEstimator.js
    storagePacking.js
    uncheckedIncrement.js

  tests/
    fixtures/
      all-rules.sol
    snapshots/
      all-rules.json
    run.js

  utils/
    createFinding.js
    gasEstimate.js
    summary.js
    traverse.js

  .github/
    workflows/
      gas-analyzer.yml

  index.js
  package.json
  README.md
```

---

## Roadmap

### v1.0

- SaaS dashboard
- Multi-contract analysis
- AI-powered optimization suggestions

### v0.2

- Duplicate SLOAD detection
- Snapshot testing
- Rule coverage metrics

### v0.3

- Storage slot estimator
- Nested loop analysis
- Assembly optimization checks

### v0.4

- VS Code extension
- GitHub App integration

---

## Contributing

Contributions are welcome.

If you would like to add a new rule, improve analysis accuracy, or expand testing coverage, please open an issue before submitting large changes.

When adding a rule:

- Add the rule metadata in `rules/metadata.js`
- Add the rule implementation in `rules/`
- Wire it into `analyzer/runRules.js`
- Add fixture coverage in `tests/fixtures/all-rules.sol`
- Update `tests/snapshots/all-rules.json`
- Confirm rule coverage remains complete with `npm test`

---

## License

ISC License.

---

## Author

Yaghoub Adelzadeh

Smart Contract Engineer, Security Researcher, Blockchain Educator

GitHub: https://github.com/dappteacher

LinkedIn: https://linkedin.com/in/dappteacher

---

If this project helps you optimize your Solidity contracts, consider giving it a star.
