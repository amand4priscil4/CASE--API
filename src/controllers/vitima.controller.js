const Vitima = require('../models/vitima.model');
const Historico = require('../models/historico.model');

// Criar vítima
exports.createVitima = async (req, res) => {
  try {
    const { 
      nic, 
      nome, 
      genero, 
      idade, 
      documento, 
      endereco, 
      corEtnia, 
      odontograma, 
      regioesAnatomicas, 
      caso 
    } = req.body;

    // Validações básicas
    if (!nic || !nome || !genero || !idade || !documento || !caso) {
      return res.status(400).json({ 
        message: 'Campos obrigatórios não preenchidos.' 
      });
    }

    // Criar nova vítima
    const novaVitima = new Vitima({
      nic,
      nome,
      genero,
      idade,
      documento,
      endereco,
      corEtnia,
      odontograma,
      regioesAnatomicas,
      caso,
      criadoPor: req.user.id
    });

    // Salvar no banco
    await novaVitima.save();

    // Registrar no histórico
    await Historico.create({
      acao: 'Vítima cadastrada',
      usuario: req.user.id,
      caso,
      detalhes: `Vítima ${nome} foi cadastrada.`
    });

    res.status(201).json({
      message: 'Vítima cadastrada com sucesso.',
      vitima: novaVitima
    });
  } catch (error) {
    console.error('[ERRO] Cadastro de vítima:', error);
    res.status(500).json({ message: 'Erro ao cadastrar vítima.' });
  }
};

// Listar vítimas por caso
exports.getVitimasByCaso = async (req, res) => {
  try {
    const { casoId } = req.params;

    const vitimas = await Vitima.find({ caso: casoId });

    res.status(200).json(vitimas);
  } catch (error) {
    console.error('[ERRO] Listar vítimas por caso:', error);
    res.status(500).json({ message: 'Erro ao buscar vítimas.' });
  }
};

// Buscar vítima por ID
exports.getVitimaById = async (req, res) => {
  try {
    const { id } = req.params;

    const vitima = await Vitima.findById(id);
    if (!vitima) {
      return res.status(404).json({ message: 'Vítima não encontrada.' });
    }

    res.status(200).json(vitima);
  } catch (error) {
    console.error('[ERRO] Buscar vítima por ID:', error);
    res.status(500).json({ message: 'Erro ao buscar vítima.' });
  }
};

// Atualizar vítima
exports.updateVitima = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verifica se a vítima existe
    const vitima = await Vitima.findById(id);
    if (!vitima) {
      return res.status(404).json({ message: 'Vítima não encontrada.' });
    }

    // Atualiza os dados
    const vitimaAtualizada = await Vitima.findByIdAndUpdate(
      id, 
      updateData,
      { new: true, runValidators: true }
    );

    // Registrar no histórico
    await Historico.create({
      acao: 'Vítima atualizada',
      usuario: req.user.id,
      caso: vitima.caso,
      detalhes: `Vítima ${vitima.nome} foi atualizada.`
    });

    res.status(200).json({ 
      message: 'Vítima atualizada com sucesso.',
      vitima: vitimaAtualizada
    });
  } catch (error) {
    console.error('[ERRO] Atualização de vítima:', error);
    res.status(500).json({ message: 'Erro ao atualizar vítima.' });
  }
};

// Deletar vítima
exports.deleteVitima = async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica se a vítima existe
    const vitima = await Vitima.findById(id);
    if (!vitima) {
      return res.status(404).json({ message: 'Vítima não encontrada.' });
    }

    // Armazena informações para o histórico
    const casoId = vitima.caso;
    const nomeVitima = vitima.nome;

    // Remove a vítima
    await Vitima.findByIdAndDelete(id);

    // Registrar no histórico
    await Historico.create({
      acao: 'Vítima removida',
      usuario: req.user.id,
      caso: casoId,
      detalhes: `Vítima ${nomeVitima} foi removida.`
    });

    res.status(200).json({ message: 'Vítima removida com sucesso.' });
  } catch (error) {
    console.error('[ERRO] Exclusão de vítima:', error);
    res.status(500).json({ message: 'Erro ao remover vítima.' });
  }
};

// Atualizar odontograma
exports.updateOdontograma = async (req, res) => {
  try {
    const { id } = req.params;
    const { odontograma } = req.body;

    const vitima = await Vitima.findByIdAndUpdate(
      id,
      { odontograma },
      { new: true }
    );

    if (!vitima) {
      return res.status(404).json({ message: 'Vítima não encontrada.' });
    }

    // Registrar no histórico
    await Historico.create({
      acao: 'Odontograma atualizado',
      usuario: req.user.id,
      caso: vitima.caso,
      detalhes: `Odontograma da vítima ${vitima.nome} foi atualizado.`
    });

    res.status(200).json({ 
      message: 'Odontograma atualizado com sucesso',
      vitima
    });
  } catch (error) {
    console.error('[ERRO] Atualização de odontograma:', error);
    res.status(500).json({ message: 'Erro ao atualizar odontograma.' });
  }
};

// Atualizar regiões anatômicas
exports.updateRegioes = async (req, res) => {
  try {
    const { id } = req.params;
    const { regioesAnatomicas } = req.body;

    const vitima = await Vitima.findByIdAndUpdate(
      id,
      { regioesAnatomicas },
      { new: true }
    );

    if (!vitima) {
      return res.status(404).json({ message: 'Vítima não encontrada.' });
    }

    // Registrar no histórico
    await Historico.create({
      acao: 'Regiões anatômicas atualizadas',
      usuario: req.user.id,
      caso: vitima.caso,
      detalhes: `Regiões anatômicas da vítima ${vitima.nome} foram atualizadas.`
    });

    res.status(200).json({ 
      message: 'Regiões anatômicas atualizadas com sucesso',
      vitima
    });
  } catch (error) {
    console.error('[ERRO] Atualização de regiões anatômicas:', error);
    res.status(500).json({ message: 'Erro ao atualizar regiões anatômicas.' });
  }
};