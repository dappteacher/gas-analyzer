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
                !variable.expression &&
                canBeImmutable(variable)
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

function canBeImmutable(variable) {
    if (!variable || !variable.typeName) {
        return false;
    }

    const typeName =
        variable.typeName;

    if (
        typeName.type === "ArrayTypeName" ||
        typeName.type === "Mapping" ||
        typeName.type === "FunctionTypeName"
    ) {
        return false;
    }

    if (typeName.type === "UserDefinedTypeName") {
        return true;
    }

    if (typeName.type !== "ElementaryTypeName") {
        return false;
    }

    return isImmutableElementaryType(
        typeName.name
    );
}

function isImmutableElementaryType(typeName) {
    if (!typeName) {
        return false;
    }

    return (
        typeName === "bool" ||
        typeName === "address" ||
        typeName === "uint" ||
        typeName === "int" ||
        /^uint[0-9]+$/.test(typeName) ||
        /^int[0-9]+$/.test(typeName) ||
        /^bytes[0-9]+$/.test(typeName)
    );
}
