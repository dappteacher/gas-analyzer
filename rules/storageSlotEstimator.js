const traverse =
    require("../utils/traverse");

const createFinding =
    require("../utils/createFinding");

const RULES =
    require("./metadata");

const {
    getTypeSize
} = require("../ast/storage");

const {
    getVariableTypeName,
    isConstant,
    isImmutable
} = require("../ast/variables");

function checkStorageSlotEstimate(ast) {
    const findings = [];

    traverse(ast, node => {
        if (node.type !== "ContractDefinition") {
            return;
        }

        const stateVariables =
            getStorageVariables(node);

        if (stateVariables.length === 0) {
            return;
        }

        const estimate =
            estimateStorageSlots(stateVariables);

        findings.push(
            createFinding(
                RULES.GAS_009,
                {
                    line:
                        node.loc
                            ? node.loc.start.line
                            : "unknown",

                    name:
                        node.name,

                    detail:
                        `Estimated storage slots: ${estimate.slots} for ${stateVariables.length} state variables`
                }
            )
        );
    });

    return findings;
}

function getStorageVariables(contractNode) {
    const variables = [];

    contractNode.subNodes.forEach(subNode => {
        if (
            subNode.type !==
            "StateVariableDeclaration"
        ) {
            return;
        }

        subNode.variables.forEach(variable => {
            if (
                isConstant(variable) ||
                isImmutable(variable)
            ) {
                return;
            }

            variables.push({
                name:
                    variable.name,

                type:
                    getVariableTypeName(variable),

                typeName:
                    variable.typeName
            });
        });
    });

    return variables;
}

function estimateStorageSlots(variables) {
    let slots = 0;
    let usedBytes = 0;

    variables.forEach(variable => {
        if (isFullSlotType(variable)) {
            if (usedBytes > 0) {
                slots++;
                usedBytes = 0;
            }

            slots++;
            return;
        }

        const size =
            getTypeSize(variable.type);

        if (usedBytes + size > 32) {
            slots++;
            usedBytes = size;
            return;
        }

        usedBytes += size;
    });

    if (usedBytes > 0) {
        slots++;
    }

    return {
        slots
    };
}

function isFullSlotType(variable) {
    if (!variable.typeName) {
        return true;
    }

    if (
        variable.typeName.type === "Mapping" ||
        variable.typeName.type === "ArrayTypeName"
    ) {
        return true;
    }

    return getTypeSize(variable.type) >= 32;
}

module.exports =
    checkStorageSlotEstimate;
