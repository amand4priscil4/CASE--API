const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../services/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'evidencias',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'txt'], 
    resource_type: 'auto', // detecta automaticamente imagem ou documento
    // Configurações de timeout e tamanho para Cloudinary
    chunk_size: 6000000, // 6MB chunks
    timeout: 60000 // 60 segundos
  }
});

// Filtro de tipo de arquivo mais abrangente
const fileFilter = (req, file, cb) => {
  const tiposAceitos = [
    'image/jpeg', 
    'image/jpg',
    'image/png', 
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'text/plain' // .txt
  ];
  
  if (tiposAceitos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não suportado: ${file.mimetype}. Tipos aceitos: JPG, PNG, PDF, DOC, DOCX, TXT`), false);
  }
};

// Configuração do multer com limites
const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
    files: 1 // apenas 1 arquivo por vez
  }
});

// Middleware personalizado para tratar erros de upload
const uploadWithErrorHandler = (fieldName) => {
  return (req, res, next) => {
    const uploadSingle = upload.single(fieldName);
    
    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            message: 'Arquivo muito grande. Tamanho máximo: 10MB' 
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ 
            message: 'Campo de arquivo inválido' 
          });
        }
        return res.status(400).json({ 
          message: `Erro no upload: ${err.message}` 
        });
      } else if (err) {
        return res.status(400).json({ 
          message: err.message 
        });
      }
      next();
    });
  };
};

module.exports = upload;
module.exports.uploadWithErrorHandler = uploadWithErrorHandler;