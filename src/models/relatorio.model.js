const mongoose = require('mongoose');

const relatorioFinalSchema = new mongoose.Schema({
  caso: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case', // ✅ CORRIGIDO: era 'Caso'
    required: true
  },
  criadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // ✅ CORRIGIDO: era 'Usuario'
    required: true
  },
  titulo: {
    type: String,
    required: true,
    trim: true // ✅ MELHORADO: remove espaços extras
  },
  texto: {
    type: String,
    required: true,
    trim: true // ✅ MELHORADO: remove espaços extras
  },
  criadoEm: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true // ✅ MELHORADO: adiciona createdAt e updatedAt automaticamente
});

// ✅ MELHORADO: Índices para melhor performance
relatorioFinalSchema.index({ caso: 1 });
relatorioFinalSchema.index({ criadoPor: 1 });
relatorioFinalSchema.index({ criadoEm: -1 });

module.exports = mongoose.model('RelatorioFinal', relatorioFinalSchema);