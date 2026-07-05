const ESTIMATES = {
    "GAS-001": {
        currentGas: 2100,
        optimizedGas: 3,
        unit: "per state variable read",
        confidence: "medium",
        assumption:
            "Replaces an SLOAD with a compile-time constant access"
    },

    "GAS-002": {
        currentGas: 120,
        optimizedGas: 60,
        unit: "per external call with dynamic arguments",
        confidence: "low",
        assumption:
            "External visibility can avoid unnecessary ABI memory copies in some call patterns"
    },

    "GAS-003": {
        currentGas: 100,
        optimizedGas: 3,
        unit: "per loop iteration for repeated storage length reads",
        confidence: "low",
        assumption:
            "Caches a repeated length lookup; real savings depend on data location and compiler output"
    },

    "GAS-004": {
        currentGas: 2100,
        optimizedGas: 3,
        unit: "per state variable read",
        confidence: "medium",
        assumption:
            "Replaces an SLOAD with immutable bytecode access"
    },

    "GAS-005": {
        currentGas: 20000,
        optimizedGas: 0,
        unit: "per avoided storage slot initialization",
        confidence: "low",
        assumption:
            "One fewer storage slot is initialized or written after packing"
    },

    "GAS-006": {
        currentGas: 35,
        optimizedGas: 5,
        unit: "per loop iteration",
        confidence: "medium",
        assumption:
            "Removes checked arithmetic overhead from a safe loop increment"
    },

    "GAS-007": {
        currentGas: 180,
        optimizedGas: 60,
        unit: "per external call with dynamic parameter",
        confidence: "low",
        assumption:
            "Avoids copying read-only dynamic calldata into memory"
    },

    "GAS-008": {
        currentGas: 200,
        optimizedGas: 100,
        unit: "per duplicated warm storage read",
        confidence: "medium",
        assumption:
            "Caches a repeated SLOAD after the first read"
    }
};

function attachGasEstimates(findings) {
    return findings.map(finding => {
        const estimate =
            estimateFinding(finding);

        return {
            ...finding,
            gasEstimate:
                estimate
        };
    });
}

function estimateFinding(finding) {
    if (!finding.rule) {
        return notEstimable(
            "Missing rule metadata"
        );
    }

    const base =
        ESTIMATES[finding.rule.id];

    if (!base) {
        return notEstimable(
            "No reliable static gas delta for this finding"
        );
    }

    const savedGas =
        Math.max(
            base.currentGas -
            base.optimizedGas,
            0
        );

    const decreasePercent =
        base.currentGas > 0
            ? Number(
                (
                    savedGas /
                    base.currentGas *
                    100
                ).toFixed(2)
            )
            : 0;

    return {
        estimable: true,
        currentGas:
            base.currentGas,
        optimizedGas:
            base.optimizedGas,
        savedGas,
        decreasePercent,
        unit:
            base.unit,
        confidence:
            base.confidence,
        assumption:
            base.assumption
    };
}

function notEstimable(reason) {
    return {
        estimable: false,
        currentGas: null,
        optimizedGas: null,
        savedGas: 0,
        decreasePercent: null,
        unit: null,
        confidence: "none",
        assumption: reason
    };
}

function summarizeGasEstimates(findings) {
    const estimableFindings =
        findings.filter(finding => {
            return (
                finding.gasEstimate &&
                finding.gasEstimate.estimable
            );
        });

    const currentGas =
        estimableFindings.reduce(
            (total, finding) =>
                total +
                finding.gasEstimate.currentGas,
            0
        );

    const optimizedGas =
        estimableFindings.reduce(
            (total, finding) =>
                total +
                finding.gasEstimate.optimizedGas,
            0
        );

    const savedGas =
        Math.max(
            currentGas - optimizedGas,
            0
        );

    return {
        estimableFindings:
            estimableFindings.length,
        currentGas,
        optimizedGas,
        savedGas,
        decreasePercent:
            currentGas > 0
                ? Number(
                    (
                        savedGas /
                        currentGas *
                        100
                    ).toFixed(2)
                )
                : 0,
        note:
            "Static heuristic estimate. Use compiler/runtime gas reports for exact transaction costs."
    };
}

module.exports = {
    attachGasEstimates,
    estimateFinding,
    summarizeGasEstimates
};
