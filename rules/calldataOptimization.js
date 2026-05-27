const traverse =
    require("../utils/traverse");

const createFinding =
    require("../utils/createFinding");

const RULES =
    require("./metadata");

const {
    getFunctionParameters,
    isExternalFunction
} = require("../ast/functions");

function checkCalldataOptimization(ast) {

    const findings = [];

    traverse(ast, node => {

        if (!isExternalFunction(node)) {
            return;
        }

        const params =
            getFunctionParameters(node);

        params.forEach(param => {

            if (
                param.storageLocation !==
                "memory"
            ) {
                return;
            }

            let isDynamic = false;

            // arrays
            if (
                param.typeName &&
                param.typeName.type ===
                    "ArrayTypeName"
            ) {

                isDynamic = true;
            }

            // string / bytes
            if (
                param.typeName &&
                param.typeName.name &&
                (
                    param.typeName.name ===
                        "string" ||

                    param.typeName.name ===
                        "bytes"
                )
            ) {

                isDynamic = true;
            }

            if (isDynamic) {
                if (
                    isParameterMutated(
                        node.body,
                        param.name
                    )
                ) {
                    return;
                }

                findings.push(
                    createFinding(
                        RULES.GAS_007,
                        {
                            line:
                                param.loc
                                    ? param.loc.start.line
                                    : "unknown",

                            name:
                                param.name,

                            detail:
                                "Using calldata avoids unnecessary memory copies"
                        }
                    )
                );
            }
        });
    });

    return findings;
}

module.exports =
    checkCalldataOptimization;

function isParameterMutated(body, parameterName) {
    let mutated = false;

    traverse(body, child => {
        if (mutated || !child) {
            return;
        }

        if (
            child.type === "BinaryOperation" &&
            isAssignmentOperator(child.operator) &&
            referencesIdentifier(
                child.left,
                parameterName
            )
        ) {
            mutated = true;
        }

        if (
            child.type === "UnaryOperation" &&
            (
                child.operator === "++" ||
                child.operator === "--" ||
                child.isPrefix === true
            ) &&
            referencesIdentifier(
                child.subExpression,
                parameterName
            )
        ) {
            mutated = true;
        }
    });

    return mutated;
}

function referencesIdentifier(node, name) {
    let found = false;

    traverse(node, child => {
        if (
            child &&
            child.type === "Identifier" &&
            child.name === name
        ) {
            found = true;
        }
    });

    return found;
}

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
