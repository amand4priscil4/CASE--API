const express = require('express');
const router = express.Router();
const laudoOdontologicoController = require('../controllers/laudoOdontologico.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleCheck = require('../middlewares/roleCheck.middleware');
const upload = require('../middlewares/upload.middleware');

// Criar laudo odontológico para uma vítima
router.post(
  '/vitima/:vitimaId',
  authMiddleware,
  roleCheck(['admin', 'perito']),
  laudoOdontologicoController.criarLaudoOdontologico
);

// Listar laudos odontológicos de uma vítima
router.get(
  '/vitima/:vitimaId',
  authMiddleware,
  laudoOdontologicoController.listarLaudosOdontologicos
);

// Obter um laudo odontológico específico
router.get(
  '/:laudoId',
  authMiddleware,
  laudoOdontologicoController.obterLaudoOdontologico
);

// Atualizar um laudo odontológico
router.put(
  '/:laudoId',
  authMiddleware,
  roleCheck(['admin', 'perito']),
  laudoOdontologicoController.atualizarLaudoOdontologico
);

// Exportar laudo em formato texto ⬅️ NOVA ROTA
router.get(
  '/:laudoId/texto',
  authMiddleware,
  laudoOdontologicoController.exportarLaudoTexto
);

// Salvar o arquivo PDF do laudo
router.post(
  '/:laudoId/pdf',
  authMiddleware,
  roleCheck(['admin', 'perito']),
  upload.single('arquivoPDF'),
  laudoOdontologicoController.salvarPDFLaudo
);

// Baixar o PDF do laudo
router.get(
  '/:laudoId/pdf',
  authMiddleware,
  laudoOdontologicoController.baixarPDFLaudo
);

module.exports = router;