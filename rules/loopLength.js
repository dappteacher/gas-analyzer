const traverse =
    require("../utils/traverse");

const createFinding =
    require("../utils/createFinding");

const RULES =
    require("./metadata");

const {
    isForLoop,
    getLoopCondition
} = require("../ast/loops");

function checkLoopLength(ast) {

    const findings = [];

    traverse(ast, node => {

        // only for loops
        if (!isForLoop(node)) {
            return;
        }

        const condition =
            getLoopCondition(node);

        if (!condition) {
            return;
        }

        let foundLengthAccess = false;

        traverse(condition, child => {

            if (
                child.type ===
                    "MemberAccess" &&
                child.memberName ===
                    "length"
            ) {

                foundLengthAccess = true;
            }
        });

        if (foundLengthAccess) {

            findings.push(
                createFinding(
                    RULES.GAS_003,
                    {
                        line:
                            node.loc
                                ? node.loc.start.line
                                : "unknown",

                        detail:
                            "Array length is read during every loop iteration"
                    }
                )
            );
        }
    });

    return findings;
}

module.exports =
    checkLoopLength;