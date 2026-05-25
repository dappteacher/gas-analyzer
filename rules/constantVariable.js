const RULES =
    require("./metadata");

const createFinding =
    require("../utils/createFinding");

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
                            variable.isDeclaredConst === false
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