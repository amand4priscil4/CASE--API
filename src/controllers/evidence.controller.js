// Importa o model de Evidence (baseado no Mongoose), que representa a coleção de evidências no banco
const Evidence = require('../models/evidence.model');

/*
|--------------------------------------------------------------------------
| Criar evidência
|--------------------------------------------------------------------------
*/
exports.createEvidence = async (req, res) => {
  try {
    console.log('[DEBUG] === INÍCIO CREATE EVIDENCE ===');
    console.log('[DEBUG] Arquivo recebido:', req.file);
    console.log('[DEBUG] Body recebido:', req.body);
    console.log('[DEBUG] User logado:', req.user);

    const { titulo, descricao, localColeta, dataColeta, caso } = req.body;

    if (!req.file) {
      console.log('[DEBUG] ERRO: Nenhum arquivo enviado');
      return res.status(400).json({ message: 'Arquivo da evidência é obrigatório.' });
    }

    if (!dataColeta) {
      console.log('[DEBUG] ERRO: Data de coleta não informada');
      return res.status(400).json({ message: 'Data de coleta é obrigatória.' });
    }

    console.log('[DEBUG] Validações básicas OK');

    // Corrige o tipo de arquivo
    const tipo = req.file.mimetype.startsWith('image/') ? 'imagem' : 'documento';
    console.log('[DEBUG] Tipo de arquivo detectado:', tipo);

    // Verifica se o user tem role definido
    if (!req.user || !req.user.role) {
      console.log('[DEBUG] ERRO: Usuário sem role definido');
      return res.status(400).json({ message: 'Usuário sem permissão definida.' });
    }

    // Garante que o perfil esteja com a primeira letra maiúscula (match do enum)
    const perfilFormatado = req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1).toLowerCase();
    console.log('[DEBUG] Perfil formatado:', perfilFormatado);

    // Verifica se req.file tem as propriedades necessárias
    const arquivo = req.file.path || req.file.filename || req.file.originalname;
    console.log('[DEBUG] Caminho do arquivo:', arquivo);

    const dadosEvidencia = {
      titulo,
      localColeta,
      dataColeta,
      descricao,
      caso,
      tipoArquivo: tipo,
      arquivo: arquivo,
      criadoPor: {
        id: req.user.id,
        name: req.user.name || req.user.email || 'Usuário não identificado',
        perfil: perfilFormatado
      }
    };

    console.log('[DEBUG] Dados da evidência a serem salvos:', dadosEvidencia);

    const novaEvidencia = new Evidence(dadosEvidencia);
    console.log('[DEBUG] Modelo da evidência criado:', novaEvidencia);

    await novaEvidencia.save();
    console.log('[DEBUG] Evidência salva com sucesso');

    res.status(201).json({
      message: 'Evidência cadastrada com sucesso.',
      evidencia: novaEvidencia
    });
  } catch (error) {
    console.error('[ERRO COMPLETO] Criação de evidência:', error);
    console.error('[ERRO STACK]:', error.stack);
    console.error('[ERRO MESSAGE]:', error.message);
    console.log('[DEBUG] Dados do usuário logado na hora do erro:', req.user);
    console.log('[DEBUG] Arquivo na hora do erro:', req.file);
    
    res.status(500).json({ 
      message: 'Erro ao cadastrar evidência.',
      erro: error.message,
      debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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