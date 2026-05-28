function generateSarif(findings, file) {
    const uniqueRules =
        Array.from(
            new Map(
                findings.map(f => [
                    f.rule.id,
                    f.rule
                ])
            ).values()
        );

    return {

        version: "2.1.0",

        $schema:
            "https://json.schemastore.org/sarif-2.1.0.json",

        runs: [
            {
                tool: {
                    driver: {
                        name:
                            "Gas Analyzer",

                        informationUri:
                            "https://github.com/yourname/gas-analyzer",

                        rules:
                            uniqueRules.map(rule => ({
                                id:
                                    rule.id,

                                name:
                                    rule.title,

                                shortDescription: {
                                    text:
                                        rule.title
                                },

                                fullDescription: {
                                    text:
                                        rule.recommendation
                                },

                                help: {
                                    text:
                                        rule.impact
                                }
                            }))
                    }
                },

                results:
                    findings.map(f => ({

                        ruleId:
                            f.rule.id,

                        level:
                            mapSeverity(
                                f.rule.severity
                            ),

                        message: {
                            text:
                                buildMessage(f)
                        },

                        locations: [
                            {
                                physicalLocation: {
                                    artifactLocation: {
                                        uri:
                                            f.file || file
                                    },

                                    region: {
                                        startLine:
                                            f.line || 1
                                    }
                                }
                            }
                        ]
                    }))
            }
        ]
    };
}

function mapSeverity(severity) {

    switch (severity) {

        case "HIGH":
            return "error";

        case "MEDIUM":
            return "warning";

        case "LOW":
            return "note";

        default:
            return "note";
    }
}

function buildMessage(f) {

    let msg =
        f.rule.title;

    if (f.name) {

        msg +=
            ` (${f.name})`;
    }

    if (f.detail) {

        msg +=
            ` - ${f.detail}`;
    }

    return msg;
}

module.exports =
    generateSarif;
