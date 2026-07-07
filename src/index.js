require("dotenv").config(); 
const express = require("express");
const http_errors = require("http-errors");
const knex = require("knex")
const passport = require("./config/passport");
const jwt = require("jsonwebtoken");
// proteção de rotas
const authMiddleware = require("./middlewares/auth");
//  repositórios
const CoisaRepository = require("./repositories/CoisaRepository");
const EmprestimoRepository = require("./repositories/EmprestimoRepository");
const TagRepository = require("./repositories/TagRepository");

const PORT = process.env.PORT || 8001;
const HOSTNAME = process.env.HOSTNAME || "localhost";

const api = express();
api.use(express.json());
api.use(express.urlencoded({ extended: true }));

const conn = knex({
    client: "mysql",
    connection: {
        host: HOSTNAME,
        user: "root",
        password: "",
        database: "material"
    }
});
// Inicialização do módulo Passport no Express
api.use(passport.initialize());

// ==========================================
// ENDPOINTS DE AUTENTICAÇÃO PÚBLICOS
// ==========================================

// Rota que redireciona o cliente para a tela de consentimento do Google
api.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

api.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth/falha", session: false }),
    (req, res) => {
        // Geração do Token JWT baseado nos dados obtidos pelo perfil do Google
        const token = jwt.sign(
            { id: req.user.googleId, nome: req.user.nome, email: req.user.email },
            process.env.JWT_SECRET,
            { expiresIn: "8h" } 
        );

        // Retorna a confirmação e o token para ser usado nos cabeçalhos HTTP subsequentes
        res.status(200).json({
            mensagem: "Autenticação realizada com sucesso!",
            token: token,
            usuario: req.user
        });
    }
);

api.get("/auth/falha", (req, res) => {
    res.status(401).json({ erro: "Falha na validação de credenciais via Google OAuth." });
});

// ==========================================
// ROTAS GET (VISUALIZAÇÃO)
// ==========================================

// GET - visualizar coisas
api.use(authMiddleware);

api.get("/coisas", async (req, res) => {
    try {
        const coisas = await CoisaRepository.findAll();
        res.status(200).json(coisas);
    } catch (erro) {
        console.log(erro);
        res.status(500).json({ erro: "Erro ao buscar as coisas." });
    }
});
// GET - jogos
api.get("/jogos", async (req, res) => {
    try {
        const jogos = await CoisaRepository.findByTipo("jogo");
        res.status(200).json(jogos);
    } catch (erro) {
        console.log(erro);
        res.status(500).json({ erro: "Erro ao buscar os jogos." });
    }
});
// GET - objetos
api.get("/objetos", async (req, res) => {
    try {
        const objetos = await CoisaRepository.findByTipo("objeto");
        res.status(200).json(objetos);
    } catch (erro) {
        console.log(erro);
        res.status(500).json({ erro: "Erro ao buscar os objetos." });
    }
});
// GET - livros
api.get("/livros", async (req, res) => {
    try {
        const livros = await CoisaRepository.findByTipo("livro");
        res.status(200).json(livros);
    } catch (erro) {
        console.log(erro);
        res.status(500).json({ erro: "Erro ao buscar os livros." });
    }
});
// GET - emprestimos
api.get("/emprestimos", async (req, res) => {
    try {
        const emprestimos = await EmprestimoRepository.findAllWithCoisas();
        res.status(200).json(emprestimos);
    } catch (erro) {
        console.log(erro);
        res.status(500).json({ erro: "Erro ao buscar empréstimos." });
    }
});
// GET - listar todas as tags globais 
api.get("/tags", async (req, res) => {
    try {
        const tags = await TagRepository.findAll();
        res.status(200).json(tags);
    } catch (erro) {
        console.log(erro);
        res.status(500).json({ erro: "Erro ao buscar as tags." });
    }
});
// ==========================================
// ROTAS POST (CRIAÇÃO / CADASTRO)
// ==========================================

// POST - coisas 
api.post("/coisas", async (req, res) => {
    try {
        const { nome, tipo, estado_conservacao, tags } = req.body;

        if (!nome || !tipo) {
            return res.status(400).json({ erro: "Nome e tipo são obrigatórios." });
        }

        await CoisaRepository.create({ nome, tipo, estado_conservacao, tags });
        res.status(201).json({ mensagem: "Item, subcategoria e tags cadastrados com sucesso!" });
    } catch (erro) {
        console.log(erro);
        res.status(500).json({ erro: "Erro ao cadastrar o item." });
    }
});
// POST - realizar novo empréstimo 
api.post("/emprestimos", async (req, res) => {
    try {
        const { coisa_id, nome_pessoa, data_emprestimo } = req.body;

        if (!coisa_id || !nome_pessoa || !data_emprestimo) {
            return res.status(400).json({
                erro: "Item (coisa_id), nome da pessoa e data de empréstimo são obrigatórios."
            });
        }

        await EmprestimoRepository.create({ coisa_id, nome_pessoa, data_emprestimo });
        res.status(201).json({ mensagem: "Empréstimo registrado com sucesso!" });
    } catch (erro) {
        console.log(erro);
        res.status(500).json({ erro: "Erro ao registrar o empréstimo." });
    }
});
// POST - cadastrar uma nova tag global 
api.post("/tags", async (req, res) => {
    try {
        const { nome } = req.body;

        if (!nome) {
            return res.status(400).json({ erro: "O nome da tag é obrigatório." });
        }

        await TagRepository.create(nome);
        res.status(201).json({ mensagem: "Tag global criada com sucesso!" });
    } catch (erro) {
        console.log(erro);
        res.status(500).json({ erro: "Erro ao criar a tag." });
    }
});
// ==========================================
// ROTAS PUT (ATUALIZAÇÃO)
// ==========================================

// PUT - atualizar coisa 
api.put("/coisas/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, tipo, estado_conservacao } = req.body;

        await CoisaRepository.update(id, { nome, tipo, estado_conservacao });
        res.status(200).json({ mensagem: "Item atualizado com sucesso!" });
    } catch (erro) {
        console.log(erro);
        res.status(500).json({ erro: "Erro ao atualizar o item." });
    }
});
// PUT - devolver empréstimo
api.put("/emprestimos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const atualizado = await EmprestimoRepository.returnItem(id);
            
        if (!atualizado) {
            return res.status(404).json({ erro: "Empréstimo não encontrado" });
        }
        res.status(200).json({ mensagem: "Item devolvido com sucesso!" });
    } catch (erro) {
        console.log(erro);
        res.status(500).json({ erro: "Erro ao devolver o item." });
    }
});
// ==========================================
// ROTAS DELETE (EXCLUSÃO)
// ==========================================

// DELETE - coisas
api.delete("/coisas/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletado = await CoisaRepository.delete(id);
        
        if (!deletado) {
            return res.status(404).json({ erro: "Item não encontrado" });
        }
        res.status(200).json({ mensagem: "Item excluído com sucesso!" });
    } catch (erro) {
        console.log(erro);
        res.status(500).json({ erro: "Erro ao excluir o item." });
    }
});
// DELETE - empréstimos
api.delete("/emprestimos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletado = await EmprestimoRepository.delete(id);

        if (!deletado) {
            return res.status(404).json({ erro: "Empréstimo não encontrado" });
        }
        res.status(200).json({ mensagem: "Empréstimo removido com sucesso!" });
    } catch (erro) {
        console.log(erro);
        res.status(500).json({ erro: "Erro ao deletar empréstimo." });
    }
});

api.listen(PORT, HOSTNAME, () => {
    console.log(`Servidor rodando em http://${HOSTNAME}:${PORT}`);
});
