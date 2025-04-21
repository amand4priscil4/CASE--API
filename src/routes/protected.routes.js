const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');

// Essa rota só funciona SE o token for válido
router.get('/protegido', authMiddleware, (req, res) => {
  res.json({
    message: 'Parabéns! Você está autenticado.',
    user: req.user // isso aqui mostra os dados decodificados do token
  });
});

module.exports = router;
