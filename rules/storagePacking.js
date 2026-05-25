const traverse =
    require("../utils/traverse");

const createFinding =
    require("../utils/createFinding");

const RULES =
    require("./metadata");

const {
    getTypeSize,
    canPack
} = require("../ast/storage");

function checkStoragePacking(ast) {

    const findings = [];

    traverse(ast, node => {

        if (
            node.type !==
            "ContractDefinition"
        ) {
            return;
        }

        const stateVars = [];

        // collect state vars
        node.subNodes.forEach(subNode => {

            if (
                subNode.type ===
                "StateVariableDeclaration"
            ) {

                subNode.variables.forEach(v => {

                    if (
                        v.typeName &&
                        v.typeName.name
                    ) {

                        stateVars.push({
                            name: v.name,

                            type:
                                v.typeName.name,

                            size:
                                getTypeSize(
                                    v.typeName.name
                                ),

                            line:
                                v.loc
                                    ? v.loc.start.line
                                    : "unknown"
                        });
                    }
                });
            }
        });

        // analyze ordering
        for (
            let i = 0;
            i < stateVars.length - 1;
            i++
        ) {

            const current =
                stateVars[i];

            const next =
                stateVars[i + 1];

            // if next var already packs correctly
            if (
                canPack(
                    current.type,
                    next.type
                )
            ) {

                continue;
            }

            // search future vars
            for (
                let j = i + 2;
                j < stateVars.length;
                j++
            ) {

                const future =
                    stateVars[j];

                // can current + future pack?
                if (
                    canPack(
                        current.type,
                        future.type
                    )
                ) {

                    findings.push(
                        createFinding(
                            RULES.GAS_005,
                            {
                                line:
                                    future.line,

                                detail:
                                    `Consider grouping ${current.name} (${current.type}) with ${future.name} (${future.type})`
                            }
                        )
                    );

                    break;
                }
            }
        }
    });

    return findings;
}

module.exports =
    checkStoragePacking;