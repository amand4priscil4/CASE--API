const express = require('express');
const router = express.Router();

// Middlewares de segurança e controle de acesso
const authMiddleware = require('../middlewares/auth.middleware');
const roleCheck = require('../middlewares/roleCheck.middleware');

// Controller que contém as funções que fazem o trabalho real (CRUD dos casos)
const caseController = require('../controllers/case.controller');

// Criar novo caso - admin e perito
router.post('/', authMiddleware, roleCheck(['admin', 'perito']), caseController.createCase);

// Listar todos os casos - admin, perito e assistente
router.get(
  '/',
  authMiddleware,
  roleCheck(['admin', 'perito', 'assistente']),
  caseController.getAllCases
);

// Buscar caso por ID
router.get(
  '/:id',
  authMiddleware,
  roleCheck(['admin', 'perito', 'assistente']),
  caseController.getCaseById
);

// Editar caso por ID
router.put('/:id', authMiddleware, roleCheck(['admin', 'perito']), caseController.updateCase);

// Deletar cado por ID
router.delete(
  '/:id',
  authMiddleware,
  roleCheck(['admin']), // só o chefão pode apagar
  caseController.deleteCase
);

module.exports = router;
