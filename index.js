#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const generateSarif =
    require("./reporters/sarif");

const parseContract =
    require("./parser/parse");

const runRules =
    require("./analyzer/runRules");

const generateSummary =
    require("./utils/summary");

const {
    attachGasEstimates,
    summarizeGasEstimates
} = require("./utils/gasEstimate");

const args = process.argv.slice(2);

if (
    args.includes("--help") ||
    args.includes("-h")
) {
    printUsage();
    process.exit(0);
}

const target = getTargetArg(args);

const jsonMode =
    args.includes("--json");

const sarifMode =
    args.includes("--sarif");

const severityFilter =
    getOptionValue(args, "--severity");

const outputFile =
    getOptionValue(args, "--out") ||
    "results.sarif";

if (!target) {
    printUsage();
    process.exit(1);
}

const files = collectSolidityFiles(target);

if (files.length === 0) {
    console.error(
        `No Solidity files found in ${target}`
    );

    process.exit(1);
}

let findings = files.flatMap(file => {
    const ast = parseContract(file);

    return runRules(ast).map(finding => ({
        ...finding,
        file
    }));
});

if (severityFilter) {
    const normalizedSeverity =
        severityFilter.toUpperCase();

    findings = findings.filter(f => {
        return (
            f.rule &&
            f.rule.severity === normalizedSeverity
        );
    });
}

findings = attachGasEstimates(findings);

if (jsonMode) {
    console.log(
        JSON.stringify(
            findings,
            null,
            2
        )
    );

    process.exit(0);
}

if (sarifMode) {
    const sarif =
        generateSarif(
            findings,
            target
        );

    fs.writeFileSync(
        outputFile,
        JSON.stringify(
            sarif,
            null,
            2
        )
    );

    console.log(
        `SARIF report generated: ${outputFile}`
    );

    process.exit(0);
}

printConsoleReport(findings);

function printUsage() {
    console.log("Usage:");
    console.log(
        "  node index.js <file-or-directory> [--json] [--sarif] [--out results.sarif] [--severity HIGH|MEDIUM|LOW]"
    );
}

function getOptionValue(argv, option) {
    const index = argv.indexOf(option);

    if (index === -1) {
        return null;
    }

    return argv[index + 1] || null;
}

function getTargetArg(argv) {
    const optionsWithValues =
        new Set([
            "--severity",
            "--out"
        ]);

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];

        if (optionsWithValues.has(arg)) {
            i++;
            continue;
        }

        if (!arg.startsWith("-")) {
            return arg;
        }
    }

    return null;
}

function collectSolidityFiles(targetPath) {
    const absoluteTarget =
        path.resolve(targetPath);

    if (!fs.existsSync(absoluteTarget)) {
        console.error(
            `Path not found: ${targetPath}`
        );

        process.exit(1);
    }

    const stat = fs.statSync(absoluteTarget);

    if (stat.isFile()) {
        return absoluteTarget.endsWith(".sol")
            ? [absoluteTarget]
            : [];
    }

    const entries =
        fs.readdirSync(
            absoluteTarget,
            {
                withFileTypes: true
            }
        );

    return entries.flatMap(entry => {
        const entryPath =
            path.join(
                absoluteTarget,
                entry.name
            );

        if (entry.isDirectory()) {
            return collectSolidityFiles(entryPath);
        }

        return entry.isFile() &&
            entry.name.endsWith(".sol")
            ? [entryPath]
            : [];
    });
}

function printConsoleReport(findings) {
    console.log(
        "\n=== GAS ANALYSIS REPORT ===\n"
    );

    if (findings.length === 0) {
        console.log("No issues found.");
    } else {
        findings.forEach(f => {
            if (!f.rule) {
                console.log("INVALID FINDING");
                console.dir(f, {
                    depth: null
                });

                return;
            }

            console.log(
                `[${f.rule.id}] [${f.rule.severity}]`
            );

            console.log(f.rule.title);

            if (f.file) {
                console.log(
                    `File: ${path.relative(process.cwd(), f.file)}`
                );
            }

            if (f.line) {
                console.log(`Line: ${f.line}`);
            }

            if (f.name) {
                console.log(`Name: ${f.name}`);
            }

            if (f.detail) {
                console.log(`Detail: ${f.detail}`);
            }

            console.log(
                `Impact: ${f.rule.impact}`
            );

            console.log(
                `Recommendation: ${f.rule.recommendation}`
            );

            if (
                f.gasEstimate &&
                f.gasEstimate.estimable
            ) {
                console.log(
                    `Gas Estimate: ${f.gasEstimate.currentGas} -> ${f.gasEstimate.optimizedGas} ${f.gasEstimate.unit}`
                );

                console.log(
                    `Estimated Savings: ${f.gasEstimate.savedGas} gas (${f.gasEstimate.decreasePercent}%, ${f.gasEstimate.confidence} confidence)`
                );
            } else if (f.gasEstimate) {
                console.log(
                    `Gas Estimate: ${f.gasEstimate.assumption}`
                );
            }

            console.log("");
        });
    }

    const summary =
        generateSummary(findings);

    console.log("=== SUMMARY ===\n");
    console.log(`HIGH: ${summary.HIGH}`);
    console.log(`MEDIUM: ${summary.MEDIUM}`);
    console.log(`LOW: ${summary.LOW}`);
    console.log(`TOTAL: ${summary.TOTAL}`);

    const gasSummary =
        summarizeGasEstimates(findings);

    console.log("\n=== GAS ESTIMATE ===\n");
    console.log(
        `ESTIMABLE FINDINGS: ${gasSummary.estimableFindings}`
    );
    console.log(
        `CURRENT: ${gasSummary.currentGas}`
    );
    console.log(
        `AFTER RECOMMENDATIONS: ${gasSummary.optimizedGas}`
    );
    console.log(
        `SAVINGS: ${gasSummary.savedGas} (${gasSummary.decreasePercent}%)`
    );
    console.log(
        `NOTE: ${gasSummary.note}`
    );
}
