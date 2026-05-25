function getTypeSize(type) {

    const sizes = {

        bool: 1,

        address: 20,

        uint8: 1,
        uint16: 2,
        uint32: 4,
        uint64: 8,
        uint128: 16,
        uint256: 32,

        int8: 1,
        int16: 2,
        int32: 4,
        int64: 8,
        int128: 16,
        int256: 32
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

module.exports = {
    getTypeSize,
    canPack
};