const knex = require("knex");

const conn = knex({
    client: "mysql",
    connection: {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "material"
    }
});

module.exports = conn;