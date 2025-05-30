const Case = require('../models/case.model');
const Historico = require('../models/historico.model');

// Criar novo caso
exports.createCase = async (req, res) => {
  try {
    const { 
      titulo, 
      tipo, 
      descricao, 
      data, 
      status, 
      peritoResponsavel, 
      localDoCaso,
      localizacao 
    } = req.body;

    // Validação de coordenadas se fornecidas
    if (localizacao && localizacao.coordenadas) {
      const [longitude, latitude] = localizacao.coordenadas;
      
      if (longitude < -180 || longitude > 180) {
        return res.status(400).json({ message: 'Longitude inválida. Deve estar entre -180 e 180.' });
      }
      
      if (latitude < -90 || latitude > 90) {
        return res.status(400).json({ message: 'Latitude inválida. Deve estar entre -90 e 90.' });
      }
    }

    const novoCaso = new Case({
      titulo,
      tipo,
      descricao,
      data,
      status,
      peritoResponsavel,
      localDoCaso,
      localizacao: localizacao ? {
        tipo: 'Point',
        coordenadas: localizacao.coordenadas,
        endereco: localizacao.endereco,
        complemento: localizacao.complemento,
        referencia: localizacao.referencia
      } : undefined,
      criadoPor: req.user.id
    });

    await novoCaso.save();

    // Registrar no histórico
    await Historico.create({
      acao: 'Caso criado',
      usuario: req.user.id,
      caso: novoCaso._id,
      detalhes: `Caso "${titulo}" foi criado.`
    });

    res.status(201).json({ 
      message: 'Caso criado com sucesso.', 
      caso: novoCaso 
    });
  } catch (error) {
    console.error('[ERRO] Criação de caso:', error);
    res.status(500).json({ message: 'Erro ao criar o caso.' });
  }
};

// Listar todos os casos
exports.getAllCases = async (req, res) => {
  try {
    const casos = await Case.find()
      .populate('peritoResponsavel', 'name email')
      .sort({ createdAt: -1 });
      
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

    const caso = await Case.findById(id)
      .populate('peritoResponsavel', 'name email');
      
    if (!caso) {
      return res.status(404).json({ message: 'Caso não encontrado.' });
    }

    res.status(200).json(caso);
  } catch (error) {
    console.error('[ERRO] Buscar caso por ID:', error);
    res.status(500).json({ message: 'Erro ao buscar o caso.' });
  }
};

// Atualizar caso
exports.updateCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      titulo, 
      tipo, 
      descricao, 
      data, 
      status, 
      peritoResponsavel, 
      localDoCaso,
      localizacao 
    } = req.body;

    // Validação de coordenadas se fornecidas
    if (localizacao && localizacao.coordenadas) {
      const [longitude, latitude] = localizacao.coordenadas;
      
      if (longitude < -180 || longitude > 180) {
        return res.status(400).json({ message: 'Longitude inválida. Deve estar entre -180 e 180.' });
      }
      
      if (latitude < -90 || latitude > 90) {
        return res.status(400).json({ message: 'Latitude inválida. Deve estar entre -90 e 90.' });
      }
    }

    const atualizacoes = {};

    if (titulo) atualizacoes.titulo = titulo;
    if (tipo) atualizacoes.tipo = tipo;
    if (descricao) atualizacoes.descricao = descricao;
    if (data) atualizacoes.data = data;
    if (status) atualizacoes.status = status;
    if (peritoResponsavel) atualizacoes.peritoResponsavel = peritoResponsavel;
    if (localDoCaso) atualizacoes.localDoCaso = localDoCaso;
    
    // Atualizar localização geográfica
    if (localizacao) {
      atualizacoes.localizacao = {
        tipo: 'Point',
        coordenadas: localizacao.coordenadas,
        endereco: localizacao.endereco,
        complemento: localizacao.complemento,
        referencia: localizacao.referencia
      };
    }

    const casoAtualizado = await Case.findByIdAndUpdate(id, atualizacoes, {
      new: true,
      runValidators: true
    }).populate('peritoResponsavel', 'name email');

    if (!casoAtualizado) {
      return res.status(404).json({ message: 'Caso não encontrado.' });
    }

    // Registrar no histórico
    await Historico.create({
      acao: 'Caso atualizado',
      usuario: req.user.id,
      caso: id,
      detalhes: `Caso "${casoAtualizado.titulo}" foi atualizado.`
    });

    res.status(200).json({ 
      message: 'Caso atualizado com sucesso.', 
      caso: casoAtualizado 
    });
  } catch (error) {
    console.error('[ERRO] Atualização de caso:', error);
    res.status(500).json({ message: 'Erro ao atualizar o caso.' });
  }
};

// Buscar casos por proximidade geográfica
exports.getCasesByLocation = async (req, res) => {
  try {
    const { longitude, latitude, distanceKm = 10 } = req.query;
    
    // Validar parâmetros
    if (!longitude || !latitude) {
      return res.status(400).json({ 
        message: 'Longitude e latitude são obrigatórios para busca por localização.' 
      });
    }
    
    // Converter para números
    const long = parseFloat(longitude);
    const lat = parseFloat(latitude);
    const distance = parseFloat(distanceKm);
    
    // Validar valores
    if (isNaN(long) || isNaN(lat) || isNaN(distance)) {
      return res.status(400).json({ 
        message: 'Valores de longitude, latitude ou distância inválidos.' 
      });
    }
    
    // Converter km para metros (usado pelo MongoDB)
    const distanceMeters = distance * 1000;
    
    // Buscar casos próximos utilizando geospatial query
    const casos = await Case.find({
      'localizacao.coordenadas': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [long, lat]
          },
          $maxDistance: distanceMeters
        }
      }
    }).populate('peritoResponsavel', 'name email');
    
    res.status(200).json(casos);
  } catch (error) {
    console.error('[ERRO] Busca por localização:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar casos por localização.', 
      error: error.message 
    });
  }
};

// Deletar caso
exports.deleteCase = async (req, res) => {
  try {
    const { id } = req.params;

    const casoDeletado = await Case.findByIdAndDelete(id);

    if (!casoDeletado) {
      return res.status(404).json({ message: 'Caso não encontrado.' });
    }

    // Registrar no histórico
    await Historico.create({
      acao: 'Caso deletado',
      usuario: req.user.id,
      caso: id,
      detalhes: `Caso "${casoDeletado.titulo}" foi removido.`
    });

    res.status(200).json({ message: 'Caso deletado com sucesso.' });
  } catch (error) {
    console.error('[ERRO] Exclusão de caso:', error);
    res.status(500).json({ message: 'Erro ao deletar o caso.' });
  }
};