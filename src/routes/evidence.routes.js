const express = require('express');
const router = express.Router();
const evidenceController = require('../controllers/evidence.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleCheck = require('../middlewares/roleCheck.middleware');
const upload = require('../middlewares/upload.middleware');

// Rota de criação com upload de arquivo
router.post(
  '/',
  authMiddleware,
  upload.single('arquivo'),
  evidenceController.createEvidence
);

// Listar evidências por caso
router.get(
  '/',
  authMiddleware,
  roleCheck(['admin', 'perito', 'assistente']),
  evidenceController.getEvidencesByCase
);

// Buscar evidência por ID 
router.get(
  '/:id', 
  authMiddleware, 
  evidenceController.getEvidenceById
);

// EDITAR evidência
router.put(
  '/:id',
  authMiddleware,
  roleCheck(['admin', 'perito', 'assistente']),
  evidenceController.updateEvidence
);


module.exports = router;
