const mongoose = require('mongoose');

const marcacaoSchema = new mongoose.Schema({
  vitima: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vitima',
    required: true
  },
  tipo: {
    type: String,
    enum: ['lesao', 'cicatriz', 'tatuagem', 'fratura', 'deformidade', 'caracteristica', 'outro'],
    required: true
  },
  anatomia: {
    categoria: {
      type: String,
      enum: ['corpo_inteiro', 'cabeca_cranio', 'maos', 'pes', 'arcada_dentaria'],
      required: true
    },
    vista: {
      type: String,
      enum: ['anterior', 'posterior', 'lateral_direita', 'lateral_esquerda', 'superior', 'inferior', 'palmar', 'dorsal', 'plantar'],
      required: true
    },
    faixaEtaria: {
      type: String,
      enum: ['adulto', 'infantil'],
      default: 'adulto'
    },
    sexo: {
      type: String,
      enum: ['masculino', 'feminino'],
      required: function() {
        return this.anatomia.categoria === 'corpo_inteiro';
      }
    },
    lateralidade: {
      type: String,
      enum: ['direita', 'esquerda', 'bilateral'],
      required: function() {
        return ['maos', 'pes'].includes(this.anatomia.categoria);
      }
    },
    imagemArquivo: {
      type: String,
      required: true // nome do arquivo da imagem base
    }
  },
  coordenadas: {
    x: {
      type: Number,
      required: true,
      min: 0,
      max: 100 // porcentagem da imagem
    },
    y: {
      type: Number,
      required: true,
      min: 0,
      max: 100 // porcentagem da imagem
    }
  },
  regiao: {
    codigo: {
      type: String,
      required: true
    },
    nome: {
      type: String,
      required: true
    }
  },
  descricao: {
    type: String,
    required: true
  },
  observacoes: {
    type: String
  },
  cor: {
    type: String,
    default: '#FF0000' // cor da marcação
  },
  tamanho: {
    type: Number,
    default: 8, // tamanho da marcação em pixels
    min: 4,
    max: 20
  },
  criadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['ativo', 'removido'],
    default: 'ativo'
  }
}, { 
  timestamps: true 
});

// Índices para performance
marcacaoSchema.index({ vitima: 1 });
marcacaoSchema.index({ 'anatomia.categoria': 1 });
marcacaoSchema.index({ 'anatomia.vista': 1 });
marcacaoSchema.index({ tipo: 1 });
marcacaoSchema.index({ status: 1 });

// Validação customizada
marcacaoSchema.pre('save', function(next) {
  // Validar combinações vista + categoria
  const validCombinations = {
    'corpo_inteiro': ['anterior', 'posterior', 'lateral_direita', 'lateral_esquerda'],
    'cabeca_cranio': ['anterior', 'posterior', 'lateral_direita', 'lateral_esquerda', 'superior'],
    'maos': ['palmar', 'dorsal'],
    'pes': ['plantar', 'anterior'],
    'arcada_dentaria': ['superior', 'inferior']
  };

  const validVistas = validCombinations[this.anatomia.categoria];
  if (!validVistas.includes(this.anatomia.vista)) {
    return next(new Error(`Vista '${this.anatomia.vista}' não é válida para categoria '${this.anatomia.categoria}'`));
  }

  next();
});

module.exports = mongoose.model('Marcacao', marcacaoSchema);