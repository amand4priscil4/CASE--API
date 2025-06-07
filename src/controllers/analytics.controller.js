const Case = require('../models/case.model');
const mlService = require('../services/mlService');

// Análise de distribuição
exports.getDistributionAnalysis = async (req, res) => {
  try {
    const { field = 'tipo' } = req.query;
    
    // Buscar casos do MongoDB
    const cases = await Case.find({}).lean();
    
    if (!cases.length) {
      return res.status(404).json({ message: 'Nenhum caso encontrado' });
    }

    // Chamar API ML
    const analysis = await mlService.analyzeDistribution(cases, field);
    
    res.status(200).json(analysis);
  } catch (error) {
    console.error('Erro na análise de distribuição:', error);
    res.status(500).json({ message: 'Erro ao gerar análise de distribuição' });
  }
};

// Análise temporal
exports.getTemporalAnalysis = async (req, res) => {
  try {
    // Buscar casos do MongoDB
    const cases = await Case.find({}).lean();
    
    if (!cases.length) {
      return res.status(404).json({ message: 'Nenhum caso encontrado' });
    }

    // Chamar API ML
    const analysis = await mlService.analyzeTemporal(cases);
    
    res.status(200).json(analysis);
  } catch (error) {
    console.error('Erro na análise temporal:', error);
    res.status(500).json({ message: 'Erro ao gerar análise temporal' });
  }
};

// Resumo estatístico
exports.getSummaryAnalysis = async (req, res) => {
  try {
    // Buscar casos do MongoDB
    const casesRaw = await Case.find({}).lean();
    
    if (!casesRaw.length) {
      return res.status(404).json({ message: 'Nenhum caso encontrado' });
    }

    // Converter para formato JSON puro (sem ObjectIds)
    const cases = casesRaw.map(caso => ({
      id: caso._id.toString(),
      titulo: caso.titulo,
      tipo: caso.tipo,
      descricao: caso.descricao,
      data: caso.data.toISOString(),
      status: caso.status,
      localDoCaso: caso.localDoCaso,
      peritoResponsavel: caso.peritoResponsavel.toString()
    }));

    // Chamar API ML
    const analysis = await mlService.getSummary(cases);
    
    res.status(200).json(analysis);
  } catch (error) {
    console.error('Erro no resumo estatístico:', error);
    res.status(500).json({ message: 'Erro ao gerar resumo estatístico' });
  }
};