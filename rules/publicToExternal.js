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

            const functionNames = [];

            node.subNodes.forEach(subNode => {

                if (
                    subNode.type ===
                        "FunctionDefinition" &&
                    subNode.body
                ) {

                    JSON.stringify(
                        subNode.body,
                        (key, value) => {

                            if (
                                value &&
                                value.type ===
                                    "FunctionCall" &&
                                value.expression &&
                                value.expression.name
                            ) {

                                functionNames.push(
                                    value.expression.name
                                );
                            }

                            return value;
                        }
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
                    !functionNames.includes(
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