const express = require('express');
const router = express.Router();
const mlController = require('../controllers/ml.controller');

// Predizer status de um caso (sem autenticação por enquanto)
router.post('/predict', mlController.predictCaseStatus);

// Análise geral dos casos
router.get('/analyze', mlController.analyzeCases);

module.exports = router;