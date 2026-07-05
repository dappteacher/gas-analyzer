const assert = require("assert");
const childProcess = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const parseContract = require("../parser/parse");
const runRules = require("../analyzer/runRules");
const generateSarif = require("../reporters/sarif");
const RULES = require("../rules/metadata");
const {
    attachGasEstimates,
    summarizeGasEstimates
} = require("../utils/gasEstimate");

const fixture =
    path.join(
        __dirname,
        "fixtures",
        "all-rules.sol"
    );

const ast = parseContract(fixture);
const findings = runRules(ast);
const estimatedFindings =
    attachGasEstimates(findings);
const snapshot =
    path.join(
        __dirname,
        "snapshots",
        "all-rules.json"
    );

function namesFor(ruleId) {
    return findings
        .filter(f => f.rule.id === ruleId)
        .map(f => f.name)
        .filter(Boolean);
}

function count(ruleId) {
    return findings.filter(
        f => f.rule.id === ruleId
    ).length;
}

function normalizeFindings(items) {
    return items.map(f => ({
        id: f.rule.id,
        severity: f.rule.severity,
        line: f.line || null,
        name: f.name || null,
        detail: f.detail || null
    }));
}

function assertSnapshot(name, actual) {
    const serialized =
        `${JSON.stringify(actual, null, 2)}\n`;

    if (
        process.env.UPDATE_SNAPSHOTS === "1" ||
        process.argv.includes("--update-snapshots")
    ) {
        fs.writeFileSync(name, serialized);
        return;
    }

    assert.strictEqual(
        serialized,
        fs.readFileSync(name, "utf8"),
        `${path.basename(name)} snapshot mismatch`
    );
}

function calculateRuleCoverage(items) {
    const expectedRuleIds =
        Object.values(RULES).map(rule => rule.id);

    const coveredRuleIds =
        new Set(
            items.map(f => f.rule.id)
        );

    const missingRuleIds =
        expectedRuleIds.filter(ruleId => {
            return !coveredRuleIds.has(ruleId);
        });

    return {
        totalRules: expectedRuleIds.length,
        coveredRules:
            expectedRuleIds.length -
            missingRuleIds.length,
        missingRuleIds,
        percentage:
            Math.round(
                (
                    (
                        expectedRuleIds.length -
                        missingRuleIds.length
                    ) /
                    expectedRuleIds.length
                ) *
                100
            )
    };
}

assertSnapshot(
    snapshot,
    normalizeFindings(findings)
);

assert(
    namesFor("GAS-001").includes("fee"),
    "literal initialized state variable should be constant candidate"
);

const constantFinding =
    estimatedFindings.find(f => {
        return (
            f.rule.id === "GAS-001" &&
            f.name === "fee"
        );
    });

assert.strictEqual(
    constantFinding.gasEstimate.currentGas,
    2100,
    "constant candidate should estimate current SLOAD gas"
);

assert.strictEqual(
    constantFinding.gasEstimate.optimizedGas,
    3,
    "constant candidate should estimate optimized constant access gas"
);

assert(
    !namesFor("GAS-001").includes("runtimeValue"),
    "runtime expression should not be constant candidate"
);

assert(
    namesFor("GAS-002").includes("exposed"),
    "uncalled public function should be external candidate"
);

assert(
    !namesFor("GAS-002").includes("calledInternally"),
    "internally called public function should not be external candidate"
);

assert(
    namesFor("GAS-004").includes("owner"),
    "constructor-only assignment should be immutable candidate"
);

assert.strictEqual(
    count("GAS-003"),
    3,
    "loop length should be detected for each uncached loop condition"
);

assert.strictEqual(
    count("GAS-006"),
    3,
    "unchecked increment should be detected for each loop increment"
);

assert(
    namesFor("GAS-007").includes("nums"),
    "read-only memory array should be calldata candidate"
);

assert.strictEqual(
    namesFor("GAS-007").filter(name => name === "nums").length,
    1,
    "mutated memory array should not be calldata candidate"
);

assert.strictEqual(
    count("GAS-005"),
    1,
    "storage packing opportunity should be detected"
);

assert(
    namesFor("GAS-008").includes("duplicateRead"),
    "duplicate storage reads should be detected"
);

assert(
    namesFor("GAS-009").includes("AllRules"),
    "storage slot estimate should be reported per contract"
);

assert.strictEqual(
    count("GAS-010"),
    1,
    "nested loop should be detected"
);

assert.strictEqual(
    count("GAS-011"),
    1,
    "inline assembly block should be detected once"
);

const coverage =
    calculateRuleCoverage(findings);

assert.deepStrictEqual(
    coverage.missingRuleIds,
    [],
    "all rule IDs should have fixture coverage"
);

const gasSummary =
    summarizeGasEstimates(estimatedFindings);

assert(
    gasSummary.savedGas > 0 &&
    gasSummary.decreasePercent > 0,
    "gas summary should estimate savings and percent decrease"
);

const sarif = generateSarif(findings, fixture);
const sarifRuleIds =
    sarif.runs[0].tool.driver.rules.map(
        rule => rule.id
    );

assert.strictEqual(
    new Set(sarifRuleIds).size,
    sarifRuleIds.length,
    "SARIF rule metadata should be deduplicated"
);

const cliJson =
    childProcess.execFileSync(
        process.execPath,
        [
            path.join(__dirname, "..", "index.js"),
            path.join(__dirname, "fixtures"),
            "--json",
            "--severity",
            "MEDIUM"
        ],
        {
            encoding: "utf8"
        }
    );

const cliFindings = JSON.parse(cliJson);

assert(
    cliFindings.length > 0,
    "CLI should scan Solidity files in directories"
);

assert(
    cliFindings.every(
        f =>
            f.rule.severity === "MEDIUM" &&
            f.file &&
            f.gasEstimate
    ),
    "CLI should apply severity filter and include file paths plus gas estimates"
);

const sarifOut =
    path.join(
        fs.mkdtempSync(
            path.join(os.tmpdir(), "gas-analyzer-")
        ),
        "report.sarif"
    );

childProcess.execFileSync(
    process.execPath,
    [
        path.join(__dirname, "..", "index.js"),
        fixture,
        "--sarif",
        "--out",
        sarifOut
    ],
    {
        encoding: "utf8"
    }
);

assert(
    fs.existsSync(sarifOut),
    "CLI should write SARIF to --out path"
);

const cliSarif =
    JSON.parse(
        fs.readFileSync(sarifOut, "utf8")
    );

assert(
    cliSarif.runs[0].results.every(
        result =>
            result.locations[0]
                .physicalLocation
                .artifactLocation
                .uri.endsWith("all-rules.sol")
    ),
    "SARIF locations should point to each analyzed file"
);

console.log(
    `${findings.length} findings across ${new Set(findings.map(f => f.rule.id)).size} rules`
);

console.log(
    `Rule coverage: ${coverage.coveredRules}/${coverage.totalRules} (${coverage.percentage}%)`
);
