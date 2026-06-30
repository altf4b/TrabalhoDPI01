const conn = require("../config/database");

class TagRepository {
    async findAll() {
        return await conn("tags").select("*");
    }

    async create(nome) {
        return await conn("tags").insert({ nome });
    }
}

module.exports = new TagRepository();