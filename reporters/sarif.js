function generateSarif(findings, file) {

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
                            findings.map(f => ({
                                id:
                                    f.rule.id,

                                name:
                                    f.rule.title,

                                shortDescription: {
                                    text:
                                        f.rule.title
                                },

                                fullDescription: {
                                    text:
                                        f.rule.recommendation
                                },

                                help: {
                                    text:
                                        f.rule.impact
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
                                        uri: file
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