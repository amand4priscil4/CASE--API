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
  upload.single('arquivo'), // 🆕 esse campo tem que bater com o nome usado no `FormData` do frontend
  evidenceController.createEvidence
);

// Listar evidências por caso
router.get(
  '/',
  authMiddleware,
  roleCheck(['admin', 'perito, assistente']),
  evidenceController.getEvidencesByCase
);

// EDITAR evidência
router.put(
  '/:id',
  authMiddleware,
  roleCheck(['admin', 'perito', 'assistente']),
  evidenceController.updateEvidence
);

// Rota protegida com JWT e upload via Cloudinary
router.post(
  '/api/evidencias',
  authMiddleware,
  upload.single('arquivo'),
  evidenceController.createEvidence
);

module.exports = router;
