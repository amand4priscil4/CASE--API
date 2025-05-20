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
  dataEmissao: {
    type: Date,
    default: Date.now
  },
  tipo: {
    type: String,
    default: 'odontologico'
  },
  observacoes: {
    type: String
  },
  parecer: {
    type: String,
    required: true
  },
  // Armazena um snapshot do odontograma no momento da criação do laudo
  odontogramaSnapshot: {
    type: Map,
    of: new Schema({
      caracteristica: String,
      observacao: String,
      dataRegistro: Date
    }),
    default: {}
  },
  // Armazena o caminho do arquivo PDF gerado
  arquivoPDF: {
    type: String
  },
  caso: {
    type: Schema.Types.ObjectId,
    ref: 'Case',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('LaudoOdontologico', laudoOdontologicoSchema);