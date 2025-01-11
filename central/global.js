const sqlite = require("sqlite3").verbose();
const db = new sqlite.Database("db/central.db", sqlite.OPEN_READWRITE, (err) => { if (err) console.error(err.message); else console.log("Connected to db.") });

module.exports = { db }

