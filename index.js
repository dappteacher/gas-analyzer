const fs =
    require("fs");

const generateSarif =
    require("./reporters/sarif");

const parseContract =
    require("./parser/parse");

const runRules =
    require("./analyzer/runRules");

const generateSummary =
    require("./utils/summary");

const file = process.argv[2];

const jsonMode =
    process.argv.includes("--json");

const sarifMode =
    process.argv.includes("--sarif");    

const severityIndex =
    process.argv.indexOf(
        "--severity"
    );

let severityFilter = null;

if (severityIndex !== -1) {

    severityFilter =
        process.argv[
            severityIndex + 1
        ];
}

if (!file) {

    console.log("Usage:");

    console.log(
        "node index.js contracts/Sample.sol"
    );

    process.exit(1);
}

const ast = parseContract(file);

let findings = runRules(ast);


// severity filtering
if (severityFilter) {

    findings = findings.filter(f => {

        return (
            f.rule &&
            f.rule.severity ===
                severityFilter
        );
    });
}


// JSON OUTPUT
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

// SARIF OUTPUT

if (sarifMode) {

    const sarif =
        generateSarif(
            findings,
            file
        );

    fs.writeFileSync(
        "results.sarif",
        JSON.stringify(
            sarif,
            null,
            2
        )
    );

    console.log(
        "SARIF report generated: results.sarif"
    );

    process.exit(0);
}

// NORMAL OUTPUT

console.log(
    "\n=== GAS ANALYSIS REPORT ===\n"
);


if (findings.length === 0) {

    console.log(
        "No issues found."
    );

} else {

    findings.forEach(f => {

        if (!f.rule) {

            console.log(
                "INVALID FINDING"
            );

            console.dir(f, {
                depth: null
            });

            return;
        }

        console.log(
            `[${f.rule.id}] [${f.rule.severity}]`
        );

        console.log(
            f.rule.title
        );

        if (f.line) {

            console.log(
                `Line: ${f.line}`
            );
        }

        if (f.name) {

            console.log(
                `Variable: ${f.name}`
            );
        }

        if (f.detail) {

            console.log(
                `Detail: ${f.detail}`
            );
        }

        console.log(
            `Impact: ${f.rule.impact}`
        );

        console.log(
            `Recommendation: ${f.rule.recommendation}`
        );

        console.log("");
    });
}


// SUMMARY

const summary =
    generateSummary(findings);

console.log(
    "=== SUMMARY ===\n"
);

console.log(
    `HIGH: ${summary.HIGH}`
);

console.log(
    `MEDIUM: ${summary.MEDIUM}`
);

console.log(
    `LOW: ${summary.LOW}`
);

console.log(
    `TOTAL: ${summary.TOTAL}`
);