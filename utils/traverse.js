function traverse(node, callback) {

    if (!node) return;

    // arrays
    if (Array.isArray(node)) {

        node.forEach(child => {
            traverse(child, callback);
        });

        return;
    }

    // objects only
    if (typeof node !== "object") {
        return;
    }

    // current node
    callback(node);

    // children
    for (const key in node) {

        // skip location metadata
        if (
            key === "loc" ||
            key === "range"
        ) {
            continue;
        }

        traverse(node[key], callback);
    }
}

module.exports = traverse;