const global = require("./global");

const boring = {
    // boring methods
    encrypt_array(json) {
        return JSON.stringify(json).replace("[", ",").replace("]", ",");
    },

    decrypt_array(string) {
        return JSON.parse(string.replace(",", "[").slice(0, -1) + "]");
    },

    authenticate_user(identifier, id_type, password, res, callback) { // id type can be id or phone
        global.db.get(`SELECT * FROM users WHERE ${id_type} = ?`, [identifier], (err, user) => {
            if (err) {
                console.error(err.message);
                res.json({error: "Unknown error"});
                return;
            }

            if (user == undefined) {
                res.json({error: "User not found"});
                return;
            }

            if (user.password != password) {
                res.json({error: "Password mismatch"});
                return;
            }

            // authentication was successful
            callback(user);
        });
    }
}

module.exports = boring;
