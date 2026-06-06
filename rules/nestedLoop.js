const traverse =
    require("../utils/traverse");

const createFinding =
    require("../utils/createFinding");

const RULES =
    require("./metadata");

const LOOP_TYPES = new Set([
    "ForStatement",
    "WhileStatement",
    "DoWhileStatement"
]);

function checkNestedLoops(ast) {
    const findings = [];

    traverse(ast, node => {
        if (!LOOP_TYPES.has(node.type)) {
            return;
        }

        const nestedLoop =
            findNestedLoop(node.body);

        if (!nestedLoop) {
            return;
        }

        findings.push(
            createFinding(
                RULES.GAS_010,
                {
                    line:
                        nestedLoop.loc
                            ? nestedLoop.loc.start.line
                            : "unknown",

                    detail:
                        "Nested loops can grow gas costs quickly with input size"
                }
            )
        );
    });

    return findings;
}

function findNestedLoop(node) {
    let nestedLoop = null;

    traverse(node, child => {
        if (
            !nestedLoop &&
            LOOP_TYPES.has(child.type)
        ) {
            nestedLoop = child;
        }
    });

    return nestedLoop;
}

module.exports =
    checkNestedLoops;
