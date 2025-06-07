const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Análise de distribuição (por tipo, status, local, etc.)
router.get('/distribution', authMiddleware, analyticsController.getDistributionAnalysis);

// Análise temporal (por mês/ano)
router.get('/temporal', authMiddleware, analyticsController.getTemporalAnalysis);

// Resumo estatístico geral
router.get('/summary', authMiddleware, analyticsController.getSummaryAnalysis);

module.exports = router;