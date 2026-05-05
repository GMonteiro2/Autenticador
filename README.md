# 🔐 Autenticador

Sistema completo de autenticação desenvolvido com Node.js, Express e MySQL.

## 🚀 Funcionalidades

- ✅ Cadastro de usuários com senha criptografada (bcrypt)
- ✅ Verificação de email
- ✅ Login com JWT
- ✅ Recuperação de senha por email
- ✅ Autenticação com Google (OAuth 2.0)
- ✅ Rotas protegidas com middleware
- ✅ Frontend com páginas de login, cadastro e perfil

## 🛠️ Tecnologias

- Node.js
- Express
- MySQL
- JSON Web Token (JWT)
- Bcrypt
- Nodemailer
- Passport.js (OAuth 2.0)

## ⚙️ Como rodar o projeto

1. Clone o repositório
2. Instale as dependências:
```bash
   npm install
```
3. Crie o arquivo `.env` com as variáveis:

PORT=3000
JWT_SECRET=
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=autenticador
GMAIL_USER=
GMAIL_PASS=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

4. Crie o banco de dados MySQL e rode as migrations
5. Inicie o servidor:
```bash
   node index.js
```

## 📡 Rotas da API

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/auth/register | Cadastro de usuário |
| POST | /api/auth/login | Login |
| GET | /api/auth/verify-email | Verificação de email |
| POST | /api/auth/reset-password | Solicitar recuperação de senha |
| POST | /api/auth/new-password | Redefinir senha |
| GET | /api/auth/oauth | Login com Google |
| GET | /api/auth/profile | Perfil do usuário (protegida) |
