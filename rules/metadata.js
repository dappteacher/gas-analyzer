const RULES = {

    GAS_001: {
        id: "GAS-001",
        title: "Variable can be constant",
        severity: "HIGH",
        impact:
            "Reduces storage gas costs",
        recommendation:
            "Use constant for immutable fixed values"
    },

    GAS_002: {
        id: "GAS-002",
        title: "Function can be external",
        severity: "MEDIUM",
        impact:
            "Avoids unnecessary memory copies",
        recommendation:
            "Use external visibility when possible"
    },

    GAS_003: {
        id: "GAS-003",
        title:
            "Cache array length outside loop",
        severity: "LOW",
        impact:
            "Avoids repeated length reads",
        recommendation:
            "Store array length in local variable"
    },

    GAS_004: {
        id: "GAS-004",
        title:
            "Variable can be immutable",
        severity: "MEDIUM",
        impact:
            "Reduces storage access costs",
        recommendation:
            "Use immutable for constructor-only assignments"
    },

    GAS_005: {
        id: "GAS-005",
        title:
            "Storage variables can be packed more efficiently",
        severity: "MEDIUM",
        impact:
            "Reduces storage slot usage",
        recommendation:
            "Group smaller variables together"
    },

    GAS_006: {
        id: "GAS-006",
        title:
            "Loop increment can use unchecked block",
        severity: "LOW",
        impact:
            "Reduces overflow check gas",
        recommendation:
            "Use unchecked increments inside loops"
    },

    GAS_007: {
        id: "GAS-007",
        title:
            "Parameter can use calldata instead of memory",
        severity: "MEDIUM",
        impact:
            "Avoids unnecessary memory allocation",
        recommendation:
            "Use calldata for external read-only parameters"
    },

    GAS_008: {
        id: "GAS-008",
        title:
            "Duplicate storage read detected",
        severity: "MEDIUM",
        impact:
            "Avoids repeated SLOAD operations",
        recommendation:
            "Cache repeated storage reads in a local variable"
    }
};

module.exports = RULES;
