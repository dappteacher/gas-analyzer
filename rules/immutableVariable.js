const traverse =
    require("../utils/traverse");

const createFinding =
    require("../utils/createFinding");

const RULES =
    require("./metadata");

const {
    isConstant,
    isImmutable
} = require("../ast/variables");

function checkImmutableVariables(ast) {

    const findings = [];

    const stateVariables = new Map();

    const constructorAssignments =
        new Set();

    const nonConstructorAssignments =
        new Set();

    traverse(ast, node => {

        // collect state vars
        if (
            node.type ===
            "StateVariableDeclaration"
        ) {

            node.variables.forEach(variable => {

                stateVariables.set(
                    variable.name,
                    variable
                );
            });
        }

        // constructor assignments
        if (
            node.type ===
            "FunctionDefinition" &&
            node.isConstructor
        ) {

            traverse(node.body, child => {

                if (
                    child.type ===
                    "BinaryOperation" &&
                isAssignmentOperator(
                    child.operator
                )
                ) {

                    if (
                        child.left &&
                        child.left.type ===
                        "Identifier"
                    ) {

                        constructorAssignments.add(
                            child.left.name
                        );
                    }
                }
            });
        }

        // non-constructor assignments
        if (
            node.type ===
            "FunctionDefinition" &&
            !node.isConstructor
        ) {

            traverse(node.body, child => {

                if (
                    child.type ===
                    "BinaryOperation" &&
                isAssignmentOperator(
                    child.operator
                )
                ) {

                    if (
                        child.left &&
                        child.left.type ===
                        "Identifier"
                    ) {

                        nonConstructorAssignments.add(
                            child.left.name
                        );
                    }
                }
            });
        }
    });

    // detect immutable candidates
    stateVariables.forEach(
        (variable, name) => {

            if (
                constructorAssignments.has(
                    name
                ) &&
                !nonConstructorAssignments.has(
                    name
                ) &&
                !isImmutable(variable) &&
                !isConstant(variable) &&
                !variable.expression
            ) {

                findings.push(
                    createFinding(
                        RULES.GAS_004,
                        {
                            line:
                                variable.loc
                                    ? variable.loc.start.line
                                    : "unknown",

                            name
                        }
                    )
                );
            }
        }
    );

    return findings;
}

module.exports =
    checkImmutableVariables;

function isAssignmentOperator(operator) {
    return (
        operator === "=" ||
        operator === "+=" ||
        operator === "-=" ||
        operator === "*=" ||
        operator === "/=" ||
        operator === "%=" ||
        operator === "|=" ||
        operator === "&=" ||
        operator === "^="
    );
}
