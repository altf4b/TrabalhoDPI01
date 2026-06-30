const conn = require("../config/database");

class EmprestimoRepository {
    async findAllWithCoisas() {
        return await conn("emprestimos")
            .join("coisas", "emprestimos.coisa_id", "coisas.id")
            .select(
                "emprestimos.id",
                "coisas.nome",
                "emprestimos.nome_pessoa",
                "emprestimos.data_emprestimo",
                "emprestimos.data_devolucao",
                "emprestimos.status"
            );
    }

    async create({ coisa_id, nome_pessoa, data_emprestimo }) {
        return await conn("emprestimos").insert({
            coisa_id,
            nome_pessoa,
            data_emprestimo,
            status: "emprestado"
        });
    }

    async returnItem(id) {
        return await conn("emprestimos")
            .where({ id })
            .update({
                status: "devolvido",
                data_devolucao: new Date() 
            });
    }

    async delete(id) {
        return await conn("emprestimos").where({ id }).del();
    }
}

module.exports = new EmprestimoRepository();