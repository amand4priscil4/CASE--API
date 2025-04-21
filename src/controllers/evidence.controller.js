// Importa o model de Evidence (baseado no Mongoose), que representa a coleção de evidências no banco
const Evidence = require('../models/evidence.model');

/*
|--------------------------------------------------------------------------
| Criar evidência
|--------------------------------------------------------------------------
*/
exports.createEvidence = async (req, res) => {
  try {
    console.log('[DEBUG] Arquivo recebido:', req.file);

    const { titulo, descricao, localColeta, dataColeta, caso } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Arquivo da evidência é obrigatório.' });
    }

    if (!dataColeta) {
      return res.status(400).json({ message: 'Data de coleta é obrigatória.' });
    }

    // Corrige o tipo de arquivo
    const tipo = req.file.mimetype.startsWith('image/') ? 'imagem' : 'documento';

    // Garante que o perfil esteja com a primeira letra maiúscula (match do enum)
    const perfilFormatado =
      req.user.perfil.charAt(0).toUpperCase() + req.user.perfil.slice(1).toLowerCase();

    const novaEvidencia = new Evidence({
      titulo,
      localColeta,
      dataColeta,
      descricao,
      caso,
      tipoArquivo: tipo,
      arquivo: req.file.filename,
      criadoPor: {
        id: req.user.id,
        name: req.user.name,
        perfil: perfilFormatado
      }
    });

    await novaEvidencia.save();

    res.status(201).json({
      message: 'Evidência cadastrada com sucesso.',
      evidencia: novaEvidencia
    });
  } catch (error) {
    console.log('[DEBUG] Dados do usuário logado:', req.user); // ADICIONE ESTA LINHA
    res.status(500).json({ message: 'Erro ao cadastrar evidência.' });
  }
};

/*
|--------------------------------------------------------------------------
| Listar evidências de um caso
|--------------------------------------------------------------------------
*/
exports.getEvidencesByCase = async (req, res) => {
  try {
    const { casoId } = req.query;

    if (!casoId) {
      return res.status(400).json({ message: 'ID do caso não informado.' });
    }

    // Busca evidências associadas ao caso
    const evidencias = await Evidence.find({ caso: casoId });

    res.status(200).json(evidencias);
  } catch (error) {
    console.error('[ERRO] Listar evidências por caso:', error);
    res.status(500).json({ message: 'Erro ao buscar evidências.' });
  }
};

/*
|--------------------------------------------------------------------------
| Atualizar evidência
|--------------------------------------------------------------------------
*/
exports.updateEvidence = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const evidenciaAtualizada = await Evidence.findByIdAndUpdate(id, updates, {
      new: true
    });

    if (!evidenciaAtualizada) {
      return res.status(404).json({ message: 'Evidência não encontrada.' });
    }

    res
      .status(200)
      .json({ message: 'Evidência atualizada com sucesso.', evidencia: evidenciaAtualizada });
  } catch (error) {
    console.error('[ERRO] Atualização de evidência:', error);
    res.status(500).json({ message: 'Erro ao atualizar evidência.' });
  }
};
