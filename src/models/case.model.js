const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  data: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['aberto', 'em andamento', 'concluído'],
    default: 'aberto'
  },
  peritoResponsavel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  localDoCaso: { type: String, required: true }
});
module.exports = mongoose.model('Case', caseSchema);
