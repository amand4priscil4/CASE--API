const express = require('express');
const router = express.Router();

const laudoController = require('../controllers/laudo.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleCheck = require('../middlewares/roleCheck.middleware');

// Criar laudo (apenas admin e perito)
router.post('/', authMiddleware, roleCheck(['admin', 'perito']), laudoController.createLaudo);

// Buscar laudos por caso (qualquer usuário autenticado)
router.get('/', authMiddleware, laudoController.getLaudosByCaso);

// Buscar todos os laudos (apenas admin)
router.get('/todos', authMiddleware, roleCheck(['admin']), laudoController.getAllLaudos);

// Buscar laudo por ID (qualquer usuário autenticado)
router.get('/:id', authMiddleware, laudoController.getLaudoById);

// Atualizar laudo (apenas admin, perito autor)
router.put('/:id', authMiddleware, roleCheck(['admin', 'perito']), laudoController.updateLaudo);

// Deletar laudo (apenas admin, perito autor)
router.delete('/:id', authMiddleware, roleCheck(['admin', 'perito']), laudoController.deleteLaudo);

module.exports = router;