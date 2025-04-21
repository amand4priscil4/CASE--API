const Case = require('../models/case.model');

// Cria um novo caso
exports.createCase = async (req, res) => {
  try {
    const { titulo, descricao, data, peritoResponsavel, localDoCaso } = req.body;

    const novoCaso = new Case({
      titulo,
      descricao,
      data,
      peritoResponsavel,
      localDoCaso,
      criadoPor: req.user.id // quem criou o caso (admin ou perito)
    });

    await novoCaso.save();

    res.status(201).json({ message: 'Caso criado com sucesso.', caso: novoCaso });
  } catch (error) {
    console.error('[ERRO] Criação de caso:', error);
    res.status(500).json({ message: 'Erro ao criar o caso.' });
  }
};

// Listar todos os casos
exports.getAllCases = async (req, res) => {
  try {
    const casos = await Case.find().populate('peritoResponsavel', 'name email matricula');
    res.status(200).json(casos);
  } catch (error) {
    console.error('[ERRO] Listagem de casos:', error);
    res.status(500).json({ message: 'Erro ao buscar os casos.' });
  }
};

// Buscar caso por ID
exports.getCaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const caso = await Case.findById(id).populate('peritoResponsavel', 'name email matricula');

    if (!caso) {
      return res.status(404).json({ message: 'Caso não encontrado.' });
    }

    res.status(200).json(caso);
  } catch (error) {
    console.error('[ERRO] Buscar caso por ID:', error);
    res.status(500).json({ message: 'Erro ao buscar o caso.' });
  }
};

// Editar cado por ID
exports.updateCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, data, status, peritoResponsavel } = req.body;

    const atualizacoes = {};

    if (titulo) atualizacoes.titulo = titulo;
    if (descricao) atualizacoes.descricao = descricao;
    if (data) atualizacoes.data = data;
    if (status) atualizacoes.status = status;
    if (peritoResponsavel) atualizacoes.peritoResponsavel = peritoResponsavel;
    if (localDoCaso) atualizacoes.localDoCaso = localDoCaso;

    const casoAtualizado = await Case.findByIdAndUpdate(id, atualizacoes, {
      new: true,
      runValidators: true
    }).populate('peritoResponsavel', 'name email matricula');

    if (!casoAtualizado) {
      return res.status(404).json({ message: 'Caso não encontrado.' });
    }

    res.status(200).json({ message: 'Caso atualizado com sucesso.', caso: casoAtualizado });
  } catch (error) {
    console.error('[ERRO] Atualização de caso:', error);
    res.status(500).json({ message: 'Erro ao atualizar o caso.' });
  }
};

// Deletar caso por ID
exports.deleteCase = async (req, res) => {
  try {
    const { id } = req.params;

    const casoDeletado = await Case.findByIdAndDelete(id);

    if (!casoDeletado) {
      return res.status(404).json({ message: 'Caso não encontrado.' });
    }

    res.status(200).json({ message: 'Caso deletado com sucesso.' });
  } catch (error) {
    console.error('[ERRO] Exclusão de caso:', error);
    res.status(500).json({ message: 'Erro ao deletar o caso.' });
  }
};
