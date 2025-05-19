const express = require('express');
const router = express.Router();
const vitimaController = require('../controllers/vitima.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleCheck = require('../middlewares/roleCheck.middleware');

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

// Atualizar apenas o odontograma
router.put(
  '/:id/odontograma',
  authMiddleware,
  roleCheck(['admin', 'perito']),
  vitimaController.updateOdontograma
);

// Atualizar apenas as regiões anatômicas
router.put(
  '/:id/regioes-anatomicas',
  authMiddleware,
  roleCheck(['admin', 'perito']),
  vitimaController.updateRegioes
);

// Deletar vítima
router.delete(
  '/:id',
  authMiddleware,
  roleCheck(['admin', 'perito']),
  vitimaController.deleteVitima
);

module.exports = router;