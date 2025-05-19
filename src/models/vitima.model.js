const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vitimaSchema = new Schema({
  nic: {
    type: String,
    required: true
  },
  nome: {
    type: String,
    required: true
  },
  genero: {
    type: String,
    enum: ['masculino', 'feminino', 'outro'],
    required: true
  },
  idade: {
    type: Number,
    required: true
  },
  documento: {
    tipo: {
      type: String,
      enum: ['rg', 'cpf', 'passaporte', 'outro'],
      required: true
    },
    numero: {
      type: String,
      required: true
    }
  },
  endereco: {
    logradouro: String,
    numero: String,
    complemento: String,
    bairro: String,
    cidade: String,
    estado: String,
    cep: String
  },
  corEtnia: {
    type: String,
    enum: ['branca', 'preta', 'parda', 'amarela', 'indígena']
  },
  odontograma: {
    type: Object,
    default: {
      arcadaSuperior: [],
      arcadaInferior: []
    }
  },
  regioesAnatomicas: [{
    regiao: {
      codigo: String,
      nome: String
    },
    tipo: String,
    descricao: String,
    dataRegistro: {
      type: Date,
      default: Date.now
    }
  }],
  caso: {
    type: Schema.Types.ObjectId,
    ref: 'Case',
    required: true
  },
  criadoPor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Vitima', vitimaSchema);