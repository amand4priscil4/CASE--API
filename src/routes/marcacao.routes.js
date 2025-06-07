const express = require('express');
const router = express.Router();
const marcacaoController = require('../controllers/marcacao.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleCheck = require('../middlewares/roleCheck.middleware');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Criar nova marcação anatômica
router.post(
  '/vitima/:vitimaId',
  roleCheck(['admin', 'perito', 'assistente']),
  marcacaoController.criarMarcacao
);

// Listar marcações por vítima
router.get(
  '/vitima/:vitimaId',
  roleCheck(['admin', 'perito', 'assistente']),
  marcacaoController.listarMarcacoesPorVitima
);

// Listar marcações agrupadas por anatomia
router.get(
  '/vitima/:vitimaId/agrupadas',
  roleCheck(['admin', 'perito', 'assistente']),
  marcacaoController.listarMarcacoesAgrupadas
);

// Buscar marcação específica por ID
router.get(
  '/:id',
  roleCheck(['admin', 'perito', 'assistente']),
  marcacaoController.buscarMarcacao
);

// Atualizar marcação
router.put(
  '/:id',
  roleCheck(['admin', 'perito', 'assistente']),
  marcacaoController.atualizarMarcacao
);

// Remover marcação (soft delete)
router.delete(
  '/:id',
  roleCheck(['admin', 'perito', 'assistente']),
  marcacaoController.removerMarcacao
);

// Obter tipos de anatomia disponíveis (para frontend)
router.get(
  '/tipos/anatomia',
  roleCheck(['admin', 'perito', 'assistente']),
  marcacaoController.obterTiposAnatomia
);

module.exports = router;