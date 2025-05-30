// Importa o model Laudo, que representa um documento formal vinculado a um caso, evidências e um autor
const Laudo = require('../models/laudo.model');

//  Criar laudo
exports.createLaudo = async (req, res) => {
  try {
    // Extrai dados enviados no corpo da requisição
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
      .populate('autor', 'name')
      .populate('evidencias')
      .sort({ criadoEm: -1 });

    res.status(200).json(laudos);
  } catch (error) {
    console.error('[ERRO] Buscar laudos:', error);
    res.status(500).json({ message: 'Erro ao buscar laudos.' });
  }
};
