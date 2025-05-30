const express = require('express');
const router = express.Router();

const laudoController = require('../controllers/laudo.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleCheck = require('../middlewares/roleCheck.middleware');

// Criar laudo de evidência
router.post('/', authMiddleware, roleCheck(['admin', 'perito']), laudoController.createLaudo);
// Buscar laudos por caso
router.get('/', authMiddleware, laudoController.getLaudosByCaso);

module.exports = router;
