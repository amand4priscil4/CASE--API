// controllers/ia.controller.js
const axios = require("axios");
const Case = require("../models/case.model");
const Evidencia = require("../models/evidence.model");
const Vitima = require("../models/vitima.model");
const Laudo = require("../models/laudo.model");
const Historico = require("../models/historico.model");

// Configuração da API Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDK9SX03f1cnzWFPy0em8b3xTsFOoWLPNU";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;

// Função auxiliar para fazer chamada à API Gemini
const chamarGeminiAPI = async (promptText, maxTokens = 2048) => {
  try {
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        temperature: 0.3,
        topK: 1,
        topP: 1,
        maxOutputTokens: maxTokens,
      },
    });

    if (
      response.data.candidates &&
      response.data.candidates.length > 0 &&
      response.data.candidates[0].content &&
      response.data.candidates[0].content.parts &&
      response.data.candidates[0].content.parts.length > 0
    ) {
      return response.data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Resposta da API Gemini em formato inesperado");
    }
  } catch (error) {
    console.error("Erro na API Gemini:", error.message);
    throw new Error(`Falha na geração com IA: ${error.message}`);
  }
};

// 1. Gerar Laudo de Evidência com IA
exports.gerarLaudoEvidencia = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { evidenciaSelecionada } = req.body;
    const userId = req.user.id;

    // Buscar caso
    const caso = await Case.findById(caseId).populate("peritoResponsavel");
    if (!caso) return res.status(404).json({ error: "Caso não encontrado" });

    // Buscar evidência específica
    const evidencia = await Evidencia.findById(evidenciaSelecionada);
    if (!evidencia) return res.status(404).json({ error: "Evidência não encontrada" });

    // Montar prompt específico para laudo de evidência
    let promptText = `Gere um laudo pericial técnico para a seguinte evidência:\n\n`;
    
    promptText += `DADOS DO CASO:\n`;
    promptText += `Caso: ${caso.titulo}\n`;
    promptText += `Número: ${caso._id}\n`;
    promptText += `Descrição: ${caso.descricao || "Não informado"}\n\n`;
    
    promptText += `EVIDÊNCIA ANALISADA:\n`;
    promptText += `Título: ${evidencia.titulo}\n`;
    promptText += `Tipo: ${evidencia.tipo}\n`;
    promptText += `Descrição: ${evidencia.descricao}\n`;
    promptText += `Status: ${evidencia.status}\n`;
    promptText += `Local de Coleta: ${evidencia.localColeta || "Não informado"}\n`;
    promptText += `Data de Coleta: ${new Date(evidencia.createdAt).toLocaleString("pt-BR")}\n\n`;
    
    promptText += `INSTRUÇÕES PARA O LAUDO:\n`;
    promptText += `- Estruture em: Objetivo, Metodologia, Resultados, Conclusões\n`;
    promptText += `- Use linguagem técnica pericial adequada\n`;
    promptText += `- Seja específico sobre os achados técnicos\n`;
    promptText += `- Inclua recomendações se necessário\n`;
    promptText += `- Mantenha objetividade científica\n`;
    promptText += `- Formato: texto corrido, aproximadamente 800 palavras`;

    const textoGerado = await chamarGeminiAPI(promptText, 3072);

    // Registrar no histórico
    await Historico.create({
      acao: "Laudo de evidência gerado com IA",
      usuario: userId,
      caso: caseId,
      detalhes: `Laudo gerado para evidência "${evidencia.titulo}"`,
    });

    res.status(200).json({
      message: "Laudo de evidência gerado com sucesso",
      textoGerado,
      evidencia: {
        id: evidencia._id,
        titulo: evidencia.titulo,
        tipo: evidencia.tipo
      }
    });

  } catch (error) {
    console.error("[ERRO] Gerar laudo evidência IA:", error);
    res.status(500).json({ 
      error: "Erro ao gerar laudo de evidência",
      details: error.message 
    });
  }
};

// 2. Gerar Laudo Odontológico com IA
exports.gerarLaudoOdontologico = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { vitimaSelecionada, tipoConteudo } = req.body; // tipoConteudo: 'observacoes' ou 'parecer'
    const userId = req.user.id;

    // Buscar caso e vítima
    const caso = await Case.findById(caseId).populate("peritoResponsavel");
    if (!caso) return res.status(404).json({ error: "Caso não encontrado" });

    const vitima = await Vitima.findById(vitimaSelecionada);
    if (!vitima) return res.status(404).json({ error: "Vítima não encontrada" });

    // Prompt específico baseado no tipo de conteúdo
    let promptText = ``;

    if (tipoConteudo === 'observacoes') {
      promptText = `Gere observações odontológicas técnicas para o seguinte caso:\n\n`;
      promptText += `DADOS DA VÍTIMA:\n`;
      promptText += `Nome: ${vitima.nome}\n`;
      promptText += `NIC: ${vitima.nic}\n`;
      promptText += `Idade: ${vitima.idade || "Não informado"}\n`;
      promptText += `Sexo: ${vitima.sexo || "Não informado"}\n\n`;
      
      promptText += `CASO: ${caso.titulo}\n\n`;
      
      promptText += `INSTRUÇÕES:\n`;
      promptText += `- Descreva observações clínicas odontológicas\n`;
      promptText += `- Inclua aspectos anatômicos relevantes\n`;
      promptText += `- Mencione condições dentárias e periodontais\n`;
      promptText += `- Use terminologia odontológica apropriada\n`;
      promptText += `- Máximo 400 palavras, texto técnico objetivo`;
      
    } else if (tipoConteudo === 'parecer') {
      promptText = `Gere um parecer técnico odontológico conclusivo para:\n\n`;
      promptText += `VÍTIMA: ${vitima.nome} (NIC: ${vitima.nic})\n`;
      promptText += `CASO: ${caso.titulo}\n\n`;
      
      promptText += `INSTRUÇÕES PARA PARECER:\n`;
      promptText += `- Apresente conclusões técnicas definitivas\n`;
      promptText += `- Correlacione achados com o caso\n`;
      promptText += `- Inclua implicações periciais\n`;
      promptText += `- Use linguagem formal e conclusiva\n`;
      promptText += `- Máximo 300 palavras, foco nas conclusões`;
    }

    const textoGerado = await chamarGeminiAPI(promptText, 2048);

    // Registrar no histórico
    await Historico.create({
      acao: `${tipoConteudo === 'observacoes' ? 'Observações' : 'Parecer'} odontológico gerado com IA`,
      usuario: userId,
      caso: caseId,
      detalhes: `Gerado para vítima ${vitima.nome} (${vitima.nic})`,
    });

    res.status(200).json({
      message: `${tipoConteudo === 'observacoes' ? 'Observações' : 'Parecer'} gerado com sucesso`,
      textoGerado,
      tipoConteudo,
      vitima: {
        id: vitima._id,
        nome: vitima.nome,
        nic: vitima.nic
      }
    });

  } catch (error) {
    console.error("[ERRO] Gerar laudo odontológico IA:", error);
    res.status(500).json({ 
      error: "Erro ao gerar laudo odontológico",
      details: error.message 
    });
  }
};

// 3. Gerar Relatório Final com IA
exports.gerarRelatorioFinal = async (req, res) => {
  try {
    const { caseId } = req.params;
    const userId = req.user.id;

    // Buscar dados completos do caso
    const caso = await Case.findById(caseId).populate("peritoResponsavel");
    if (!caso) return res.status(404).json({ error: "Caso não encontrado" });

    // Buscar evidências e laudos
    const evidencias = await Evidencia.find({ caso: caseId }).sort({ createdAt: -1 });
    const laudos = await Laudo.find({ caso: caseId }).populate("autor", "name").sort({ criadoEm: -1 });

    if (evidencias.length === 0 && laudos.length === 0) {
      return res.status(400).json({
        error: "Não há dados suficientes para gerar relatório final"
      });
    }

    // Prompt para relatório final
    let promptText = `Gere um relatório final executivo completo para o seguinte caso pericial:\n\n`;
    
    promptText += `INFORMAÇÕES DO CASO:\n`;
    promptText += `Título: ${caso.titulo}\n`;
    promptText += `ID: ${caso._id}\n`;
    promptText += `Descrição: ${caso.descricao || "Não informado"}\n`;
    promptText += `Status: ${caso.status}\n`;
    promptText += `Responsável: ${caso.peritoResponsavel?.name || "Não informado"}\n`;
    promptText += `Data de Abertura: ${new Date(caso.createdAt).toLocaleString("pt-BR")}\n\n`;

    if (evidencias.length > 0) {
      promptText += `EVIDÊNCIAS COLETADAS (${evidencias.length} total):\n`;
      evidencias.forEach((ev, index) => {
        promptText += `${index + 1}. ${ev.titulo} (${ev.tipo})\n`;
        promptText += `   Descrição: ${ev.descricao}\n`;
        promptText += `   Status: ${ev.status}\n\n`;
      });
    }

    if (laudos.length > 0) {
      promptText += `LAUDOS PERICIAIS (${laudos.length} total):\n`;
      laudos.forEach((laudo, index) => {
        promptText += `${index + 1}. Autor: ${laudo.autor?.name || "Não informado"}\n`;
        promptText += `   Data: ${new Date(laudo.criadoEm).toLocaleString("pt-BR")}\n`;
        promptText += `   Resumo: ${laudo.texto.substring(0, 200)}...\n\n`;
      });
    }

    promptText += `INSTRUÇÕES PARA O RELATÓRIO FINAL:\n`;
    promptText += `- Estruture em: Resumo Executivo, Análise Consolidada, Conclusões Finais, Recomendações\n`;
    promptText += `- Consolide todas as evidências e laudos\n`;
    promptText += `- Apresente conclusões definitivas\n`;
    promptText += `- Sugira encaminhamentos ou recomendações\n`;
    promptText += `- Use linguagem formal adequada\n`;
    promptText += `- Seja conclusivo, este é o fechamento do caso`;

    const textoGerado = await chamarGeminiAPI(promptText, 4096);

    // Registrar no histórico
    await Historico.create({
      acao: "Relatório final gerado com IA",
      usuario: userId,
      caso: caseId,
      detalhes: `Relatório baseado em ${evidencias.length} evidência(s) e ${laudos.length} laudo(s)`,
    });

    res.status(200).json({
      message: "Relatório final gerado com sucesso",
      textoGerado,
      estatisticas: {
        evidencias: evidencias.length,
        laudos: laudos.length
      }
    });

  } catch (error) {
    console.error("[ERRO] Gerar relatório final IA:", error);
    res.status(500).json({ 
      error: "Erro ao gerar relatório final",
      details: error.message 
    });
  }
};

// 4. Gerar Relatório Completo com IA (mais avançado)
exports.gerarRelatorioCompleto = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { titulo } = req.body;
    const userId = req.user.id;

    if (!titulo) {
      return res.status(400).json({ error: "Título é obrigatório" });
    }

    // Buscar todos os dados do caso
    const caso = await Case.findById(caseId).populate("peritoResponsavel");
    if (!caso) return res.status(404).json({ error: "Caso não encontrado" });

    const evidencias = await Evidencia.find({ caso: caseId }).sort({ createdAt: -1 });
    const laudos = await Laudo.find({ caso: caseId }).populate("autor", "name").sort({ criadoEm: -1 });
    const vitimas = await Vitima.find({ caso: caseId });

    // Prompt mais elaborado para relatório completo
    let promptText = `Gere um relatório pericial completo e detalhado para o seguinte caso:\n\n`;
    
    promptText += `DADOS GERAIS DO CASO:\n`;
    promptText += `Título: ${caso.titulo}\n`;
    promptText += `Número do Caso: ${caso._id}\n`;
    promptText += `Descrição: ${caso.descricao || "Não informado"}\n`;
    promptText += `Status Atual: ${caso.status}\n`;
    promptText += `Perito Responsável: ${caso.peritoResponsavel?.name || "Não informado"}\n`;
    promptText += `Data de Abertura: ${new Date(caso.createdAt).toLocaleString("pt-BR")}\n`;
    promptText += `Data do Relatório: ${new Date().toLocaleString("pt-BR")}\n\n`;

    if (vitimas.length > 0) {
      promptText += `VÍTIMAS ENVOLVIDAS (${vitimas.length} total):\n`;
      vitimas.forEach((v, index) => {
        promptText += `${index + 1}. ${v.nome} - NIC: ${v.nic}\n`;
        promptText += `   Idade: ${v.idade || "Não informado"}\n`;
        promptText += `   Sexo: ${v.sexo || "Não informado"}\n\n`;
      });
    }

    if (evidencias.length > 0) {
      promptText += `EVIDÊNCIAS COLETADAS E ANALISADAS (${evidencias.length} total):\n`;
      evidencias.forEach((ev, index) => {
        promptText += `${index + 1}. ${ev.titulo}\n`;
        promptText += `   Tipo: ${ev.tipo}\n`;
        promptText += `   Descrição: ${ev.descricao}\n`;
        promptText += `   Local de Coleta: ${ev.localColeta || "Não informado"}\n`;
        promptText += `   Status: ${ev.status}\n`;
        promptText += `   Data: ${new Date(ev.createdAt).toLocaleString("pt-BR")}\n\n`;
      });
    }

    if (laudos.length > 0) {
      promptText += `LAUDOS PERICIAIS ELABORADOS (${laudos.length} total):\n`;
      laudos.forEach((laudo, index) => {
        promptText += `${index + 1}. Perito: ${laudo.autor?.name || "Não informado"}\n`;
        promptText += `   Data de Elaboração: ${new Date(laudo.criadoEm).toLocaleString("pt-BR")}\n`;
        promptText += `   Conteúdo Resumido: ${laudo.texto.substring(0, 300)}...\n\n`;
      });
    }

    promptText += `INSTRUÇÕES PARA O RELATÓRIO COMPLETO:\n`;
    promptText += `- Crie um relatório executivo detalhado e profissional\n`;
    promptText += `- Estruture em seções claras: Introdução, Metodologia, Análise Detalhada, Correlações, Conclusões Finais, Recomendações\n`;
    promptText += `- Faça análise correlacional entre evidências, laudos e vítimas\n`;
    promptText += `- Apresente timeline cronológico dos eventos\n`;
    promptText += `- Inclua análise crítica dos achados\n`;
    promptText += `- Forneça conclusões técnicas definitivas\n`;
    promptText += `- Sugira encaminhamentos específicos\n`;
    promptText += `- Use linguagem técnica adequada para relatório oficial\n`;
    promptText += `- Este é um relatório de alto nível para tomada de decisões`;

    const textoGerado = await chamarGeminiAPI(promptText, 6144);

    // Registrar no histórico
    await Historico.create({
      acao: "Relatório completo gerado com IA",
      usuario: userId,
      caso: caseId,
      detalhes: `Relatório "${titulo}" com análise de ${evidencias.length} evidência(s), ${laudos.length} laudo(s) e ${vitimas.length} vítima(s)`,
    });

    res.status(200).json({
      message: "Relatório completo gerado com sucesso",
      titulo,
      textoGerado,
      estatisticas: {
        evidencias: evidencias.length,
        laudos: laudos.length,
        vitimas: vitimas.length
      }
    });

  } catch (error) {
    console.error("[ERRO] Gerar relatório completo IA:", error);
    res.status(500).json({ 
      error: "Erro ao gerar relatório completo",
      details: error.message 
    });
  }
};

// 5. Gerar Análise Rápida/Resumo
exports.gerarAnaliseRapida = async (req, res) => {
  try {
    const { caseId } = req.params;
    const userId = req.user.id;

    const caso = await Case.findById(caseId);
    if (!caso) return res.status(404).json({ error: "Caso não encontrado" });

    const evidencias = await Evidencia.find({ caso: caseId });
    const laudos = await Laudo.find({ caso: caseId });

    let promptText = `Faça uma análise rápida e concisa (máximo 300 palavras) do seguinte caso:\n\n`;
    promptText += `Caso: ${caso.titulo}\n`;
    promptText += `Status: ${caso.status}\n`;
    promptText += `Evidências: ${evidencias.length}\n`;
    promptText += `Laudos: ${laudos.length}\n\n`;
    promptText += `Foque nos pontos principais, status atual e próximos passos recomendados.`;

    const textoGerado = await chamarGeminiAPI(promptText, 1024);

    res.status(200).json({
      message: "Análise rápida gerada",
      analise: textoGerado,
      caso: {
        id: caso._id,
        titulo: caso.titulo,
        status: caso.status
      }
    });

  } catch (error) {
    console.error("[ERRO] Análise rápida IA:", error);
    res.status(500).json({ 
      error: "Erro ao gerar análise rápida",
      details: error.message 
    });
  }
};
