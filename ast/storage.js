function getTypeSize(type) {
    if (!type) {
        return 32;
    }

    const uintMatch = type.match(/^uint([0-9]+)$/);

    if (uintMatch) {
        return Number(uintMatch[1]) / 8;
    }

    const intMatch = type.match(/^int([0-9]+)$/);

    if (intMatch) {
        return Number(intMatch[1]) / 8;
    }

    const sizes = {

        bool: 1,

        address: 20,

        uint: 32,

        int: 32,

        bytes1: 1,
        bytes2: 2,
        bytes3: 3,
        bytes4: 4,
        bytes5: 5,
        bytes6: 6,
        bytes7: 7,
        bytes8: 8,
        bytes9: 9,
        bytes10: 10,
        bytes11: 11,
        bytes12: 12,
        bytes13: 13,
        bytes14: 14,
        bytes15: 15,
        bytes16: 16,
        bytes17: 17,
        bytes18: 18,
        bytes19: 19,
        bytes20: 20,
        bytes21: 21,
        bytes22: 22,
        bytes23: 23,
        bytes24: 24,
        bytes25: 25,
        bytes26: 26,
        bytes27: 27,
        bytes28: 28,
        bytes29: 29,
        bytes30: 30,
        bytes31: 31,
        bytes32: 32
    };

    return sizes[type] || 32;
}

function canPack(typeA, typeB) {

    return (
        getTypeSize(typeA) +
        getTypeSize(typeB)
        <= 32
    );
}

function isPackableType(type) {
    return getTypeSize(type) < 32;
}

module.exports = {
    getTypeSize,
    canPack,
    isPackableType
};
