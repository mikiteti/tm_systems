const global = require("./global");
const boring = require("./boring");
const methods = require("./methods");

const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors(), express.json({ limit: "10gb" }));

const endpoints = {
    log: methods.log,
}

app.post("/", (req, res) => {
    const { api_name, body } = req.body;

    endpoints[api_name](body, res);
});

app.listen(2001, (err) => {
    if (err) console.error(err.message);
    console.log("App listening on port 2001");
});
