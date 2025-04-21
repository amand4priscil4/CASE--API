const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const {
  criarRelatorioFinal,
  getRelatorioPorCaso,
  exportarRelatorioPDF
} = require('../controllers/relatorio.controller');

// Criar relatório final para um caso
router.post('/:caseId', authMiddleware, criarRelatorioFinal);

// Buscar relatório final de um caso
router.get('/:caseId', authMiddleware, getRelatorioPorCaso);

// Exportar pdf
router.get('/:caseId/pdf', authMiddleware, exportarRelatorioPDF);

module.exports = router;
