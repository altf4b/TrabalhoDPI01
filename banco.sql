-- Cria o banco de dados se ainda não existir
CREATE DATABASE IF NOT EXISTS material;
USE material;

-- Tabela principal
CREATE TABLE IF NOT EXISTS coisas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo ENUM('jogo','livro','objeto') NOT NULL,
    estado_conservacao VARCHAR(50) DEFAULT 'Bom'
);

-- Tabela de tags
CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

-- Tabela de relacionamento Tags x Coisas (M:N)
CREATE TABLE IF NOT EXISTS coisa_tags (
    coisa_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (coisa_id, tag_id),
    FOREIGN KEY (coisa_id) REFERENCES coisas(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Tabelas filhas de Categoria
CREATE TABLE IF NOT EXISTS jogos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coisa_id INT NOT NULL,
    FOREIGN KEY (coisa_id) REFERENCES coisas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS livros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coisa_id INT NOT NULL,
    FOREIGN KEY (coisa_id) REFERENCES coisas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS objetos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coisa_id INT NOT NULL,
    FOREIGN KEY (coisa_id) REFERENCES coisas(id) ON DELETE CASCADE
);

-- Tabela de Empréstimos
CREATE TABLE IF NOT EXISTS emprestimos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coisa_id INT NOT NULL,
    nome_pessoa VARCHAR(100) NOT NULL,
    data_emprestimo DATE NOT NULL,
    data_devolucao DATE,
    status ENUM('emprestado','devolvido') DEFAULT 'emprestado',
    FOREIGN KEY (coisa_id) REFERENCES coisas(id) ON DELETE CASCADE
);

-- Inserção de dados iniciais (Exemplos)
INSERT INTO coisas (nome, tipo, estado_conservacao)
VALUES
('Minecraft', 'jogo', 'Excelente'),
('FIFA 25', 'jogo', 'Bom'),
('Dom Casmurro', 'livro', 'Bom'),
('Harry Potter', 'livro', 'Novo'),
('Martelo', 'objeto', 'Usado'),
('Chave de Fenda', 'objeto', 'Bom');

-- Adicionando registros nas tabelas filhas baseados nos IDs criados
INSERT INTO jogos (coisa_id) VALUES (1), (2);
INSERT INTO livros (coisa_id) VALUES (3), (4);
INSERT INTO objetos (coisa_id) VALUES (5), (6);

-- Registro de exemplo de empréstimo
INSERT INTO emprestimos (coisa_id, nome_pessoa, data_emprestimo, status)
VALUES
(3, 'João', '2026-06-27', 'emprestado'),
(5, 'Maria', '2026-06-25', 'devolvido');
