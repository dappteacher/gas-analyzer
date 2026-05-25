const parseContract = require("./parser/parse");

const ast = parseContract(
    "contracts/Sample.sol"
);

console.dir(ast, {
    depth: null
});