// routes/ia.routes.js
const express = require('express');
const router = express.Router();
const iaController = require('../controllers/ia.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware);

// Rota 1: Gerar Laudo de Evidência com IA
// POST /api/ia/casos/:caseId/gerar-laudo-evidencia
router.post('/casos/:caseId/gerar-laudo-evidencia', iaController.gerarLaudoEvidencia);

// Rota 2: Gerar Laudo Odontológico com IA
// POST /api/ia/casos/:caseId/gerar-laudo-odontologico
router.post('/casos/:caseId/gerar-laudo-odontologico', iaController.gerarLaudoOdontologico);

// Rota 3: Gerar Relatório Final com IA
// POST /api/ia/casos/:caseId/gerar-relatorio-final
router.post('/casos/:caseId/gerar-relatorio-final', iaController.gerarRelatorioFinal);

// Rota 4: Gerar Relatório Completo com IA (mais avançado)
// POST /api/ia/casos/:caseId/gerar-relatorio-completo
router.post('/casos/:caseId/gerar-relatorio-completo', iaController.gerarRelatorioCompleto);

// Rota 5: Gerar Análise Rápida
// POST /api/ia/casos/:caseId/analise-rapida
router.post('/casos/:caseId/analise-rapida', iaController.gerarAnaliseRapida);

module.exports = router;
