const traverse =
    require("../utils/traverse");

const createFinding =
    require("../utils/createFinding");

const RULES =
    require("./metadata");

const {
    isForLoop,
    getLoopExpression
} = require("../ast/loops");

function checkUncheckedIncrement(ast) {

    const findings = [];

    traverse(ast, node => {

        if (!isForLoop(node)) {
            return;
        }

        const loopExpr =
            getLoopExpression(node);

        if (!loopExpr) {
            return;
        }

        let foundIncrement = false;

        traverse(loopExpr, child => {

            if (
                child.type ===
                    "UnaryOperation" &&
                (
                    child.operator ===
                        "++" ||
                    child.operator ===
                        "--"
                )
            ) {

                foundIncrement = true;
            }
        });

        if (foundIncrement) {

            findings.push(
                createFinding(
                    RULES.GAS_006,
                    {
                        line:
                            node.loc.start.line,

                        detail:
                            "Unchecked increments save gas in loops"
                    }
                )
            );
        }
    });

    return findings;
}

module.exports =
    checkUncheckedIncrement;