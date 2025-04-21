const jwt = require('jsonwebtoken');

// Middleware para verificar o token JWT
module.exports = (req, res, next) => {
  // Obtém o token do cabeçalho Authorization
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  // O token geralmente vem no formato "Bearer <token>", então removemos o "Bearer "
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token malformado' });
  }

  try {
    // Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua-chave-secreta');
    req.user = decoded; // Armazena os dados do usuário decodificados em req.user
    next(); // Prossegue para o próximo middleware/rota
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};
