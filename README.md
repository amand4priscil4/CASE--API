# 🦷 Odonto Legal - API
Odonto Legal é uma API RESTful desenvolvida em Node.js com Express, voltada para o gerenciamento de processos odontológicos como casos clínicos, laudos, relatórios e evidências. A aplicação também oferece controle de acesso baseado em funções (roles), autenticação segura e modularização por responsabilidades.

## ❗ Problema

Profissionais da odontologia e peritos enfrentam dificuldades no controle e centralização de informações clínicas, laudos, evidências e relatórios de forma segura e organizada.


## 💡 Solução

A API "Odonto Legal" automatiza esse processo com um sistema robusto e seguro de gerenciamento de dados odontológicos, controle de usuários por função e rotas protegidas com autenticação JWT.


## 📌 Funcionalidades
👤 Cadastro e autenticação de usuários

### 🔒 Controle de acesso por tipo de usuário (admin, comum, etc.)

### 📁 Gerenciamento de casos clínicos, laudos, relatórios e evidências

🧾 Geração e listagem de relatórios

📊 Avaliações e validações com middleware personalizado

✅ Rotas protegidas e organizadas

## ⚙️ Tecnologias Utilizadas
Node.js — Runtime JavaScript

Express — Framework para servidor HTTP

MongoDB / Mongoose — Banco de dados NoSQL

JWT (JSON Web Token) — Autenticação

Bcrypt — Criptografia de senhas

Swagger (opcional) — Documentação da API

VSCode — Editor utilizado

🛠️ Estrutura de Pastas
bash
Copiar
Editar
src/
├── controllers/           # Lógica das requisições
├── middlewares/           # Verificações de autenticação e roles
├── models/                # Schemas do MongoDB
├── routes/                # Definição das rotas
├── startup/               # Arquivos de inicialização e utilitários
└── app.js                 # Arquivo principal da aplicação
🧩 Controle de Acesso (Roles)
A verificação de acesso é feita por middleware personalizado:

javascript
Copiar
Editar
// Exemplo do roleCheck.middleware.js
if (!rolesPermitidos.includes(role)) {
  return res.status(403).json({ message: 'Acesso não autorizado' });
}
Usuários têm papéis definidos.

Apenas funções autorizadas acessam determinadas rotas.

Middleware dedicado garante segurança e organização.

## 🚀 Como Executar o Projeto
🔧 Pré-requisitos
Node.js v16+

MongoDB local ou Atlas

Docker (opcional)

## 📥 Instalação
bash
Copiar
Editar
# Clone o repositório
git clone (https://github.com/odontolegal/Olin---API.git)

# Acesse o diretório
cd odonto-legal-api

# Instale as dependências
npm install
▶️ Execução Local
bash
Copiar
Editar
## Para rodar localmente
npm start
🐳 Com Docker (opcional)
bash
Copiar
Editar
docker-compose up --build
🔐 Autenticação e Segurança
JWT para autenticação

Hash de senha com bcrypt

Middleware para rotas protegidas

Validação de permissões por papel (role)

## 📬 Rotas Principais

Método	Rota	Descrição
POST	/auth/login	Login de usuários
POST	/users/register	Registro de novos usuários
GET	/cases	Listagem de casos clínicos
POST	/laudos	Criação de laudos
GET	/relatorios	Acesso a relatórios
...	...	Outras rotas definidas por módulo
🧪 Testes
Testes manuais via Postman.

Considerando que a API está rodando em 
https://case-api-icfc.onrender.com, 
aqui está a lista completa de endpoints:
Autenticação (auth.routes.js):
POST https://case-api-icfc.onrender.com/api/login - Rota de login
Casos (case.routes.js):
POST https://case-api-icfc.onrender.com/api/casos - Criar novo caso
GET https://case-api-icfc.onrender.com/api/casos - Listar todos os casos
GET https://case-api-icfc.onrender.com/api/casos/:id - Buscar caso por ID (substitua :id pelo ID do caso)
PUT https://case-api-icfc.onrender.com/api/casos/:id - Editar caso por ID (substitua :id pelo ID do caso)
DELETE https://case-api-icfc.onrender.com/api/casos/:id - Deletar caso por ID (substitua :id pelo ID do caso)
Evidências (evidence.routes.js):
POST https://case-api-icfc.onrender.com/api/evidencias - Criar evidência (com upload de arquivo)
GET https://case-api-icfc.onrender.com/api/evidencias - Listar evidências por caso
PUT https://case-api-icfc.onrender.com/api/evidencias/:id - Editar evidência (substitua :id pelo ID da evidência)
Histórico (historico.routes.js):
GET https://case-api-icfc.onrender.com/api/historico/caso/:caseId - Listar histórico por caso (substitua :caseId pelo ID do caso)
GET https://case-api-icfc.onrender.com/api/historico/todos - Listar histórico geral
Laudo (laudo.routes.js):
POST https://case-api-icfc.onrender.com/api/laudos - Criar laudo
Protegido (protected.routes.js):
GET https://case-api-icfc.onrender.com/api/protegido - Rota protegida (requer token válido)
Relatório (relatorio.routes.js):
POST https://case-api-icfc.onrender.com/api/relatorios/:caseId - Criar relatório final para um caso (substitua :caseId pelo ID do caso)
GET https://case-api-icfc.onrender.com/api/relatorios/:caseId - Buscar relatório final de um caso (substitua :caseId pelo ID do caso)
GET https://case-api-icfc.onrender.com/api/relatorios/:caseId/pdf - Exportar relatório em PDF (substitua :caseId pelo ID do caso)
Usuário (user.routes.js):
POST https://case-api-icfc.onrender.com/api/users - Cadastrar um novo usuário (restrita a administradores)
GET https://case-api-icfc.onrender.com/api/users - Listar todos os usuários
GET https://case-api-icfc.onrender.com/api/users/:id - Obter usuário específico
PUT https://case-api-icfc.onrender.com/api/users/:id - Atualizar usuário
DELETE https://case-api-icfc.onrender.com/api/users/:id - Deletar usuário


Testes automatizados ainda em desenvolvimento.
![image](https://github.com/user-attachments/assets/42c54317-357e-4e1f-845b-5e3d97b92cda)

https://sistemaolin.netlify.app/
