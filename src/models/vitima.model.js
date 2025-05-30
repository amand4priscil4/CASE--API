const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Sub-schema para condições dentárias
const condicaoDentariaSchema = new Schema({
  tipo: {
    type: String,
    enum: [
      'hígido',           // dente saudável
      'cariado',          // cárie
      'restaurado',       // restauração
      'fraturado',        // fratura
      'ausente',          // perdido
      'implante',         // implante
      'protese',          // prótese
      'canal',            // tratamento de canal
      'coroa',            // coroa protética
      'ponte',            // ponte fixa
      'aparelho',         // aparelho ortodôntico
      'outro'
    ],
    required: true
  },
  faces: [{
    type: String,
    enum: ['mesial', 'distal', 'oclusal', 'vestibular', 'lingual', 'incisal', 'cervical']
  }],
  descricao: String,
  dataRegistro: {
    type: Date,
    default: Date.now
  },
  registradoPor: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Sub-schema para cada dente
const denteSchema = new Schema({
  numero: {
    type: String,
    required: true
  },
  presente: {
    type: Boolean,
    default: true
  },
  condicoes: [condicaoDentariaSchema],
  observacoes: String,
  coordenadas: {
    x: Number,
    y: Number
  },
  ultimaAtualizacao: {
    type: Date,
    default: Date.now
  }
});

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
    arcadaSuperior: [denteSchema],
    arcadaInferior: [denteSchema],
    observacoesGerais: String,
    metodologia: String,
    dataExame: {
      type: Date,
      default: Date.now
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

// Método para inicializar odontograma com todos os dentes
vitimaSchema.methods.inicializarOdontograma = function() {
  const dentesSuperior = ['18','17','16','15','14','13','12','11','21','22','23','24','25','26','27','28'];
  const dentesInferior = ['48','47','46','45','44','43','42','41','31','32','33','34','35','36','37','38'];
  
  this.odontograma = {
    arcadaSuperior: dentesSuperior.map(numero => ({
      numero,
      presente: true,
      condicoes: [],
      observacoes: ''
    })),
    arcadaInferior: dentesInferior.map(numero => ({
      numero,
      presente: true,
      condicoes: [],
      observacoes: ''
    })),
    observacoesGerais: '',
    metodologia: '',
    dataExame: new Date()
  };
};

// Método para encontrar um dente específico
vitimaSchema.methods.encontrarDente = function(numeroDente) {
  const dentesSuperior = ['18','17','16','15','14','13','12','11','21','22','23','24','25','26','27','28'];
  const isArcadaSuperior = dentesSuperior.includes(numeroDente);
  const arcada = isArcadaSuperior ? 'arcadaSuperior' : 'arcadaInferior';
  
  return {
    arcada,
    dente: this.odontograma[arcada].find(d => d.numero === numeroDente)
  };
};

module.exports = mongoose.model('Vitima', vitimaSchema);