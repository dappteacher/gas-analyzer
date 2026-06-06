const traverse =
    require("../utils/traverse");

const createFinding =
    require("../utils/createFinding");

const RULES =
    require("./metadata");

function checkAssemblyOptimization(ast) {
    const findings = [];

    traverse(ast, node => {
        if (!isAssemblyNode(node)) {
            return;
        }

        findings.push(
            createFinding(
                RULES.GAS_011,
                {
                    line:
                        node.loc
                            ? node.loc.start.line
                            : "unknown",

                    detail:
                        "Inline assembly can bypass optimizer assumptions and should be reviewed for cheaper Solidity equivalents"
                }
            )
        );
    });

    return findings;
}

function isAssemblyNode(node) {
    return (
        node &&
        typeof node.type === "string" &&
        (
            node.type === "InlineAssemblyStatement" ||
            node.type === "AssemblyStatement"
        )
    );
}

module.exports =
    checkAssemblyOptimization;
