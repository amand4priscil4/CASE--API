const Historico = require('../models/historico.model');

exports.listarHistoricoPorCaso = async (req, res) => {
  try {
    const { caseId } = req.params;
    const historico = await Historico.find({ caso: caseId })
      .populate('usuario', 'nome')
      .sort({ data: -1 });
    res.json(historico);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar histórico do caso.' });
  }
};

exports.listarHistoricoGeral = async (req, res) => {
  try {
    const historico = await Historico.find()
      .populate('usuario', 'nome')
      .populate('caso', 'titulo')
      .sort({ data: -1 });
    res.json(historico);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar histórico geral.' });
  }
};
