const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Configuração do MongoDB
const uri = "mongodb+srv://amandapriscilaa15:S99rV4gzO6u9MYaw@cluster0.sd5eblw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(uri, {
    //useNewUrlParser: true,
    //useUnifiedTopology: true,
  })
  .then(() => console.log('Conectado ao MongoDB Atlas'))
  .catch(err => console.error('Erro ao conectar ao MongoDB Atlas:', err));

// Middleware para habilitar o CORS
app.use(
  cors({
    origin: [
      'http://127.0.0.1:5500', 
      'http://localhost:3000',
      'http://localhost:5173',
      'https://sistema-olin.netlify.app',
      'https://opulent-capybara-5gw9g7p49q734xwj-5173.app.github.dev'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

// Middleware para parsing de JSON
app.use(express.json());

// Importa a função createAdmin para executá-la ao iniciar
require('./create/createAdmin');

// Importações das rotas
const authRoutes = require('./routes/auth.routes'); // Login, geração de token
const protectedRoutes = require('./routes/protected.routes'); // Rotas protegidas genéricas
const userRoutes = require('./routes/user.routes'); // Cadastro, update e listagem de usuários
const caseRoutes = require('./routes/case.routes'); // Gerenciamento de casos (CRUD)
const evidenceRoutes = require('./routes/evidence.routes'); // Gerenciamento de evidências
const laudoRoutes = require('./routes/laudo.routes'); // Gerenciamento de laudos
const relatorioRoutes = require('./routes/relatorio.routes'); // Criação do relatório final
const historicoRoutes = require('./routes/historico.routes'); // Gerenciamento de histórico
const vitimaRoutes = require('./routes/vitima.routes'); // Gerenciamento de vítimas

// Configuração das rotas
app.use('/api', authRoutes); // /api/login
app.use('/api', protectedRoutes); // /api/protegido
app.use('/api/users', userRoutes); // /api/users
app.use('/api/casos', caseRoutes); // /api/casos
app.use('/api/evidencias', evidenceRoutes); // /api/evidencias
app.use('/api/laudos', laudoRoutes); // /api/laudos
app.use('/api/relatorios', relatorioRoutes); // /api/relatorios
app.use('/api/historico', historicoRoutes); // /api/historico
app.use('/api/vitimas', vitimaRoutes); // /api/vitimas

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API de Gerenciamento de Casos Periciais está funcionando!' });
});

module.exports = app;