const cors = require('cors');

// ADICIONAR ANTES DAS SUAS ROTAS:
app.use(cors({
  origin: [
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://localhost:5173', 
    'https://sistema-olin.netlify.app',
    'https://opulent-capybara-5gw9g7p49q734xwj-5173.app.github.dev'
  ],
  credentials: true
}));
