const RelatorioFinal = require('../models/relatorio.model');
const PDFDocument = require('pdfkit');
const Case = require('../models/case.model');
const User = require('../models/user.model');
const Historico = require('../models/historico.model');

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
    caso.status = 'finalizado'; // ✅ CORRIGIDO: usar enum correto do model
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

exports.getRelatorioPorCaso = async (req, res) => {
  try {
    const { caseId } = req.params;

    // ✅ CORRIGIDO: populate('criadoPor', 'name') em vez de 'nome'
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

exports.exportarRelatorioPDF = async (req, res) => {
  try {
    const { caseId } = req.params;

    // ✅ CORRIGIDO: populate correto
    const relatorio = await RelatorioFinal.findOne({ caso: caseId })
      .populate('criadoPor', 'name')
      .populate('caso');

    if (!relatorio) {
      return res.status(404).json({ error: 'Relatório não encontrado para este caso.' });
    }

    // ✅ CORRIGIDO: Case.findById e populate correto
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
    // ✅ CORRIGIDO: peritoResponsavel?.name em vez de responsavel?.nome
    doc.text(`Responsável: ${caso.peritoResponsavel?.name || 'Não informado'}`);
    doc.text(`Status: ${caso.status}`);
    doc.text(`Criado em: ${new Date(relatorio.criadoEm).toLocaleDateString('pt-BR')}`);
    doc.moveDown();

    doc.text('Conteúdo:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(relatorio.texto, {
      align: 'left'
    });

    doc.end(); // Finaliza o documento
  } catch (err) {
    console.error('[ERRO] Exportar relatório PDF:', err);
    res.status(500).json({ error: 'Erro ao exportar relatório em PDF.' });
  }
};