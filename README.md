# Gas Analyzer

AST-powered Solidity gas optimization analyzer.

Gas Analyzer is a small static-analysis tool that parses Solidity contracts and reports common gas optimization opportunities. It is designed as a practical rule engine: each rule is isolated, testable, and easy to extend.

## Features

- Solidity AST parsing with `@solidity-parser/parser`
- Modular gas optimization rules
- Console, JSON, and SARIF output
- GitHub Code Scanning workflow example
- Fixture-based regression tests

## Supported Rules

| Rule ID | Severity | Description |
| --- | --- | --- |
| GAS-001 | HIGH | Literal state variable can be `constant` |
| GAS-002 | MEDIUM | Public function can likely be `external` |
| GAS-003 | LOW | Cache array length outside loop |
| GAS-004 | MEDIUM | Constructor-only state variable can be `immutable` |
| GAS-005 | MEDIUM | Packable storage variables can be grouped more efficiently |
| GAS-006 | LOW | Loop increment can use an `unchecked` block |
| GAS-007 | MEDIUM | External read-only dynamic parameter can use `calldata` |

Static analysis is intentionally conservative, but every finding should still be reviewed before changing production Solidity code.

## Installation

```bash
npm install
```

## Usage

Analyze a Solidity contract:

```bash
node index.js contracts/Sample.sol
```

Generate JSON:

```bash
node index.js contracts/Sample.sol --json
```

Generate SARIF:

```bash
node index.js contracts/Sample.sol --sarif
```

Filter by severity:

```bash
node index.js contracts/Sample.sol --severity MEDIUM
```

## Tests

```bash
npm test
```

The test runner parses `tests/fixtures/all-rules.sol` and checks expected detections plus key false-positive guards.

## Project Structure

```text
gas-analyzer/
  analyzer/       Rule orchestration
  ast/            AST helper utilities
  contracts/      Example Solidity contracts
  parser/         Solidity parser wrapper
  reporters/      SARIF reporter
  rules/          Gas optimization rules
  tests/          Regression test fixtures and runner
  utils/          Shared utility functions
  index.js        CLI entrypoint
```

## Roadmap

- Duplicate SLOAD detection
- Storage slot estimator
- Multi-file and directory analysis
- Better inheritance and override awareness
- Rule confidence scoring
- VS Code extension or GitHub App integration

## Author

Yaghoub Adelzadeh
