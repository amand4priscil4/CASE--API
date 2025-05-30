const mongoose = require('mongoose');

// Definindo um esquema GeoJSON para armazenar coordenadas
const localizacaoSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordenadas: {
    type: [Number], // [longitude, latitude]
    required: true,
    validate: {
      validator: function(coordenadas) {
        return coordenadas.length === 2 && 
               coordenadas[0] >= -180 && coordenadas[0] <= 180 && // longitude
               coordenadas[1] >= -90 && coordenadas[1] <= 90;     // latitude
      },
      message: 'Coordenadas devem estar no formato [longitude, latitude] válido'
    }
  },
  endereco: {
    type: String,
    required: false
  },
  complemento: {
    type: String,
    required: false
  },
  referencia: {
    type: String,
    required: false
  }
});

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
  // ✅ NOVO: Campo de localização com coordenadas
  localizacao: {
    type: localizacaoSchema,
    required: false // Opcional para casos antigos
  },
  criadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Índice geoespacial para consultas de proximidade
caseSchema.index({ "localizacao.coordenadas": "2dsphere" });

module.exports = mongoose.model('Case', caseSchema);