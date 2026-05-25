function createFinding(
    rule,
    extra = {}
) {

    return {
        rule,
        ...extra
    };
}

module.exports =
    createFinding;