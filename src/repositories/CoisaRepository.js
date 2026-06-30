const conn = require("../config/database");

class CoisaRepository {
    async findAll() {
        return await conn("coisas");
    }

    async findByTipo(tipo) {
        return await conn("coisas").where("tipo", tipo);
    }

    async create({ nome, tipo, estado_conservacao, tags }) {
        return await conn.transaction(async (trx) => {
            
            const [coisa_id] = await trx("coisas").insert({ 
                nome, 
                tipo,
                estado_conservacao: estado_conservacao || "Bom"
            });

            
            if (tipo === "jogo") {
                await trx("jogos").insert({ coisa_id });
            } else if (tipo === "livro") {
                await trx("livros").insert({ coisa_id });
            } else if (tipo === "objeto") {
                await trx("objetos").insert({ coisa_id });
            } else {
                throw new Error("Tipo de item inválido fornecido.");
            }

            
            if (tags && Array.isArray(tags) && tags.length > 0) {
                const vinculoTags = tags.map(tag_id => ({
                    coisa_id,
                    tag_id
                }));
                await trx("coisa_tags").insert(vinculoTags);
            }

            return coisa_id;
        });
    }

    async update(id, { nome, tipo, estado_conservacao }) {
        return await conn("coisas")
            .where({ id })
            .update({ nome, tipo, estado_conservacao });
    }

    async delete(id) {
        return await conn("coisas").where("id", id).del();
    }
}

module.exports = new CoisaRepository();