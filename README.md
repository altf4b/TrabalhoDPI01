# Gerenciador de Inventário Pessoal API (Node.js + Express)

Projeto de API REST em formato JSON para a gestão de itens pessoais (jogos, livros, objetos) e controle de empréstimos. Desenvolvido com arquitetura no Padrão Repository, autenticação Google OAuth 2.0 + JWT e persistência de dados em MySQL.

**Desenvolvedores:** Fabricio Nascimento e Wallison Mutti

## Requisitos

* Node.js instalado
* Banco de Dados MySQL (via XAMPP, WAMP ou Workbench)
* Projeto no Google Cloud para criar credenciais OAuth

## Dependencias

Dependências principais do projeto:

* express
* dotenv
* jsonwebtoken (JWT)
* knex
* mysql / mysql2
* passport
* passport-google-oauth20

## Instalar e rodar

1. Clone o repositório.
2. Crie e configure o banco de dados rodando o script `banco.sql` no seu MySQL.
3. Instale as dependências:

```bash
npm install

```

4. Inicie o servidor:

```bash
node src/index.js

```

Aplicação rodando em: `http://localhost:8001`

## Configurar Google OAuth (passo a passo)

1. Abra o Google Cloud Console em `https://console.cloud.google.com/`.
2. Crie (ou selecione) um projeto.
3. No menu, acesse `APIs e serviços` > `Tela de consentimento OAuth`.
4. Configure a tela de consentimento:
* Tipo: `Externo`
* Preencha o nome do app e emails de suporte.


5. Vá para `Credenciais` > `Criar credenciais` > `ID do cliente OAuth`.
6. Tipo de aplicativo: `Aplicativo da Web`.
7. Em `URIs de redirecionamento autorizados`, adicione:
* `http://localhost:8001/auth/google/`


8. Salve e copie o `Client ID` e o `Client Secret`.

## Configurar variaveis de ambiente

Crie um arquivo `.env` na raiz do projeto (use o `.env.example` como base) e preencha com os seus dados:

```env
# Configurações do Servidor
PORT=8001
HOSTNAME=localhost

# Configurações do Banco de Dados MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=material

# Configurações do Google OAuth
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8001/auth/google/callback

# Segurança JWT
JWT_SECRET=sua-chave-secreta-jwt-gerada

```

## Rotas principais

**Autenticação (Públicas)**

* `GET /auth/google` - Inicia login com o Google
* `GET /auth/google/callback` - Callback OAuth (retorna o Token JWT)
* `GET /auth/falha` - Rota de erro de autenticação

**Coisas / Inventário (Protegidas por JWT)**

* `GET /coisas` - Lista todos os itens
* `GET /jogos` | `/livros` | `/objetos` - Filtra por subcategoria
* `POST /coisas` - Cadastra um novo item (com categorias, conservação e tags)
* `PUT /coisas/:id` - Atualiza dados de um item
* `DELETE /coisas/:id` - Remove um item

**Empréstimos (Protegidas por JWT)**

* `GET /emprestimos` - Lista o histórico de empréstimos (com JOIN)
* `POST /emprestimos` - Registra a saída/empréstimo de um item
* `PUT /emprestimos/:id` - Devolve um item (atualiza status para devolvido)
* `DELETE /emprestimos/:id` - Remove o registro de empréstimo

**Tags Globais (Protegidas por JWT)**

* `GET /tags` - Lista as tags disponíveis
* `POST /tags` - Cria uma nova tag global

## Estrutura

O projeto segue a divisão de responsabilidades baseada no **Padrão Repository**:

* `src/index.js` - Arquivo principal, inicializa o Express e gerencia as rotas HTTP.
* `src/config/database.js` - Centraliza a conexão do Knex com o MySQL.
* `src/config/passport.js` - Configuração da estratégia Google OAuth.
* `src/middlewares/auth.js` - Middleware global para validação e bloqueio via JWT.
* `src/repositories/CoisaRepository.js` - Lógica de acesso a dados para itens e subcategorias.
* `src/repositories/EmprestimoRepository.js` - Lógica de banco para saídas e devoluções.
* `src/repositories/TagRepository.js` - Lógica de acesso à tabela de tags globais.
* `banco.sql` - Script de criação das tabelas e chaves estrangeiras.

## Banco de dados

* O banco `material` roda em MySQL.
* O mapeamento principal utiliza a tabela `coisas` ligada a tabelas filhas (`jogos`, `livros`, `objetos`) com relacionamento 1:1.
* A categorização é reforçada por Tags Globais (`tags`) e uma tabela pivô `coisa_tags` (M:N).
* O controle de saídas é mantido na tabela `emprestimos`, que salva o nome da pessoa, datas e o status da posse atual.

## Autenticação e Segurança (JWT)

* A API não utiliza sessões persistentes em memória. A autenticação é baseada em **Token (Stateless)**.
* Ao fazer login pelo `/auth/google`, o usuário recebe um Token JWT assinado.
* Para realizar qualquer operação de CRUD, o cliente (ex: Thunder Client ou Frontend) deve enviar esse token no cabeçalho das requisições na forma: `Authorization: Bearer <SEU_TOKEN>`.
