const RULES =
    require("./metadata");

const createFinding =
    require("../utils/createFinding");

const traverse =
    require("../utils/traverse");

const {
    isConstant
} = require("../ast/variables");

const ALLOWED_LITERAL_TYPES = new Set([
    "NumberLiteral",
    "BooleanLiteral",
    "StringLiteral",
    "HexLiteral"
]);

function checkConstantVariables(ast) {

    const findings = [];
    const assignedStateVariables =
        collectAssignedStateVariables(ast);

    ast.children.forEach(node => {

        if (
            node.type ===
            "ContractDefinition"
        ) {

            node.subNodes.forEach(subNode => {

                if (
                    subNode.type ===
                    "StateVariableDeclaration"
                ) {

                    subNode.variables.forEach(variable => {

                        if (
                            variable.expression &&
                            !isConstant(variable) &&
                            !assignedStateVariables.has(
                                variable.name
                            ) &&
                            isCompileTimeConstant(
                                variable.expression
                            )
                        ) {

                            findings.push(
                                createFinding(
                                    RULES.GAS_001,
                                    {
                                        line:
                                            variable.loc.start.line,

                                        name:
                                            variable.name
                                    }
                                )
                            );
                        }
                    });
                }
            });
        }
    });

    return findings;
}

module.exports =
    checkConstantVariables;

function isCompileTimeConstant(expression) {
    if (!expression) {
        return false;
    }

    if (ALLOWED_LITERAL_TYPES.has(expression.type)) {
        return true;
    }

    if (
        expression.type === "UnaryOperation" &&
        isCompileTimeConstant(
            expression.subExpression
        )
    ) {
        return true;
    }

    if (
        expression.type === "BinaryOperation" &&
        expression.operator !== "="
    ) {
        return (
            isCompileTimeConstant(expression.left) &&
            isCompileTimeConstant(expression.right)
        );
    }

    return false;
}

function collectAssignedStateVariables(ast) {
    const assigned =
        new Set();

    traverse(ast, node => {
        if (
            node.type === "StateVariableDeclaration"
        ) {
            return;
        }

        if (
            node.type === "BinaryOperation" &&
            isAssignmentOperator(node.operator)
        ) {
            addAssignedName(
                assigned,
                node.left
            );
        }

        if (
            node.type === "UnaryOperation" &&
            (
                node.operator === "++" ||
                node.operator === "--"
            )
        ) {
            addAssignedName(
                assigned,
                node.subExpression
            );
        }
    });

    return assigned;
}

function addAssignedName(assigned, node) {
    const root =
        getAssignedRoot(node);

    if (
        root &&
        root.type === "Identifier"
    ) {
        assigned.add(root.name);
    }
}

function getAssignedRoot(node) {
    if (!node) {
        return null;
    }

    if (node.type === "Identifier") {
        return node;
    }

    if (node.type === "IndexAccess") {
        return getAssignedRoot(
            node.base ||
            node.baseExpression
        );
    }

    if (node.type === "MemberAccess") {
        return getAssignedRoot(
            node.expression
        );
    }

    return null;
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
