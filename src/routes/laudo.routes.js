const express = require('express');
const router = express.Router();

const laudoController = require('../controllers/laudo.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleCheck = require('../middlewares/roleCheck.middleware');

// Exemplo de rota:
router.post('/', authMiddleware, roleCheck(['admin', 'perito']), laudoController.createLaudo);

module.exports = router;
