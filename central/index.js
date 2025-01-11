const global = require("./global");
const methods = require("./methods");
const boring = require("./boring");

const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors(), express.json({ limit: "10gb" }));

const endpoints = {
    create_user: methods.create_user,
    delete_user: methods.delete_user,
    update_user: methods.update_user,
    get_user: methods.get_user,
}

app.post("/", (req, res) => {
    const { api_name, body } = req.body;

    endpoints[api_name](body, res);
})

app.listen(2000, (err) => {
    if (err) console.error(err.message);
    console.log("App listening on port 2000");
})
