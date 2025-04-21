const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../services/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'evidencias',
    allowed_formats: ['jpg', 'png', 'pdf', 'doc', 'docx'],
    resource_type: 'auto' // detecta automaticamente imagem ou documento
  }
});

// filtro de tipo de arquivo
const fileFilter = (req, file, cb) => {
  const tiposAceitos = ['image/jpeg', 'image/png', 'application/pdf', 'image/jpg'];
  if (tiposAceitos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado.'), false);
  }
};

// Cria o middleware configurado
const upload = multer({ storage, fileFilter });

module.exports = upload;
