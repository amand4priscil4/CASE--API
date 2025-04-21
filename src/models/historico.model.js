const mongoose = require('mongoose');

const historicoSchema = new mongoose.Schema({
  acao: { type: String, required: true }, // Ex: "Relatório final criado"
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  caso: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  data: { type: Date, default: Date.now },
  detalhes: { type: String } // mais informações sobre a ação
});

module.exports = mongoose.model('Historico', historicoSchema);
