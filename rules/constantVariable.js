const RULES =
    require("./metadata");

const createFinding =
    require("../utils/createFinding");

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
