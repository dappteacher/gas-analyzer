const checkConstantVariables =
    require("../rules/constantVariable");

const checkPublicToExternal =
    require("../rules/publicToExternal");

const checkLoopLength =
    require("../rules/loopLength");

const checkImmutableVariables =
    require("../rules/immutableVariable");

const checkStoragePacking =
    require("../rules/storagePacking");

const checkUncheckedIncrement =
    require("../rules/uncheckedIncrement");

const checkCalldataOptimization =
    require("../rules/calldataOptimization");    

const checkDuplicateSload =
    require("../rules/duplicateSload");

function runRules(ast) {

    let findings = [];

    findings = findings.concat(
        checkConstantVariables(ast)
    );

    findings = findings.concat(
        checkPublicToExternal(ast)
    );

    findings = findings.concat(
        checkLoopLength(ast)
    );

    findings = findings.concat(
        checkImmutableVariables(ast)
    );

    findings = findings.concat(
        checkStoragePacking(ast)
    );

    findings = findings.concat(
        checkUncheckedIncrement(ast)
    );

    findings = findings.concat(
        checkCalldataOptimization(ast)
    );

    findings = findings.concat(
        checkDuplicateSload(ast)
    );

    return findings;
}

module.exports = runRules;
