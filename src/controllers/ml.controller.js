const { spawn } = require('child_process');
const path = require('path');

// Predição de status do caso
exports.predictCaseStatus = async (req, res) => {
  try {
    const { tipo, localDoCaso } = req.body;
    
    if (!tipo || !localDoCaso) {
      return res.status(400).json({ 
        message: 'Tipo e localDoCaso são obrigatórios' 
      });
    }

    // Caminho para o script Python
    const scriptPath = path.join(__dirname, '../../ml/predict.py');
    console.log('Script path:', scriptPath);
    console.log('Parâmetros:', tipo, localDoCaso);
    
    // Executar script Python
    const python = spawn('python', [scriptPath, tipo, localDoCaso]);
    
    let result = '';
    let errorOutput = '';
    
    python.stdout.on('data', (data) => {
      result += data.toString();
      console.log('Python stdout:', data.toString());
    });
    
    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error('Python stderr:', data.toString());
    });
    
    python.on('close', (code) => {
      console.log('Python exit code:', code);
      console.log('Result:', result);
      console.log('Error output:', errorOutput);
      
      if (code === 0 && result.trim()) {
        try {
          const prediction = JSON.parse(result);
          res.status(200).json(prediction);
        } catch (parseError) {
          console.error('Parse error:', parseError);
          res.status(500).json({ 
            message: 'Erro ao processar resultado', 
            error: parseError.message,
            rawResult: result
          });
        }
      } else {
        res.status(500).json({ 
          message: 'Erro na predição',
          exitCode: code,
          errorOutput: errorOutput,
          result: result
        });
      }
    });

  } catch (error) {
    console.error('[ERRO] Predição ML:', error);
    res.status(500).json({ 
      message: 'Erro interno', 
      error: error.message 
    });
  }
};

// Manter o analyzeCases igual...
exports.analyzeCases = async (req, res) => {
  try {
    const Case = require('../models/case.model');
    
    const cases = await Case.find({}, 'tipo localDoCaso status');
    
    const stats = {
      total: cases.length,
      porTipo: {},
      porStatus: {},
      porLocal: {}
    };
    
    cases.forEach(caso => {
      stats.porTipo[caso.tipo] = (stats.porTipo[caso.tipo] || 0) + 1;
      stats.porStatus[caso.status] = (stats.porStatus[caso.status] || 0) + 1;
      stats.porLocal[caso.localDoCaso] = (stats.porLocal[caso.localDoCaso] || 0) + 1;
    });
    
    res.status(200).json(stats);
    
  } catch (error) {
    console.error('[ERRO] Análise de casos:', error);
    res.status(500).json({ 
      message: 'Erro ao analisar casos', 
      error: error.message 
    });
  }
};