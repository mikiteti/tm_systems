const global = require("./global");
const boring = require("./boring");

const methods = {
    log(body, res) {
        console.log("hello world");
        res.json({hello: "world"});
    },
}

module.exports = methods;
