const express = require('express');
const router = express.Router();
const vitimaController = require('../controllers/vitima.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleCheck = require('../middlewares/roleCheck.middleware');

// ===============================
// ROTAS BÁSICAS DE VÍTIMA
// ===============================

// Criar nova vítima
router.post(
  '/',
  authMiddleware,
  roleCheck(['admin', 'perito']),
  vitimaController.createVitima
);

// Buscar vítimas por caso
router.get(
  '/caso/:casoId',
  authMiddleware,
  vitimaController.getVitimasByCaso
);

// Buscar vítima por ID
router.get(
  '/:id',
  authMiddleware,
  vitimaController.getVitimaById
);

// Atualizar vítima
router.put(
  '/:id',
  authMiddleware,
  roleCheck(['admin', 'perito']),
  vitimaController.updateVitima
);

// Deletar vítima
router.delete(
  '/:id',
  authMiddleware,
  roleCheck(['admin', 'perito']),
  vitimaController.deleteVitima
);

// ===============================
// ROTAS ESPECÍFICAS DE ODONTOGRAMA
// ===============================

// Obter odontograma completo
router.get(
  '/:id/odontograma',
  authMiddleware,
  vitimaController.getOdontograma
);

// Atualizar odontograma completo
router.put(
  '/:id/odontograma',
  authMiddleware,
  roleCheck(['admin', 'perito']),
  vitimaController.updateOdontograma
);

// Atualizar dente específico
router.put(
  '/:id/odontograma/dente/:numeroDente',
  authMiddleware,
  roleCheck(['admin', 'perito']),
  vitimaController.updateDente
);

// Adicionar condição a um dente específico
router.post(
  '/:id/odontograma/dente/:numeroDente/condicao',
  authMiddleware,
  roleCheck(['admin', 'perito']),
  vitimaController.addCondicaoDente
);

// Remover condição de um dente específico
router.delete(
  '/:id/odontograma/dente/:numeroDente/condicao/:condicaoId',
  authMiddleware,
  roleCheck(['admin', 'perito']),
  vitimaController.removeCondicaoDente
);

// Atualizar apenas observações de um dente
router.put(
  '/:id/odontograma/dente/:numeroDente/observacoes',
  authMiddleware,
  roleCheck(['admin', 'perito']),
  vitimaController.updateObservacoesDente
);

// ===============================
// ROTAS DE REGIÕES ANATÔMICAS
// ===============================

// Atualizar apenas as regiões anatômicas
router.put(
  '/:id/regioes-anatomicas',
  authMiddleware,
  roleCheck(['admin', 'perito']),
  vitimaController.updateRegioes
);

module.exports = router;