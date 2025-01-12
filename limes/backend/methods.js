const global = require("./global");
const boring = require("./boring");

const authenticate_user = (identifier, id_type, password, res, callback) => {
    return fetch("http://localhost:2000", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        api_name: "authenticate_user",
        body: {
            identifier: identifier,
            id_type: id_type,
            password: password
        }
    }) }).then(res2 => res2.json()).then((user) => {
        if (user.success) {
            callback(user);
        } else {
            res.json(user);
        }
    });
} 

const methods = {
    create_tag(body, res) {
        const { user_id, password, tag_name }  = body;

        authenticate_user(user_id, "id", password, res, (user) => {
            global.db.run("INSERT INTO tags (name, user_id, date_of_creation) VALUES (?, ?, ?)", [tag_name, user_id, new Date().getTime()], (err) => {
                if (err) {
                    console.error(err.message);
                    res.json({error: "Unknown error"});
                    return;
                }

                res.json({success: "Tag created"});
            });
        });
    },
    create_file(body, res) {
        const { id, password, title } = body;

        authenticate_user(id, "id", password, res, (user) => {
            global.db.run("INSERT INTO files (title) VALUES (?)", [title], (err) => {
                if (err) {
                    console.error(err.message);
                    res.json({error: "Unknown error"});
                    return;
                }

                global.db.get("SELECT id FROM files ORDER BY id DESC LIMIT 1", (err, file) => {
                    if (err) {
                        console.error(err.message);
                        res.json({error: "Unknown error"});
                        return;
                    }

                    global.db.run("INSERT INTO usersfiles (user_id, file_id, relationship) VALUES (?, ?, 0)", [id, file.id], (err) => {
                        if (err) {
                            console.log(err.message);
                            res.json({error: "Unknown error"});
                            return;
                        }

                        res.json({success: "File created", file_id: file.id});
                    });
                });
            });
        });
    },

    get_user_settings(body, res) {
        const { id, password } = body;

        authenticate_user(id, "id", password, res, (user) => {
            global.db.get("SELECT settings FROM users WHERE id = ?", [id], (err, limes_user) => {
                if (err) {
                    console.error(err.message);
                    res.json({error: "Unknown error"});
                    return;
                }

                if (!limes_user) {
                    console.error("Limes user not created");
                    res.json({error: "Unknown error"});
                    return;
                }

                const settings = {};
                settings.general = JSON.parse(user.settings || "{}");
                settings.limes = JSON.parse(limes_user.settings || "{}");

                settings.success = "Settings returned";
                res.json(settings);
            })
        });
    },
    get_user_tags(body, res) {
        const { id, password } = body;

        authenticate_user(id, "id", password, res, (user) => {
            global.db.all("SELECT * FROM tags WHERE user_id = ?", [id], (err, tags) => {
                if (err) {
                    console.error(err.message);
                    res.json({error: "Unknown error"});
                    return;
                }

                res.json({
                    success: "Tags returned",
                    tags: tags
                });
            })
        })
    },
    get_user_file_ids(body, res) {
        const { id, password } = body;

        authenticate_user(id, "id", password, res, (user) => {
            global.db.all("SELECT DISTINCT file_id FROM usersfiles WHERE user_id = ?", [id], (err, records) => {
                if (err) {
                    console.error(err.message);
                    res.json({error: "Unknown error"});
                    return;
                }

                res.json({
                    success: "File ids returned",
                    file_ids: records.map(e => e.file_id)
                });
            });
        });
    },
    activate_user(id, callback, res) {
        global.db.run("INSERT INTO users (id) VALUES (?)", [id], (err) => {
            if (err) {
                console.error(err.message);
                res.json({error: "Unknown error"});
                return;
            }

            console.log(`Activated user #${id}`);
            callback();
        });
    },
    get_login_info(body, res) {
        const { id, password } = body;

        authenticate_user(id, "id", password, res, (user) => {
            global.db.get("SELECT * FROM users WHERE id = ?", [id], (err, limes_user) => {
                if (err) {
                    console.error(err.message);
                    res.json({error: "Unknown error"});
                    return;
                }

                if (!limes_user) {
                    methods.activate_user(id, () => { methods.get_login_info(body, res); }, res);
                    return;
                }

                const info = {};
                info.settings = {general: user.settings, limes: limes_user.settings};

                global.db.run("SELECT id, name, date_of_creation FROM tags WHERE user_id = ?", [id], (err, tags) => {
                    if (err) {
                        console.error(err.message);
                        res.json({error: "Unknown error"});
                        return;
                    }

                    info.tags = tags;

                    global.db.all("SELECT file_id FROM usersfiles WHERE user_id = ?", [id], (err, records) => {
                        if (err) {
                            console.error(err.message);
                            res.json({error: "Unknown error"});
                            return;
                        }

                        info.file_ids = records.map(e => e.file_id);

                        info.success = "Info returned";
                        res.json(info);
                    });
                });
            });
        });
    },
    get_file_preview(body, res) {

    },
    get_file_content(body, res) {

    },

    set_user_settings(body, res) {
        const { id, password, setting_name, setting_value } = body; 

        authenticate_user(id, "id", password, res, () => {
            global.db.get("SELECT * FROM users WHERE id = ?", [id], (err, user) => {
                if (err) {
                    console.error(err.message);
                    res.json({error: "Unknown error"});
                    return;
                }

                const settings = JSON.parse(user.settings || "{}");

                settings[setting_name] = setting_value;

                global.db.run("UPDATE users SET settings = ? WHERE id = ?", [JSON.stringify(settings), id], (err) => {
                    if (err) {
                        console.error(err.message);
                        res.json({error: "Unknown error"});
                        return;
                    }

                    res.json({success: "Setting updated"});
                });
            });
        });
    },
    rename_tag(body, res) {
        const { user_id, password, tag_id, tag_name } = body;

        authenticate_user(user_id, "id", password, res, () => {
            global.db.get("SELECT user_id FROM tags WHERE id = ?", [tag_id], (err, tag) => {
                if (err) {
                    console.error(err.message);
                    res.json({error: "Unknown error"});
                    return;
                }

                if (tag.user_id != user_id) {
                    res.json({error: "No access to tag"});
                    return;
                }

                global.db.run("UPDATE tags SET name = ? WHERE id = ?", [tag_name, tag_id], (err) => {
                    if (err) {
                        console.error(err.message);
                        res.json({error: "Unknown error"});
                        returnl
                    }

                    res.json({success: "Tag renamed"});
                });
            });
        });
    },
    update_file_info(body, res) {

    },

    register_action(body, res) {

    },
    act_out(body, res) {

    },

    delete_tag(body, res) {

    },
    delete_file(body, res) {

    },
}

module.exports = methods;
