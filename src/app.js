const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const { swaggerUi, specs } = require('../swagger'); // ou './swagger' se estiver dentro de src


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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Importa a função createAdmin para executá-la ao iniciar
require('./create/createAdmin');

// Importações das rotas
const authRoutes = require('./routes/auth.routes'); 
const protectedRoutes = require('./routes/protected.routes'); 
const userRoutes = require('./routes/user.routes'); 
const caseRoutes = require('./routes/case.routes'); 
const evidenceRoutes = require('./routes/evidence.routes'); 
const laudoRoutes = require('./routes/laudo.routes'); 
const relatorioRoutes = require('./routes/relatorio.routes'); 
const historicoRoutes = require('./routes/historico.routes'); 
const vitimaRoutes = require('./routes/vitima.routes'); 
const laudoOdontologicoRoutes = require('./routes/laudoOdontologico.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const marcacaoRoutes = require('./routes/marcacao.routes');

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
app.use('/api/laudos-odontologicos', laudoOdontologicoRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/marcacoes', marcacaoRoutes);


// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API de Gerenciamento de Casos Periciais está funcionando!' });
});

module.exports = app;