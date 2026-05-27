function isStateVariableDeclaration(node) {
    return (
        node &&
        node.type === "StateVariableDeclaration"
    );
}

function getVariableTypeName(variable) {
    if (!variable || !variable.typeName) {
        return null;
    }

    if (variable.typeName.name) {
        return variable.typeName.name;
    }

    if (
        variable.typeName.type === "ElementaryTypeName" &&
        variable.typeName.name
    ) {
        return variable.typeName.name;
    }

    if (
        variable.typeName.type === "ArrayTypeName" &&
        variable.typeName.baseTypeName
    ) {
        const baseName =
            variable.typeName.baseTypeName.name || "array";

        return `${baseName}[]`;
    }

    return null;
}

function isConstant(variable) {
    return (
        variable &&
        (
            variable.isDeclaredConst ||
            variable.isConstant ||
            variable.mutability === "constant"
        )
    );
}

function isImmutable(variable) {
    return (
        variable &&
        (
            variable.isDeclaredImmutable ||
            variable.isImmutable ||
            variable.mutability === "immutable"
        )
    );
}

module.exports = {
    isStateVariableDeclaration,
    getVariableTypeName,
    isConstant,
    isImmutable
};
