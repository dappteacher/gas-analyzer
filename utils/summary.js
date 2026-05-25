function generateSummary(findings) {

    const summary = {

        HIGH: 0,
        MEDIUM: 0,
        LOW: 0,
        TOTAL: findings.length
    };

    findings.forEach(f => {

        if (
            f.rule &&
            summary[f.rule.severity] !==
                undefined
        ) {

            summary[
                f.rule.severity
            ]++;
        }
    });

    return summary;
}

module.exports =
    generateSummary;