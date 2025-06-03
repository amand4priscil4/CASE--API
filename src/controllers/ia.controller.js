const RelatorioFinal = require('../models/relatorio.model');
const PDFDocument = require('pdfkit');
const Case = require('../models/case.model');
const User = require('../models/user.model');
const Historico = require('../models/historico.model');
const Laudo = require('../models/laudo.model');
const Evidencia = require('../models/evidencia.model');
const axios = require('axios');

// Configuração da API Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;

// Função auxiliar para gerar relatório final com IA
const gerarRelatorioComIA = async (caso, laudos, evidencias) => {
  try {
    let promptText = `Por favor, gere um relatório final completo e executivo para o seguinte caso criminal/pericial:\n\n`;
    
    // Informações do caso
    promptText += `INFORMAÇÕES DO CASO:\n`;
    promptText += `ID: ${caso._id}\n`;
    promptText += `Título: ${caso.titulo}\n`;
    promptText += `Descrição: ${caso.descricao || 'Não informado'}\n`;
    promptText += `Status Atual: ${caso.status}\n`;
    promptText += `Data de Abertura: ${new Date(caso.createdAt).toLocaleString('pt-BR')}\n`;
    promptText += `Responsável: ${caso.peritoResponsavel?.name || 'Não informado'}\n\n`;

    // Evidências
    if (evidencias && evidencias.length > 0) {
      promptText += `EVIDÊNCIAS COLETADAS (${evidencias.length} total):\n`;
      evidencias.forEach((ev, index) => {
        promptText += `${index + 1}. ${ev.titulo}\n`;
        promptText += `   Tipo: ${ev.tipo || 'Não especificado'}\n`;
        promptText += `   Descrição: ${ev.descricao}\n`;
        promptText += `   Status: ${ev.status}\n`;
        promptText += `   Data: ${new Date(ev.createdAt).toLocaleString('pt-BR')}\n\n`;
      });
    }

    // Laudos existentes
    if (laudos && laudos.length > 0) {
      promptText += `LAUDOS PERICIAIS EXISTENTES (${laudos.length} total):\n`;
      laudos.forEach((laudo, index) => {
        promptText += `${index + 1}. Autor: ${laudo.autor?.name || 'Não informado'}\n`;
        promptText += `   Data: ${new Date(laudo.criadoEm).toLocaleString('pt-BR')}\n`;
        promptText += `   Resumo do Conteúdo: ${laudo.texto.substring(0, 200)}...\n\n`;
      });
    }

    promptText += `INSTRUÇÕES PARA O RELATÓRIO FINAL:\n`;
    promptText += `- Faça um resumo executivo do caso inteiro\n`;
    promptText += `- Consolide todas as evidências e laudos em uma análise única\n`;
    promptText += `- Apresente conclusões definitivas baseadas em todos os dados\n`;
    promptText += `- Identifique pontos-chave e achados principais\n`;
    promptText += `- Sugira recomendações finais ou encaminhamentos\n`;
    promptText += `- Use linguagem formal adequada para um relatório oficial\n`;
    promptText += `- Estruture em: Resumo Executivo, Análise Consolidada, Conclusões Finais, Recomendações\n\n`;
    promptText += `Este é um relatório de fechamento do caso, então seja definitivo nas conclusões.`;

    console.log("Enviando prompt para IA (relatório):", promptText.substring(0, 200) + "...");

    const geminiResponse = await axios.post(
      GEMINI_API_URL,
      {
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: 0.3,
          topK: 1,
          topP: 1,
          maxOutputTokens: 6144, // Mais tokens para relatórios completos
        },
      }
    );

    if (geminiResponse.data.candidates && 
        geminiResponse.data.candidates.length > 0 &&
        geminiResponse.data.candidates[0].content &&
        geminiResponse.data.candidates[0].content.parts &&
        geminiResponse.data.candidates[0].content.parts.length > 0) {
      
      return geminiResponse.data.candidates[0].content.parts[0].text;
    } else {
      console.error("Resposta da API Gemini em formato inesperado:", geminiResponse.data);
      throw new Error('Resposta da API Gemini não contém o conteúdo esperado.');
    }

  } catch (error) {
    console.error("Erro ao gerar relatório com IA:", error.message);
    throw new Error(`Falha na geração automática do relatório: ${error.message}`);
  }
};

// Criar relatório final (versão original mantida)
exports.criarRelatorioFinal = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { titulo, texto } = req.body;
    const userId = req.user.id;
    const caso = await Case.findById(caseId).populate('peritoResponsavel');

    if (!caso) return res.status(404).json({ error: 'Caso não encontrado' });

    // Geração do cabeçalho automático
    const cabecalho = `
Relatório Final

Caso: ${caso.titulo}
Número do Caso: ${caso._id}
Responsável: ${caso.peritoResponsavel?.name || 'Não informado'}
Data de Abertura: ${caso.createdAt?.toLocaleDateString('pt-BR') || 'N/A'}
Status: ${caso.status}

-----------------------------
`;

    const relatorio = await RelatorioFinal.create({
      caso: caseId,
      criadoPor: userId,
      titulo,
      texto: cabecalho + '\n' + texto
    });

    // Atualiza status do caso para "Finalizado"
    caso.status = 'finalizado';
    await caso.save();

    // Salva histórico
    await Historico.create({
      acao: 'Relatório final criado',
      usuario: userId,
      caso: caseId,
      detalhes: `O usuário criou o relatório final com o título "${titulo}".`
    });

    res.status(201).json({
      message: 'Relatório final criado com sucesso e caso fechado.',
      relatorio
    });
  } catch (err) {
    console.error('[ERRO] Criar relatório final:', err);
    res.status(500).json({ error: 'Erro ao criar relatório final.' });
  }
};

// NOVO: Gerar relatório final automaticamente com IA
exports.generateRelatorioWithIA = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { titulo } = req.body;
    const userId = req.user.id;

    if (!titulo) {
      return res.status(400).json({ error: 'Título do relatório é obrigatório.' });
    }

    // Busca dados completos do caso
    const caso = await Case.findById(caseId).populate('peritoResponsavel');
    if (!caso) return res.status(404).json({ error: 'Caso não encontrado' });

    // Busca todos os laudos do caso
    const laudos = await Laudo.find({ caso: caseId })
      .populate('autor', 'name')
      .sort({ criadoEm: -1 });

    // Busca todas as evidências do caso
    const evidencias = await Evidencia.find({ caso: caseId })
      .sort({ createdAt: -1 });

    // Verifica se há dados suficientes para gerar o relatório
    if (laudos.length === 0 && evidencias.length === 0) {
      return res.status(400).json({ 
        error: 'Não há laudos nem evidências suficientes para gerar um relatório automaticamente.' 
      });
    }

    // Gera o relatório com IA
    const textoGerado = await gerarRelatorioComIA(caso, laudos, evidencias);

    // Geração do cabeçalho automático
    const cabecalho = `
Relatório Final - Gerado Automaticamente com IA

Caso: ${caso.titulo}
Número do Caso: ${caso._id}
Responsável: ${caso.peritoResponsavel?.name || 'Não informado'}
Data de Abertura: ${caso.createdAt?.toLocaleDateString('pt-BR') || 'N/A'}
Data de Geração: ${new Date().toLocaleDateString('pt-BR')}
Status: ${caso.status}
Laudos Analisados: ${laudos.length}
Evidências Analisadas: ${evidencias.length}

-----------------------------
`;

    // Cria o relatório no banco
    const relatorio = await RelatorioFinal.create({
      caso: caseId,
      criadoPor: userId,
      titulo,
      texto: cabecalho + '\n' + textoGerado,
      geradoComIA: true // Campo opcional para marcar relatórios gerados por IA
    });

    // Atualiza status do caso para "Finalizado"
    caso.status = 'finalizado';
    await caso.save();

    // Registra no histórico
    await Historico.create({
      acao: 'Relatório final gerado com IA',
      usuario: userId,
      caso: caseId,
      detalhes: `Relatório final "${titulo}" gerado automaticamente com IA baseado em ${laudos.length} laudo(s) e ${evidencias.length} evidência(s).`
    });

    res.status(201).json({
      message: 'Relatório final gerado com sucesso usando IA e caso fechado.',
      relatorio,
      laudosAnalisados: laudos.length,
      evidenciasAnalisadas: evidencias.length
    });

  } catch (error) {
    console.error('[ERRO] Geração de relatório com IA:', error);
    
    if (error.message.includes('API Gemini')) {
      return res.status(503).json({ 
        error: 'Serviço de IA temporariamente indisponível.',
        details: error.message 
      });
    }
    
    res.status(500).json({ 
      error: 'Erro ao gerar relatório com IA.',
      details: error.message 
    });
  }
};

// NOVO: Gerar resumo executivo de um caso (sem fechar o caso)
exports.generateResumoExecutivo = async (req, res) => {
  try {
    const { caseId } = req.params;

    // Busca dados do caso
    const caso = await Case.findById(caseId).populate('peritoResponsavel');
    if (!caso) return res.status(404).json({ error: 'Caso não encontrado' });

    // Busca laudos e evidências
    const laudos = await Laudo.find({ caso: caseId }).populate('autor', 'name');
    const evidencias = await Evidencia.find({ caso: caseId });

    if (laudos.length === 0 && evidencias.length === 0) {
      return res.status(400).json({ 
        error: 'Não há dados suficientes para gerar um resumo.' 
      });
    }

    // Prompt específico para resumo executivo
    let promptText = `Gere um resumo executivo conciso (máximo 500 palavras) do seguinte caso:\n\n`;
    promptText += `Caso: ${caso.titulo}\n`;
    promptText += `Status: ${caso.status}\n`;
    promptText += `Evidências: ${evidencias.length}\n`;
    promptText += `Laudos: ${laudos.length}\n\n`;
    promptText += `Foque nos pontos principais, achados importantes e status atual da investigação.`;

    const geminiResponse = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
    });

    const resumo = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || 
                   'Erro ao gerar resumo';

    // Registra no histórico
    await Historico.create({
      acao: 'Resumo executivo gerado',
      usuario: req.user.id,
      caso: caseId,
      detalhes: `Resumo executivo gerado com IA.`
    });

    res.status(200).json({
      message: 'Resumo executivo gerado com sucesso.',
      resumo,
      caso: {
        id: caso._id,
        titulo: caso.titulo,
        status: caso.status,
        evidencias: evidencias.length,
        laudos: laudos.length
      }
    });

  } catch (error) {
    console.error('[ERRO] Geração de resumo executivo:', error);
    res.status(500).json({ error: 'Erro ao gerar resumo executivo.' });
  }
};

// Buscar relatório por caso (mantido original)
exports.getRelatorioPorCaso = async (req, res) => {
  try {
    const { caseId } = req.params;

    const relatorio = await RelatorioFinal.findOne({ caso: caseId })
      .populate('criadoPor', 'name');

    if (!relatorio) {
      return res.status(404).json({ error: 'Relatório não encontrado para este caso.' });
    }

    res.status(200).json(relatorio);
  } catch (err) {
    console.error('[ERRO] Buscar relatório:', err);
    res.status(500).json({ error: 'Erro ao buscar relatório.' });
  }
};

// Exportar relatório PDF (mantido original)
exports.exportarRelatorioPDF = async (req, res) => {
  try {
    const { caseId } = req.params;

    const relatorio = await RelatorioFinal.findOne({ caso: caseId })
      .populate('criadoPor', 'name')
      .populate('caso');

    if (!relatorio) {
      return res.status(404).json({ error: 'Relatório não encontrado para este caso.' });
    }

    const caso = await Case.findById(caseId).populate('peritoResponsavel', 'name');

    // Cria o PDF
    const doc = new PDFDocument();

    // Cabeçalhos da resposta HTTP
    res.setHeader('Content-Disposition', `attachment; filename="relatorio_caso_${caso._id}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');

    // Pipe o PDF direto pra resposta
    doc.pipe(res);

    // Conteúdo do PDF
    doc.fontSize(18).text('Relatório Final', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Título do Relatório: ${relatorio.titulo}`);
    doc.text(`Caso: ${caso.titulo}`);
    doc.text(`Número do Caso: ${caso._id}`);
    doc.text(`Responsável: ${caso.peritoResponsavel?.name || 'Não informado'}`);
    doc.text(`Status: ${caso.status}`);
    doc.text(`Criado em: ${new Date(relatorio.criadoEm).toLocaleDateString('pt-BR')}`);
    
    // Indica se foi gerado com IA
    if (relatorio.geradoComIA) {
      doc.text('Gerado com: Inteligência Artificial');
    }
    
    doc.moveDown();

    doc.text('Conteúdo:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(relatorio.texto, {
      align: 'left'
    });

    doc.end();
  } catch (err) {
    console.error('[ERRO] Exportar relatório PDF:', err);
    res.status(500).json({ error: 'Erro ao exportar relatório em PDF.' });
  }
};