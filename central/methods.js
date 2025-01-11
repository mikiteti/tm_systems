const global = require("./global");
const boring = require("./boring");

const methods = {
    create_user(body, res) { // insert new row to the users table with the data provided by the parameters and return the row
        const { name, username, phone, password } = body;
        
        global.db.get("SELECT id FROM users WHERE phone = ?", [phone], (err, user) => {
            if (err) {
                console.error(err.message);
                res.json({error: "Unknown error"});
                return;
            }
            if (user) {
                res.json({error: "Phone number taken"});
                return;
            }

            global.db.get("SELECT username FROM users WHERE username = ?", [username], (err, user) => {
                if (err) {
                    console.error(err.message);
                    res.json({error: "Unknown error"});
                    return;
                }

                if (user) {
                    res.json({error: "Username taken"});
                    return;
                }

                const date = new Date().getTime();

                global.db.run("INSERT INTO users (name, username, phone, password, date_of_creation, last_update) VALUES (?, ?, ?, ?, ?, ?)", [name, username, phone, password, date, date], (err2) => {
                    if (err2) console.error(err2.message);

                    global.db.get("SELECT * FROM users WHERE phone = ?", [phone], (err3, user2) => {
                        if (err3) console.error(err3.message);

                        user2.success = "User created";
                        res.json(user2);
                    });
                });
            });
        });
    },

    delete_user(body, res) {
        const { id, password } = body;

        boring.authenticate_user(id, "id", password, res, () => {
            global.db.run("DELETE FROM users WHERE id = ?", [id], err => {
                if (err) {
                    console.error(err.message);
                    res.json({error: "Unknown error"});
                    return;
                }

                res.json({success: "User deleted"});
            })
        });
    },

    update_user(body, res) { // updatable slots: name, username, settings, setting.*
        const { id, password, update_name, update_value } = body;

        boring.authenticate_user(id, "id", password, res, (current_user) => {
            if (update_name == "username") {
                if (!update_value) {
                    res.json({error: "Invalid username"});
                    return;
                }

                global.db.get("SELECT id FROM users WHERE username = ?", [update_value], (err, user) => {
                    if (err) {
                        console.error(err.message);
                        res.json({error: "Unknown error"});
                        return;
                    }
                    
                    if (user) {
                        res.json({error: "User with the given username already exists"});
                        return;
                    }

                    global.db.run("UPDATE users SET username = ? WHERE id = ?", [update_value, id], err2 => {
                        if (err2) {
                            console.error(err2.message);
                            res.json({error: "Unknown error"});
                            return;
                        }

                        res.json({success: "Username changed"});
                    })
                })
            }
            else if (update_name.includes("settings")) {
                const setting_name = update_name.split(".")[1];
                const settings = JSON.parse(current_user.settings || "{}");
                
                settings[setting_name] = update_value;

                global.db.run("UPDATE users SET settings = ? WHERE id = ?", [JSON.stringify(settings), id], err => {
                    if (err) {
                        console.error(err.message);
                        res.json({error: "Unknown error"});
                    }

                    res.json({success: "Setting changed"});
                });
            }
            else if (update_name == "name") {
                global.db.run("UPDATE users SET name = ? WHERE id = ?", [update_value, id], err => {
                    if (err) {
                        console.error(err.message);
                        res.json({error: "Unknown error"});
                    }

                    res.json({success: "Name updated"});
                })
            }
        });
    },

    get_user(body, res) {
        const { id, password, properties } = body;

        boring.authenticate_user(id, "id", password, res, (user) => {
            let filtered = {};
            if (properties) {
                for (const property of properties) filtered[property] = user[property];
            } else filtered = user;
            filtered.success = "User returned";
            res.json(filtered);
        });
    }
}

module.exports = methods;
