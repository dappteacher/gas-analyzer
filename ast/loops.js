function isForLoop(node) {

    return (
        node &&
        node.type === "ForStatement"
    );
}

function getLoopCondition(node) {

    if (!isForLoop(node)) {
        return null;
    }

    // parser compatibility
    return (
        node.conditionExpression ||
        node.condition ||
        null
    );
}

function getLoopExpression(node) {

    if (!isForLoop(node)) {
        return null;
    }

    return (
        node.loopExpression ||
        null
    );
}

function getLoopBody(node) {

    if (!isForLoop(node)) {
        return null;
    }

    return node.body || null;
}

module.exports = {
    isForLoop,
    getLoopCondition,
    getLoopExpression,
    getLoopBody
};