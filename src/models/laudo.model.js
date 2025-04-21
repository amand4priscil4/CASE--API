const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const laudoSchema = new Schema({
  caso: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
  evidencias: [{ type: Schema.Types.ObjectId, ref: 'Evidence' }],
  texto: { type: String, required: true },
  autor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  criadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Laudo', laudoSchema);
