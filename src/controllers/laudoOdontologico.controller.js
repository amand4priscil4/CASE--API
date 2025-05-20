const LaudoOdontologico = require('../models/laudoOdontologico.model');
const Vitima = require('../models/vitima.model');
const Historico = require('../models/historico.model');
const fs = require('fs');
const path = require('path');

// Criar laudo odontológico
exports.criarLaudoOdontologico = async (req, res) => {
  try {
    const { vitimaId } = req.params;
    const { observacoes, parecer, odontogramaSnapshot } = req.body;
    const peritoId = req.user.id;

    // Verificar se a vítima existe
    const vitima = await Vitima.findById(vitimaId);
    if (!vitima) {
      return res.status(404).json({ message: 'Vítima não encontrada.' });
    }

    // Validar se o usuário é um perito odontológico
    // Isso depende da configuração do seu sistema de permissões
    if (req.user.role !== 'perito' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Apenas peritos odontológicos podem emitir laudos odontológicos.' 
      });
    }

    // Criar o laudo
    const novoLaudo = new LaudoOdontologico({
      vitima: vitimaId,
      perito: peritoId,
      caso: vitima.caso,
      observacoes,
      parecer,
      odontogramaSnapshot: odontogramaSnapshot || vitima.odontograma
    });

    await novoLaudo.save();

    // Registrar no histórico
    await Historico.create({
      acao: 'Laudo odontológico emitido',
      usuario: peritoId,
      caso: vitima.caso,
      detalhes: `Laudo odontológico emitido para a vítima ${vitima.nome}.`
    });

    res.status(201).json({
      message: 'Laudo odontológico criado com sucesso.',
      laudo: novoLaudo
    });
  } catch (error) {
    console.error('[ERRO] Criação de laudo odontológico:', error);
    res.status(500).json({ message: 'Erro ao criar laudo odontológico.' });
  }
};

// Listar laudos odontológicos de uma vítima
exports.listarLaudosOdontologicos = async (req, res) => {
  try {
    const { vitimaId } = req.params;

    const laudos = await LaudoOdontologico.find({ vitima: vitimaId })
      .populate('perito', 'name email')
      .sort({ dataEmissao: -1 });

    res.status(200).json(laudos);
  } catch (error) {
    console.error('[ERRO] Listagem de laudos odontológicos:', error);
    res.status(500).json({ message: 'Erro ao listar laudos odontológicos.' });
  }
};

// Obter um laudo odontológico específico
exports.obterLaudoOdontologico = async (req, res) => {
  try {
    const { laudoId } = req.params;

    const laudo = await LaudoOdontologico.findById(laudoId)
      .populate('vitima', 'nome nic genero idade')
      .populate('perito', 'name email')
      .populate('caso', 'titulo numero');

    if (!laudo) {
      return res.status(404).json({ message: 'Laudo odontológico não encontrado.' });
    }

    res.status(200).json(laudo);
  } catch (error) {
    console.error('[ERRO] Busca de laudo odontológico:', error);
    res.status(500).json({ message: 'Erro ao buscar laudo odontológico.' });
  }
};

// Atualizar um laudo (apenas observações e parecer)
exports.atualizarLaudoOdontologico = async (req, res) => {
  try {
    const { laudoId } = req.params;
    const { observacoes, parecer } = req.body;
    const peritoId = req.user.id;

    // Verificar se o laudo existe
    const laudo = await LaudoOdontologico.findById(laudoId);
    if (!laudo) {
      return res.status(404).json({ message: 'Laudo odontológico não encontrado.' });
    }

    // Verificar se o usuário é o perito que criou o laudo ou um admin
    if (laudo.perito.toString() !== peritoId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Apenas o perito que emitiu o laudo ou um administrador pode atualizá-lo.' 
      });
    }

    // Atualizar apenas os campos permitidos
    laudo.observacoes = observacoes;
    laudo.parecer = parecer;
    await laudo.save();

    // Registrar no histórico
    await Historico.create({
      acao: 'Laudo odontológico atualizado',
      usuario: peritoId,
      caso: laudo.caso,
      detalhes: `Laudo odontológico ID ${laudoId} foi atualizado.`
    });

    res.status(200).json({
      message: 'Laudo odontológico atualizado com sucesso.',
      laudo
    });
  } catch (error) {
    console.error('[ERRO] Atualização de laudo odontológico:', error);
    res.status(500).json({ message: 'Erro ao atualizar laudo odontológico.' });
  }
};

// Salvar arquivo PDF do laudo
exports.salvarPDFLaudo = async (req, res) => {
  try {
    const { laudoId } = req.params;
    
    // Verificar se há um arquivo no upload
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo PDF enviado.' });
    }

    // Verificar se o laudo existe
    const laudo = await LaudoOdontologico.findById(laudoId);
    if (!laudo) {
      // Remover o arquivo enviado se o laudo não existe
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Laudo odontológico não encontrado.' });
    }

    // Atualizar o caminho do arquivo no laudo
    laudo.arquivoPDF = req.file.path;
    await laudo.save();

    res.status(200).json({
      message: 'Arquivo PDF do laudo salvo com sucesso.',
      arquivoPDF: req.file.filename
    });
  } catch (error) {
    console.error('[ERRO] Salvar PDF de laudo:', error);
    // Se houver erro, tenta remover o arquivo se ele foi enviado
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Erro ao remover arquivo:', unlinkError);
      }
    }
    res.status(500).json({ message: 'Erro ao salvar arquivo PDF do laudo.' });
  }
};

// Baixar o PDF do laudo
exports.baixarPDFLaudo = async (req, res) => {
  try {
    const { laudoId } = req.params;

    const laudo = await LaudoOdontologico.findById(laudoId);
    if (!laudo) {
      return res.status(404).json({ message: 'Laudo odontológico não encontrado.' });
    }

    if (!laudo.arquivoPDF) {
      return res.status(404).json({ message: 'PDF do laudo não encontrado.' });
    }

    // Baixar o arquivo
    const arquivoPath = path.resolve(laudo.arquivoPDF);
    
    res.download(arquivoPath, `laudo_odontologico_${laudo._id}.pdf`, (err) => {
      if (err) {
        console.error('[ERRO] Download de PDF:', err);
        return res.status(500).json({ message: 'Erro ao baixar o arquivo PDF.' });
      }
    });
  } catch (error) {
    console.error('[ERRO] Download de PDF de laudo:', error);
    res.status(500).json({ message: 'Erro ao baixar arquivo PDF do laudo.' });
  }
};