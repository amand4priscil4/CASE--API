const axios = require('axios');

class MLService {
  constructor() {
    this.mlApiUrl = process.env.ML_API_URL || 'http://127.0.0.1:8002';
  }

  async analyzeDistribution(cases, field = 'tipo') {
    try {
      const response = await axios.post(`${this.mlApiUrl}/analysis/distribution`, {
        cases: cases,
        analysis_type: 'distribution',
        filters: { field }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao chamar ML API (distribution):', error.message);
      throw new Error('Falha na análise de distribuição');
    }
  }

  async analyzeTemporal(cases) {
    try {
      const response = await axios.post(`${this.mlApiUrl}/analysis/temporal`, {
        cases: cases,
        analysis_type: 'temporal'
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao chamar ML API (temporal):', error.message);
      throw new Error('Falha na análise temporal');
    }
  }

  async getSummary(cases) {
    try {
      console.log('=== DEBUG ML API ===');
      console.log('URL:', `${this.mlApiUrl}/analysis/summary`);
      console.log('Cases enviados:', cases.length);
      console.log('Primeiro caso:', cases[0]);
      
      const response = await axios.post(`${this.mlApiUrl}/analysis/summary`, {
        cases: cases,
        analysis_type: 'summary'
      });
      
      console.log('Resposta ML API:', response.data);
      return response.data;
    } catch (error) {
      console.error('=== ERRO DETALHADO ===');
      console.error('Error code:', error.code);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Message:', error.message);
      console.error('Full error:', error);
      throw new Error('Falha no resumo estatístico');
    }
  }
}

module.exports = new MLService();