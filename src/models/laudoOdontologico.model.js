const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const laudoOdontologicoSchema = new Schema({
  vitima: {
    type: Schema.Types.ObjectId,
    ref: 'Vitima',
    required: true
  },
  perito: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  caso: {
    type: Schema.Types.ObjectId,
    ref: 'Case',
    required: true
  },
  dataEmissao: {
    type: Date,
    default: Date.now
  },
  observacoes: {
    type: String,
    default: ''
  },
  parecer: {
    type: String,
    required: true
  },
  // Texto formatado completo do laudo
  textoCompleto: {
    type: String,
    required: true
  },
  // Dados estruturados por quadrantes
  quadrantesEstruturados: {
    type: Object,
    default: {}
  },
  // Tipo de odontograma usado
  tipoOdontograma: {
    type: String,
    enum: ['adulto', 'infantil'],
    default: 'adulto'
  },
  // Snapshot do odontograma no momento da criação
  odontogramaSnapshot: {
    type: Object,
    required: true
  },
  // Arquivo PDF gerado
  arquivoPDF: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('LaudoOdontologico', laudoOdontologicoSchema);