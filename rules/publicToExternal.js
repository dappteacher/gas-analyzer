const RULES =
    require("./metadata");

const createFinding =
    require("../utils/createFinding");

function checkPublicToExternal(ast) {

    const findings = [];

    ast.children.forEach(node => {

        if (
            node.type ===
            "ContractDefinition"
        ) {

            const internallyCalledFunctions =
                new Set();

            node.subNodes.forEach(subNode => {

                if (
                    subNode.type ===
                        "FunctionDefinition" &&
                    subNode.body
                ) {

                    collectInternalCalls(
                        subNode.body,
                        internallyCalledFunctions
                    );
                }
            });

            node.subNodes.forEach(subNode => {

                if (
                    subNode.type ===
                        "FunctionDefinition" &&
                    subNode.visibility ===
                        "public" &&
                    subNode.name &&
                    !subNode.isConstructor &&
                    !subNode.isFallback &&
                    !subNode.isReceiveEther &&
                    !subNode.override &&
                    !internallyCalledFunctions.has(
                        subNode.name
                    )
                ) {

                    findings.push(
                        createFinding(
                            RULES.GAS_002,
                            {
                                line:
                                    subNode.loc.start.line,

                                name:
                                    subNode.name
                            }
                        )
                    );
                }
            });
        }
    });

    return findings;
}

module.exports =
    checkPublicToExternal;

function collectInternalCalls(node, calledFunctions) {
    if (!node || typeof node !== "object") {
        return;
    }

    if (Array.isArray(node)) {
        node.forEach(child => {
            collectInternalCalls(
                child,
                calledFunctions
            );
        });

        return;
    }

    if (
        node.type === "FunctionCall" &&
        node.expression
    ) {
        if (node.expression.type === "Identifier") {
            calledFunctions.add(
                node.expression.name
            );
        }

        if (
            node.expression.type === "MemberAccess" &&
            node.expression.expression &&
            node.expression.expression.type === "Identifier" &&
            node.expression.expression.name === "this"
        ) {
            calledFunctions.add(
                node.expression.memberName
            );
        }
    }

    Object.keys(node).forEach(key => {
        if (key === "loc" || key === "range") {
            return;
        }

        collectInternalCalls(
            node[key],
            calledFunctions
        );
    });
}
