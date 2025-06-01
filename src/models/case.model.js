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
      validator: function(v) {
        return v.length === 2 && 
               v[0] >= -180 && v[0] <= 180 && // longitude
               v[1] >= -90 && v[1] <= 90;     // latitude
      },
      message: 'Coordenadas devem estar no formato [longitude, latitude] com valores válidos'
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
    required: true,
    trim: true
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
    required: true,
    trim: true
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
    ref: 'User', // ✅ Consistente com user.model.js
    required: true
  },
  localDoCaso: {
    type: String,
    required: true,
    trim: true
  },
  // ✅ Adicionando localização geográfica (usado no controller atualizado)
  localizacaoGeo: {
    type: localizacaoSchema,
    required: false
  },
  // ✅ NOVO: Campo de localização com coordenadas
  localizacao: {
    type: localizacaoSchema,
    required: false // Opcional para casos antigos
  },
  criadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // ✅ Consistente com user.model.js
    required: true
  },
  // ✅ Campos adicionais para melhor rastreabilidade
  ultimaAtualizacao: {
    type: Date,
    default: Date.now
  },
  atualizadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, { 
  timestamps: true, // ✅ Cria createdAt e updatedAt automaticamente
  // ✅ Índices para melhor performance
  indexes: [
    { status: 1 },
    { peritoResponsavel: 1 },
    { criadoPor: 1 },
    { createdAt: -1 },
    { 'localizacaoGeo.coordenadas': '2dsphere' } // Índice geoespacial
  ]
});

// ✅ Middleware para atualizar ultimaAtualizacao
caseSchema.pre('findOneAndUpdate', function() {
  this.set({ ultimaAtualizacao: new Date() });
});

caseSchema.pre('updateOne', function() {
  this.set({ ultimaAtualizacao: new Date() });
});

// ✅ Métodos virtuais para facilitar o uso
caseSchema.virtual('temLocalizacao').get(function() {
  return this.localizacaoGeo && this.localizacaoGeo.coordenadas && this.localizacaoGeo.coordenadas.length === 2;
});

// ✅ Método para buscar casos próximos (usado no controller)
caseSchema.statics.findNearby = function(longitude, latitude, maxDistanceKm = 10) {
  const maxDistanceMeters = maxDistanceKm * 1000;
  
  return this.find({
    'localizacaoGeo.coordenadas': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistanceMeters
      }
    }
  });
};

// ✅ Método para validar se o usuário pode editar o caso
caseSchema.methods.canBeEditedBy = function(user) {
  if (!user) return false;
  
  // Casos finalizados não podem ser editados
  if (this.status === 'finalizado') return false;
  
  // Admin pode editar qualquer caso não finalizado
  if (user.role === 'admin') return true;
  
  // Perito pode editar casos que criou
  if (user.role === 'perito' && this.criadoPor.toString() === user.id) return true;
  
  return false;
};

// ✅ Método para validar se o usuário pode visualizar o caso
caseSchema.methods.canBeViewedBy = function(user) {
  if (!user) return false;
  
  // Admin pode ver qualquer caso
  if (user.role === 'admin') return true;
  
  // Perito responsável pode ver o caso
  if (this.peritoResponsavel.toString() === user.id) return true;
  
  // Criador pode ver o caso
  if (this.criadoPor.toString() === user.id) return true;
  
  // Assistentes podem ver casos onde estão envolvidos
  if (user.role === 'assistente') {
    // Aqui você pode adicionar lógica adicional se necessário
    return true;
  }
  
  return false;
};

module.exports = mongoose.model('Case', caseSchema);