function getFunctionParameters(node) {

    if (
        !node ||
        node.type !== "FunctionDefinition"
    ) {
        return [];
    }

    // parser compatibility
    if (Array.isArray(node.parameters)) {
        return node.parameters;
    }

    if (
        node.parameters &&
        Array.isArray(
            node.parameters.parameters
        )
    ) {

        return node.parameters.parameters;
    }

    return [];
}

function isExternalFunction(node) {

    return (
        node &&
        node.type === "FunctionDefinition" &&
        node.visibility === "external"
    );
}

function isPublicFunction(node) {

    return (
        node &&
        node.type === "FunctionDefinition" &&
        node.visibility === "public"
    );
}

module.exports = {
    getFunctionParameters,
    isExternalFunction,
    isPublicFunction
};