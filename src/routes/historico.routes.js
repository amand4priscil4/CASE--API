const express = require('express');
const router = express.Router();
const {
  listarHistoricoPorCaso,
  listarHistoricoGeral
} = require('../controllers/historico.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/caso/:caseId', auth, listarHistoricoPorCaso);
router.get('/todos', auth, listarHistoricoGeral);

module.exports = router;
