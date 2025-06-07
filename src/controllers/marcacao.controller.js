const Marcacao = require('../models/marcacao.model');
const Vitima = require('../models/vitima.model');
const Historico = require('../models/historico.model');

// Criar nova marcação
exports.criarMarcacao = async (req, res) => {
  try {
    const { vitimaId } = req.params;
    const {
      tipo,
      anatomia,
      coordenadas,
      regiao,
      descricao,
      observacoes,
      cor,
      tamanho
    } = req.body;

    // Verificar se vítima existe
    const vitima = await Vitima.findById(vitimaId);
    if (!vitima) {
      return res.status(404).json({ message: 'Vítima não encontrada' });
    }

    // Validações básicas
    if (!tipo || !anatomia || !coordenadas || !regiao || !descricao) {
      return res.status(400).json({ 
        message: 'Campos obrigatórios: tipo, anatomia, coordenadas, regiao, descricao' 
      });
    }

    // Validar coordenadas
    if (coordenadas.x < 0 || coordenadas.x > 100 || coordenadas.y < 0 || coordenadas.y > 100) {
      return res.status(400).json({ 
        message: 'Coordenadas devem estar entre 0 e 100 (porcentagem)' 
      });
    }

    const novaMarcacao = new Marcacao({
      vitima: vitimaId,
      tipo,
      anatomia,
      coordenadas,
      regiao,
      descricao,
      observacoes,
      cor: cor || '#FF0000',
      tamanho: tamanho || 8,
      criadoPor: req.user.id
    });

    await novaMarcacao.save();

    // Registrar no histórico
    await Historico.create({
      acao: 'Marcação anatômica criada',
      usuario: req.user.id,
      caso: vitima.caso,
      detalhes: `Marcação "${tipo}" adicionada em ${anatomia.categoria} - ${regiao.nome}`
    });

    await novaMarcacao.populate('criadoPor', 'name');

    res.status(201).json({
      message: 'Marcação criada com sucesso',
      marcacao: novaMarcacao
    });

  } catch (error) {
    console.error('[ERRO] Criar marcação:', error);
    res.status(500).json({ 
      message: 'Erro ao criar marcação', 
      error: error.message 
    });
  }
};

// Listar marcações por vítima
exports.listarMarcacoesPorVitima = async (req, res) => {
  try {
    const { vitimaId } = req.params;
    const { categoria, vista, tipo } = req.query;

    // Verificar se vítima existe
    const vitima = await Vitima.findById(vitimaId);
    if (!vitima) {
      return res.status(404).json({ message: 'Vítima não encontrada' });
    }

    // Construir filtros
    const filtros = {
      vitima: vitimaId,
      status: 'ativo'
    };

    if (categoria) filtros['anatomia.categoria'] = categoria;
    if (vista) filtros['anatomia.vista'] = vista;
    if (tipo) filtros.tipo = tipo;

    const marcacoes = await Marcacao.find(filtros)
      .populate('criadoPor', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(marcacoes);

  } catch (error) {
    console.error('[ERRO] Listar marcações:', error);
    res.status(500).json({ 
      message: 'Erro ao listar marcações', 
      error: error.message 
    });
  }
};

// Listar marcações agrupadas por anatomia
exports.listarMarcacoesAgrupadas = async (req, res) => {
  try {
    const { vitimaId } = req.params;

    const marcacoes = await Marcacao.aggregate([
      {
        $match: {
          vitima: new mongoose.Types.ObjectId(vitimaId),
          status: 'ativo'
        }
      },
      {
        $group: {
          _id: {
            categoria: '$anatomia.categoria',
            vista: '$anatomia.vista',
            sexo: '$anatomia.sexo',
            faixaEtaria: '$anatomia.faixaEtaria',
            lateralidade: '$anatomia.lateralidade'
          },
          marcacoes: {
            $push: {
              _id: '$_id',
              tipo: '$tipo',
              coordenadas: '$coordenadas',
              regiao: '$regiao',
              descricao: '$descricao',
              cor: '$cor',
              tamanho: '$tamanho',
              createdAt: '$createdAt'
            }
          },
          total: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.categoria': 1, '_id.vista': 1 }
      }
    ]);

    res.status(200).json(marcacoes);

  } catch (error) {
    console.error('[ERRO] Listar marcações agrupadas:', error);
    res.status(500).json({ 
      message: 'Erro ao listar marcações agrupadas', 
      error: error.message 
    });
  }
};

// Buscar marcação por ID
exports.buscarMarcacao = async (req, res) => {
  try {
    const { id } = req.params;

    const marcacao = await Marcacao.findById(id)
      .populate('vitima', 'nome nic')
      .populate('criadoPor', 'name');

    if (!marcacao) {
      return res.status(404).json({ message: 'Marcação não encontrada' });
    }

    res.status(200).json(marcacao);

  } catch (error) {
    console.error('[ERRO] Buscar marcação:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar marcação', 
      error: error.message 
    });
  }
};

// Atualizar marcação
exports.atualizarMarcacao = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verificar se marcação existe
    const marcacao = await Marcacao.findById(id);
    if (!marcacao) {
      return res.status(404).json({ message: 'Marcação não encontrada' });
    }

    // Validar coordenadas se estão sendo atualizadas
    if (updates.coordenadas) {
      const { x, y } = updates.coordenadas;
      if (x < 0 || x > 100 || y < 0 || y > 100) {
        return res.status(400).json({ 
          message: 'Coordenadas devem estar entre 0 e 100 (porcentagem)' 
        });
      }
    }

    const marcacaoAtualizada = await Marcacao.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('criadoPor', 'name');

    // Registrar no histórico
    const vitima = await Vitima.findById(marcacao.vitima);
    await Historico.create({
      acao: 'Marcação anatômica atualizada',
      usuario: req.user.id,
      caso: vitima.caso,
      detalhes: `Marcação "${marcacao.tipo}" atualizada em ${marcacao.anatomia.categoria}`
    });

    res.status(200).json({
      message: 'Marcação atualizada com sucesso',
      marcacao: marcacaoAtualizada
    });

  } catch (error) {
    console.error('[ERRO] Atualizar marcação:', error);
    res.status(500).json({ 
      message: 'Erro ao atualizar marcação', 
      error: error.message 
    });
  }
};

// Remover marcação (soft delete)
exports.removerMarcacao = async (req, res) => {
  try {
    const { id } = req.params;

    const marcacao = await Marcacao.findById(id);
    if (!marcacao) {
      return res.status(404).json({ message: 'Marcação não encontrada' });
    }

    // Soft delete
    marcacao.status = 'removido';
    await marcacao.save();

    // Registrar no histórico
    const vitima = await Vitima.findById(marcacao.vitima);
    await Historico.create({
      acao: 'Marcação anatômica removida',
      usuario: req.user.id,
      caso: vitima.caso,
      detalhes: `Marcação "${marcacao.tipo}" removida de ${marcacao.anatomia.categoria}`
    });

    res.status(200).json({ message: 'Marcação removida com sucesso' });

  } catch (error) {
    console.error('[ERRO] Remover marcação:', error);
    res.status(500).json({ 
      message: 'Erro ao remover marcação', 
      error: error.message 
    });
  }
};

// Obter tipos de anatomia disponíveis
exports.obterTiposAnatomia = async (req, res) => {
  try {
    const tiposAnatomia = {
      categorias: [
        'corpo_inteiro',
        'cabeca_cranio', 
        'maos',
        'pes',
        'arcada_dentaria'
      ],
      vistas: {
        corpo_inteiro: ['anterior', 'posterior', 'lateral_direita', 'lateral_esquerda'],
        cabeca_cranio: ['anterior', 'posterior', 'lateral_direita', 'lateral_esquerda', 'superior'],
        maos: ['palmar', 'dorsal'],
        pes: ['plantar', 'anterior'],
        arcada_dentaria: ['superior', 'inferior']
      },
      tipos: [
        'lesao',
        'cicatriz',
        'tatuagem',
        'fratura',
        'deformidade',
        'caracteristica',
        'outro'
      ]
    };

    res.status(200).json(tiposAnatomia);

  } catch (error) {
    console.error('[ERRO] Obter tipos anatomia:', error);
    res.status(500).json({ 
      message: 'Erro ao obter tipos de anatomia', 
      error: error.message 
    });
  }
};