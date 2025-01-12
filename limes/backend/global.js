const sqlite = require("sqlite3").verbose();
const db = new sqlite.Database("db/limes.db", sqlite.OPEN_READWRITE, (err) => { if (err) console.error(err.message); else console.log("Connected to limes.") });

module.exports = { db };
