const assert = require("assert");
const childProcess = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const parseContract = require("../parser/parse");
const runRules = require("../analyzer/runRules");
const generateSarif = require("../reporters/sarif");

const fixture =
    path.join(
        __dirname,
        "fixtures",
        "all-rules.sol"
    );

const ast = parseContract(fixture);
const findings = runRules(ast);

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

assert(
    namesFor("GAS-001").includes("fee"),
    "literal initialized state variable should be constant candidate"
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
    1,
    "loop length should be detected once"
);

assert.strictEqual(
    count("GAS-006"),
    1,
    "unchecked increment should be detected once"
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
        f => f.rule.severity === "MEDIUM" && f.file
    ),
    "CLI should apply severity filter and include file paths"
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
