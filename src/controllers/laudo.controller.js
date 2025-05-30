const Laudo = require('../models/laudo.model');
const Historico = require('../models/historico.model');

// Criar laudo
exports.createLaudo = async (req, res) => {
  try {
    const { caso, evidencias, texto } = req.body;

    // Validação básica: caso e texto são obrigatórios
    if (!caso || !texto) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos.' });
    }

    // Cria uma nova instância do modelo Laudo com os dados recebidos + ID do autor logado
    const novoLaudo = new Laudo({
      caso, // ID do caso associado ao laudo
      evidencias, // Lista de IDs de evidências que embasam o laudo
      texto, // O conteúdo técnico do laudo
      autor: req.user.id // ID do usuário autenticado, vindo do middleware de autenticação
    });

    // Salva o novo laudo no banco de dados
    await novoLaudo.save();

    // Registrar no histórico
    await Historico.create({
      acao: 'Laudo criado',
      usuario: req.user.id,
      caso: caso,
      detalhes: `Laudo criado para o caso.`
    });

    // Envia resposta de sucesso com status 201 (Created) e os dados do novo laudo
    res.status(201).json({
      message: 'Laudo criado com sucesso.',
      laudo: novoLaudo
    });
  } catch (error) {
    // Se algo não deu certo, loga o erro e responde com status 500 (erro do servidor)
    console.error('[ERRO] Criação de laudo:', error);
    res.status(500).json({ message: 'Erro ao criar laudo.' });
  }
};

// Buscar laudos por caso
exports.getLaudosByCaso = async (req, res) => {
  try {
    const { casoId } = req.query;
    
    if (!casoId) {
      return res.status(400).json({ message: 'ID do caso não informado.' });
    }

    const laudos = await Laudo.find({ caso: casoId })
      .populate('autor', 'name email')
      .populate('evidencias', 'titulo')
      .populate('caso', 'titulo')
      .sort({ criadoEm: -1 });

    res.status(200).json(laudos);
  } catch (error) {
    console.error('[ERRO] Buscar laudos por caso:', error);
    res.status(500).json({ message: 'Erro ao buscar laudos.' });
  }
};

// Buscar todos os laudos
exports.getAllLaudos = async (req, res) => {
  try {
    const laudos = await Laudo.find()
      .populate('autor', 'name email')
      .populate('evidencias', 'titulo')
      .populate('caso', 'titulo')
      .sort({ criadoEm: -1 });

    res.status(200).json(laudos);
  } catch (error) {
    console.error('[ERRO] Listar todos os laudos:', error);
    res.status(500).json({ message: 'Erro ao buscar laudos.' });
  }
};

// Buscar laudo por ID
exports.getLaudoById = async (req, res) => {
  try {
    const { id } = req.params;

    const laudo = await Laudo.findById(id)
      .populate('autor', 'name email')
      .populate('evidencias')
      .populate('caso', 'titulo');

    if (!laudo) {
      return res.status(404).json({ message: 'Laudo não encontrado.' });
    }

    res.status(200).json(laudo);
  } catch (error) {
    console.error('[ERRO] Buscar laudo por ID:', error);
    res.status(500).json({ message: 'Erro ao buscar laudo.' });
  }
};

// Atualizar laudo
exports.updateLaudo = async (req, res) => {
  try {
    const { id } = req.params;
    const { evidencias, texto } = req.body;

    // Verifica se o laudo existe
    const laudo = await Laudo.findById(id);
    if (!laudo) {
      return res.status(404).json({ message: 'Laudo não encontrado.' });
    }

    // Verifica permissões: apenas o autor ou admin podem editar
    if (req.user.role !== 'admin' && laudo.autor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Acesso negado. Apenas o autor ou administrador podem editar o laudo.' });
    }

    // Atualiza os dados
    const atualizacoes = {};
    if (evidencias) atualizacoes.evidencias = evidencias;
    if (texto) atualizacoes.texto = texto;

    const laudoAtualizado = await Laudo.findByIdAndUpdate(
      id,
      atualizacoes,
      { new: true, runValidators: true }
    ).populate('autor', 'name email')
     .populate('evidencias', 'titulo')
     .populate('caso', 'titulo');

    // Registrar no histórico
    await Historico.create({
      acao: 'Laudo atualizado',
      usuario: req.user.id,
      caso: laudo.caso,
      detalhes: `Laudo ${id} foi atualizado.`
    });

    res.status(200).json({
      message: 'Laudo atualizado com sucesso.',
      laudo: laudoAtualizado
    });
  } catch (error) {
    console.error('[ERRO] Atualização de laudo:', error);
    res.status(500).json({ message: 'Erro ao atualizar laudo.' });
  }
};

// Deletar laudo
exports.deleteLaudo = async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica se o laudo existe
    const laudo = await Laudo.findById(id);
    if (!laudo) {
      return res.status(404).json({ message: 'Laudo não encontrado.' });
    }

    // Verifica permissões: apenas admin ou o autor podem deletar
    if (req.user.role !== 'admin' && laudo.autor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Acesso negado. Apenas o autor ou administrador podem deletar o laudo.' });
    }

    await Laudo.findByIdAndDelete(id);

    // Registrar no histórico
    await Historico.create({
      acao: 'Laudo deletado',
      usuario: req.user.id,
      caso: laudo.caso,
      detalhes: `Laudo ${id} foi removido.`
    });

    res.status(200).json({ message: 'Laudo deletado com sucesso.' });
  } catch (error) {
    console.error('[ERRO] Exclusão de laudo:', error);
    res.status(500).json({ message: 'Erro ao deletar laudo.' });
  }
};