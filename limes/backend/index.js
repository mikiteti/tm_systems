const global = require("./global");
const boring = require("./boring");
const methods = require("./methods");

const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors(), express.json({ limit: "10gb" }));

const endpoints = {
    create_tag: methods.create_tag,
    create_file: methods.create_file,

    get_user_settings: methods.get_user_settings,
    get_user_tags: methods.get_user_tags,
    get_user_file_ids: methods.get_user_file_ids,
    get_login_info: methods.get_login_info,
    get_file_preview: methods.get_file_preview,
    get_file_content: methods.get_file_content,

    set_user_settings: methods.set_user_settings,
    rename_tag: methods.rename_tag,
    update_file_info: methods.update_file_info,

    register_action: methods.register_action,
    act_out: methods.act_out,

    delete_tag: methods.delete_tag,
    delete_file: methods.delete_file,
}

app.post("/", (req, res) => {
    const { api_name, body } = req.body;

    endpoints[api_name](body, res);
});

app.listen(2001, (err) => {
    if (err) console.error(err.message);
    console.log("App listening on port 2001");
});
