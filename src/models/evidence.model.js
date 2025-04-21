const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true
  },
  descricao: {
    type: String,
    required: true
  },
  localColeta: {
    type: String,
    required: true
  },
  dataColeta: {
    type: Date,
    required: true
  },
  criadoEm: {
    type: Date,
    default: Date.now
  },
  tipoArquivo: {
    type: String,
    enum: ['imagem', 'documento'],
    required: true
  },
  arquivo: {
    type: String, // Caminho ou URL do arquivo
    required: true
  },
  caso: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true
  },
  criadoPor: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    perfil: {
      type: String,
      enum: ['Admin', 'Perito', 'Assistente'],
      required: true
    }
  }
});

module.exports = mongoose.model('Evidence', evidenceSchema);
