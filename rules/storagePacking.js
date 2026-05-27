const traverse =
    require("../utils/traverse");

const createFinding =
    require("../utils/createFinding");

const RULES =
    require("./metadata");

const {
    getTypeSize,
    canPack,
    isPackableType
} = require("../ast/storage");

const {
    getVariableTypeName,
    isConstant,
    isImmutable
} = require("../ast/variables");

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

                    const type =
                        getVariableTypeName(v);

                    if (
                        type &&
                        !isConstant(v) &&
                        !isImmutable(v)
                    ) {

                        stateVars.push({
                            name: v.name,

                            type,

                            size:
                                getTypeSize(
                                    type
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

            if (!isPackableType(current.type)) {
                continue;
            }

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
                    isPackableType(future.type) &&
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
