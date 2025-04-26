const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true
  },
  tipo: {
  type: String,
  enum: [
    'acidente',
    'identificação de vítima',
    'exame criminal',
    'exumação',
    'violência doméstica',
    'avaliação de idade',
    'avaliação de lesões',
    'avaliação de danos corporais'
  ],
  required: true
},
  descricao: {
    type: String,
    required: true
  },
  data: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['em andamento', 'finalizado', 'arquivado'],
    default: 'em andamento'
  },
  peritoResponsavel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  localDoCaso: {
    type: String,
    required: true
  },
  criadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Case', caseSchema);

