const createFinding =
    require("../utils/createFinding");

const RULES =
    require("./metadata");

const ASSIGNMENT_OPERATORS = new Set([
    "=",
    "+=",
    "-=",
    "*=",
    "/=",
    "%=",
    "|=",
    "&=",
    "^="
]);

function checkDuplicateSload(ast) {
    const findings = [];

    const stateVariables =
        collectStateVariables(ast);

    walk(ast, node => {
        if (
            node.type !== "FunctionDefinition" ||
            !node.body
        ) {
            return;
        }

        const reads = new Map();

        collectReads(
            node.body,
            stateVariables,
            reads,
            null
        );

        reads.forEach(read => {
            if (read.count < 2) {
                return;
            }

            findings.push(
                createFinding(
                    RULES.GAS_008,
                    {
                        line:
                            read.line,

                        name:
                            node.name || "anonymous",

                        detail:
                            `${read.expression} is read ${read.count} times in the same function`
                    }
                )
            );
        });
    });

    return findings;
}

function collectStateVariables(ast) {
    const stateVariables = new Set();

    walk(ast, node => {
        if (
            node.type ===
            "StateVariableDeclaration"
        ) {
            node.variables.forEach(variable => {
                stateVariables.add(variable.name);
            });
        }
    });

    return stateVariables;
}

function collectReads(
    node,
    stateVariables,
    reads,
    parent
) {
    if (!node) {
        return;
    }

    if (Array.isArray(node)) {
        node.forEach(child => {
            collectReads(
                child,
                stateVariables,
                reads,
                parent
            );
        });

        return;
    }

    if (typeof node !== "object") {
        return;
    }

    if (
        node.type === "BinaryOperation" &&
        ASSIGNMENT_OPERATORS.has(node.operator)
    ) {
        collectReads(
            node.right,
            stateVariables,
            reads,
            node
        );

        return;
    }

    if (isStorageIndexAccess(node, stateVariables)) {
        recordRead(
            reads,
            expressionKey(node),
            expressionLabel(node),
            node
        );

        return;
    }

    if (
        node.type === "Identifier" &&
        stateVariables.has(node.name) &&
        !isPartOfStorageIndexAccess(parent)
    ) {
        recordRead(
            reads,
            `state:${node.name}`,
            node.name,
            node
        );

        return;
    }

    Object.keys(node).forEach(key => {
        if (key === "loc" || key === "range") {
            return;
        }

        collectReads(
            node[key],
            stateVariables,
            reads,
            node
        );
    });
}

function recordRead(reads, key, expression, node) {
    const existing =
        reads.get(key) || {
            count: 0,
            expression,
            line:
                node.loc
                    ? node.loc.start.line
                    : "unknown"
        };

    existing.count++;

    reads.set(key, existing);
}

function isStorageIndexAccess(node, stateVariables) {
    if (node.type !== "IndexAccess") {
        return false;
    }

    const root =
        getExpressionRoot(
            node.base ||
            node.baseExpression
        );

    return (
        root &&
        root.type === "Identifier" &&
        stateVariables.has(root.name)
    );
}

function isPartOfStorageIndexAccess(parent) {
    return (
        parent &&
        parent.type === "IndexAccess"
    );
}

function getExpressionRoot(node) {
    if (!node) {
        return null;
    }

    if (node.type === "Identifier") {
        return node;
    }

    if (node.type === "IndexAccess") {
        return getExpressionRoot(
            node.base ||
            node.baseExpression
        );
    }

    if (node.type === "MemberAccess") {
        return getExpressionRoot(node.expression);
    }

    return null;
}

function expressionKey(node) {
    return JSON.stringify(stripMetadata(node));
}

function stripMetadata(value) {
    if (!value || typeof value !== "object") {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(stripMetadata);
    }

    const result = {};

    Object.keys(value)
        .sort()
        .forEach(key => {
            if (key === "loc" || key === "range") {
                return;
            }

            result[key] = stripMetadata(value[key]);
        });

    return result;
}

function expressionLabel(node) {
    if (!node) {
        return "unknown expression";
    }

    if (node.type === "Identifier") {
        return node.name;
    }

    if (node.type === "IndexAccess") {
        return `${expressionLabel(node.base || node.baseExpression)}[${expressionLabel(node.index || node.indexExpression)}]`;
    }

    if (node.type === "MemberAccess") {
        return `${expressionLabel(node.expression)}.${node.memberName}`;
    }

    if (node.name) {
        return node.name;
    }

    return node.type;
}

function walk(node, callback) {
    if (!node) {
        return;
    }

    if (Array.isArray(node)) {
        node.forEach(child => {
            walk(child, callback);
        });

        return;
    }

    if (typeof node !== "object") {
        return;
    }

    callback(node);

    Object.keys(node).forEach(key => {
        if (key === "loc" || key === "range") {
            return;
        }

        walk(node[key], callback);
    });
}

module.exports =
    checkDuplicateSload;
