const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Importado o middleware cors
const app = express();
const uri = "mongodb+srv://amandapriscilaa15:S99rV4gzO6u9MYaw@cluster0.sd5eblw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Substitua isso!

mongoose
  .connect(uri, {
    //useNewUrlParser: true,
    //useUnifiedTopology: true,
  })
  .then(() => console.log('Conectado ao MongoDB Atlas'))
  .catch(err => console.error('Erro ao conectar ao MongoDB Atlas:', err));

// Middleware para habilitar o CORS
app.use(cors());

// Middleware para parsing de JSON
app.use(express.json());

// Importa a função createAdmin para executá-la ao iniciar
require('./create/createAdmin');

// Rotas
const authRoutes = require('./routes/auth.routes'); // Login, geração de token
const protectedRoutes = require('./routes/protected.routes'); // Rotas protegidas genéricas (tipo /api/protegido)
const userRoutes = require('./routes/user.routes'); // Cadastro, update e listagem de usuários
const caseRoutes = require('./routes/case.routes'); // Gerenciamento de casos (CRUD)
const evidenceRoutes = require('./routes/evidence.routes'); // Gerenciamento de evidências
const laudoRoutes = require('./routes/laudo.routes'); // Gerenciamento de laudos
const relatorioRoutes = require('./routes/relatorio.routes'); // criação do relatório final
const historicoRoutes = require('./routes/historico.routes'); // Gerenciamento de histórico

app.use('/api', authRoutes); // /api/login
app.use('/api', protectedRoutes); // /api/protegido
app.use('/api/users', userRoutes); // /api/usuarios
app.use('/api/casos', caseRoutes); // /api/casos
app.use('/api/evidencias', evidenceRoutes); // /api/evidencias
app.use('/api/laudos', laudoRoutes); // /api/laudos
app.use('/api/relatorios', relatorioRoutes); // /api/relatorio
app.use('/api/historico', historicoRoutes); // /api/historico

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API de Gerenciamento de Casos Periciais está funcionando!' });
});

module.exports = app;

