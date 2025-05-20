const express = require('express');
const router = express.Router();
const caseController = require('../controllers/case.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Criar novo caso
router.post('/', authMiddleware, caseController.createCase);

// Buscar todos os casos
router.get('/', authMiddleware, caseController.getAllCases);

// Nova rota: Buscar casos por proximidade geográfica
router.get('/nearby', authMiddleware, caseController.getCasesByLocation);

// Buscar um caso específico
router.get('/:id', authMiddleware, caseController.getCaseById);

// Atualizar um caso
router.put('/:id', authMiddleware, caseController.updateCase);

// Deletar um caso
router.delete('/:id', authMiddleware, caseController.deleteCase);

module.exports = router;
