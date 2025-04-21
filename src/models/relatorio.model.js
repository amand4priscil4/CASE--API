const mongoose = require('mongoose');

const relatorioFinalSchema = new mongoose.Schema({
  caso: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Caso',
    required: true
  },
  criadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  titulo: {
    type: String,
    required: true
  },
  texto: {
    type: String,
    required: true
  },
  criadoEm: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RelatorioFinal', relatorioFinalSchema);
