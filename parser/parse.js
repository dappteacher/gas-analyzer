const parser = require("@solidity-parser/parser");
const fs = require("fs");

function parseContract(filePath) {

    const source = fs.readFileSync(
        filePath,
        "utf8"
    );

    try {

        return parser.parse(source, {
            loc: true
        });

    } catch (e) {

        console.error(
            "Parse Error:",
            e.message
        );

        process.exit(1);
    }
}

module.exports = parseContract;