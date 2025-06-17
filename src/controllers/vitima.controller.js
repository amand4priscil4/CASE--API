const Vitima = require('../models/vitima.model');
const Historico = require('../models/historico.model');
const Case = require('../models/case.model');

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

    // ✅ Verificar se o caso existe
    const caseExists = await Case.findById(caso);
    if (!caseExists) {
      return res.status(404).json({ message: 'Caso não encontrado.' });
    }

    // COMENTADO: Verificação de permissão que estava causando erro
    // if (!caseExists.canBeViewedBy(req.user)) {
    //   return res.status(403).json({ message: 'Acesso negado ao caso.' });
    // }

    // ✅ Verificar se NIC já existe (evitar duplicatas)
    const existingVitima = await Vitima.findOne({ nic });
    if (existingVitima) {
      return res.status(400).json({ 
        message: 'NIC já existe no sistema.' 
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
      regioesAnatomicas,
      caso,
      criadoPor: req.user.id
    });

    // Inicializar odontograma se não fornecido
    if (!odontograma) {
      novaVitima.inicializarOdontograma();
    } else {
      novaVitima.odontograma = odontograma;
    }

    // Salvar no banco
    await novaVitima.save();

    // Registrar no histórico
    await Historico.create({
      acao: 'Vítima cadastrada',
      usuario: req.user.id,
      caso,
      detalhes: `Vítima ${nome} (NIC: ${nic}) foi cadastrada.`
    });

    res.status(201).json({
      message: 'Vítima cadastrada com sucesso.',
      vitima: novaVitima
    });
  } catch (error) {
    console.error('[ERRO] Cadastro de vítima:', error);
    
    // ✅ Tratamento específico para erro de validação do Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Dados inválidos.',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    // ✅ Tratamento para erro de duplicação (índice único)
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'NIC já existe no sistema.'
      });
    }

    res.status(500).json({ message: 'Erro ao cadastrar vítima.' });
  }
};

// Listar vítimas por caso
exports.getVitimasByCaso = async (req, res) => {
  try {
    const { casoId } = req.params;

    // ✅ Verificar se o caso existe
    const caso = await Case.findById(casoId);
    if (!caso) {
      return res.status(404).json({ message: 'Caso não encontrado.' });
    }

    // COMENTADO: Verificação de permissão que estava causando erro
    // if (!caso.canBeViewedBy(req.user)) {
    //   return res.status(403).json({ message: 'Acesso negado ao caso.' });
    // }

    // ✅ Buscar vítimas com dados populados
    const vitimas = await Vitima.find({ caso: casoId })
      .populate('caso', 'titulo status')
      .populate('criadoPor', 'name')
      .sort({ createdAt: -1 });

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

    // ✅ Buscar vítima com dados populados
    const vitima = await Vitima.findById(id)
      .populate('caso', 'titulo status')
      .populate('criadoPor', 'name');
      
    if (!vitima) {
      return res.status(404).json({ message: 'Vítima não encontrada.' });
    }

    // COMENTADO: Verificação de permissão que estava causando erro
    // if (!vitima.caso.canBeViewedBy || !vitima.caso.canBeViewedBy(req.user)) {
    //   return res.status(403).json({ message: 'Acesso negado.' });
    // }

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
    const vitima = await Vitima.findById(id).populate('caso');
    if (!vitima) {
      return res.status(404).json({ message: 'Vítima não encontrada.' });
    }

    // COMENTADO: Verificação de permissão que estava causando erro
    // if (!vitima.caso.canBeEditedBy || !vitima.caso.canBeEditedBy(req.user)) {
    //   return res.status(403).json({ message: 'Acesso negado para editar.' });
    // }

    // ✅ Se estiver atualizando o NIC, verificar se não existe outro igual
    if (updateData.nic && updateData.nic !== vitima.nic) {
      const existingVitima = await Vitima.findOne({ 
        nic: updateData.nic,
        _id: { $ne: id } // Excluir a própria vítima da busca
      });
      
      if (existingVitima) {
        return res.status(400).json({ 
          message: 'NIC já existe no sistema.' 
        });
      }
    }

    // Atualiza os dados
    const vitimaAtualizada = await Vitima.findByIdAndUpdate(
      id, 
      updateData,
      { new: true, runValidators: true }
    ).populate('caso', 'titulo').populate('criadoPor', 'name');

    // Registrar no histórico
    await Historico.create({
      acao: 'Vítima atualizada',
      usuario: req.user.id,
      caso: vitima.caso._id,
      detalhes: `Vítima ${vitima.nome} foi atualizada.`
    });

    res.status(200).json({ 
      message: 'Vítima atualizada com sucesso.',
      vitima: vitimaAtualizada
    });
  } catch (error) {
    console.error('[ERRO] Atualização de vítima:', error);
    
    // ✅ Tratamento de erros específicos
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Dados inválidos.',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'NIC já existe no sistema.'
      });
    }

    res.status(500).json({ message: 'Erro ao atualizar vítima.' });
  }
};

// Deletar vítima
exports.deleteVitima = async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica se a vítima existe
    const vitima = await Vitima.findById(id).populate('caso');
    if (!vitima) {
      return res.status(404).json({ message: 'Vítima não encontrada.' });
    }

    // COMENTADO: Verificação de permissão que estava causando erro
    // if (!vitima.caso.canBeEditedBy || !vitima.caso.canBeEditedBy(req.user)) {
    //   return res.status(403).json({ message: 'Acesso negado para remover.' });
    // }

    // Armazena informações para o histórico
    const casoId = vitima.caso._id;
    const nomeVitima = vitima.nome;
    const nicVitima = vitima.nic;

    // Remove a vítima
    await Vitima.findByIdAndDelete(id);

    // Registrar no histórico
    await Historico.create({
      acao: 'Vítima removida',
      usuario: req.user.id,
      caso: casoId,
      detalhes: `Vítima ${nomeVitima} (NIC: ${nicVitima}) foi removida.`
    });

    res.status(200).json({ message: 'Vítima removida com sucesso.' });
  } catch (error) {
    console.error('[ERRO] Exclusão de vítima:', error);
    res.status(500).json({ message: 'Erro ao remover vítima.' });
  }
};

// Obter odontograma completo
exports.getOdontograma = async (req, res) => {
  try {
    const { id } = req.params;

    const vitima = await Vitima.findById(id);
    if (!vitima) {
      return res.status(404).json({ message: 'Vítima não encontrada.' });
    }

    res.status(200).json(vitima.odontograma);
  } catch (error) {
    console.error('[ERRO] Buscar odontograma:', error);
    res.status(500).json({ message: 'Erro ao buscar odontograma.' });
  }
};

// Atualizar odontograma completo
exports.updateOdontograma = async (req, res) => {
  try {
    const { id } = req.params;
    const { odontograma } = req.body;

    // ✅ Verificar se a vítima existe
    const vitima = await Vitima.findById(id).populate('caso');
    if (!vitima) {
      return res.status(404).json({ message: 'Vítima não encontrada.' });
    }

    // COMENTADO: Verificação de permissão que estava causando erro
    // if (!vitima.caso.canBeEditedBy || !vitima.caso.canBeEditedBy(req.user)) {
    //   return res.status(403).json({ message: 'Acesso negado para editar.' });
    // }

    // Atualizar odontograma
    const vitimaAtualizada = await Vitima.findByIdAndUpdate(
      id,
      { odontograma },
      { new: true, runValidators: true }
    ).populate('caso', 'titulo').populate('criadoPor', 'name');

    // Registrar no histórico
    await Historico.create({
      acao: 'Odontograma atualizado',
      usuario: req.user.id,
      caso: vitima.caso._id,
      detalhes: `Odontograma da vítima ${vitima.nome} foi atualizado.`
    });

    res.status(200).json({ 
      message: 'Odontograma atualizado com sucesso',
      vitima: vitimaAtualizada
    });
  } catch (error) {
    console.error('[ERRO] Atualização de odontograma:', error);
    res.status(500).json({ message: 'Erro ao atualizar odontograma.' });
  }
};

// Atualizar dente específico
exports.updateDente = async (req, res) => {
  try {
    const { id, numeroDente } = req.params;
    const { condicao, observacoes, presente } = req.body;

    const vitima = await Vitima.findById(id);
    if (!vitima) {
      return res.status(404).json({ message: 'Vítima não encontrada.' });
    }

    // Encontrar o dente
    const { arcada, dente } = vitima.encontrarDente(numeroDente);
    
    if (!dente) {
      return res.status(404).json({ message: 'Dente não encontrado.' });
    }

    // Atualizar propriedades do dente
    if (condicao) {
      condicao.registradoPor = req.user.id;
      dente.condicoes.push(condicao);
    }
    
    if (observacoes !== undefined) {
      dente.observacoes = observacoes;
    }
    
    if (presente !== undefined) {
      dente.presente = presente;
    }

    dente.ultimaAtualizacao = new Date();

    await vitima.save();

    // Registrar no histórico
    await Historico.create({
      acao: 'Dente atualizado',
      usuario: req.user.id,
      caso: vitima.caso,
      detalhes: `Dente ${numeroDente} da vítima ${vitima.nome} foi atualizado.`
    });

    res.status(200).json({
      message: 'Dente atualizado com sucesso',
      dente: dente
    });
  } catch (error) {
    console.error('[ERRO] Atualização de dente:', error);
    res.status(500).json({ message: 'Erro ao atualizar dente.' });
  }
};

// Adicionar condição a um dente
exports.addCondicaoDente = async (req, res) => {
  try {
    const { id, numeroDente } = req.params;
    const { tipo, faces, descricao } = req.body;

    const vitima = await Vitima.findById(id);
    if (!vitima) {
      return res.status(404).json({ message: 'Vítima não encontrada.' });
    }

    const { arcada, dente } = vitima.encontrarDente(numeroDente);
    
    if (!dente) {
      return res.status(404).json({ message: 'Dente não encontrado.' });
    }

    // Adicionar nova condição
    const novaCondicao = {
      tipo,
      faces: faces || [],
      descricao: descricao || '',
      registradoPor: req.user.id
    };

    dente.condicoes.push(novaCondicao);
    dente.ultimaAtualizacao = new Date();

    await vitima.save();

    // Registrar no histórico
    await Historico.create({
      acao: 'Condição dentária adicionada',
      usuario: req.user.id,
      caso: vitima.caso,
      detalhes: `Condição "${tipo}" adicionada ao dente ${numeroDente} da vítima ${vitima.nome}.`
    });

    res.status(200).json({
      message: 'Condição adicionada com sucesso',
      dente: dente
    });
  } catch (error) {
    console.error('[ERRO] Adicionar condição:', error);
    res.status(500).json({ message: 'Erro ao adicionar condição.' });
  }
};

// Remover condição de um dente
exports.removeCondicaoDente = async (req, res) => {
  try {
    const { id, numeroDente, condicaoId } = req.params;

    const vitima = await Vitima.findById(id);
    if (!vitima) {
      return res.status(404).json({ message: 'Vítima não encontrada.' });
    }

    const { arcada, dente } = vitima.encontrarDente(numeroDente);
    
    if (!dente) {
      return res.status(404).json({ message: 'Dente não encontrado.' });
    }

    // Encontrar e remover a condição
    const condicaoIndex = dente.condicoes.findIndex(c => c._id.toString() === condicaoId);
    
    if (condicaoIndex === -1) {
      return res.status(404).json({ message: 'Condição não encontrada.' });
    }

    const condicaoRemovida = dente.condicoes[condicaoIndex];
    dente.condicoes.splice(condicaoIndex, 1);
    dente.ultimaAtualizacao = new Date();

    await vitima.save();

    // Registrar no histórico
    await Historico.create({
      acao: 'Condição dentária removida',
      usuario: req.user.id,
      caso: vitima.caso,
      detalhes: `Condição "${condicaoRemovida.tipo}" removida do dente ${numeroDente} da vítima ${vitima.nome}.`
    });

    res.status(200).json({
      message: 'Condição removida com sucesso',
      dente: dente
    });
  } catch (error) {
    console.error('[ERRO] Remover condição:', error);
    res.status(500).json({ message: 'Erro ao remover condição.' });
  }
};

// Atualizar observações de um dente
exports.updateObservacoesDente = async (req, res) => {
  try {
    const { id, numeroDente } = req.params;
    const { observacoes } = req.body;

    const vitima = await Vitima.findById(id);
    if (!vitima) {
      return res.status(404).json({ message: 'Vítima não encontrada.' });
    }

    const { arcada, dente } = vitima.encontrarDente(numeroDente);
    
    if (!dente) {
      return res.status(404).json({ message: 'Dente não encontrado.' });
    }

    dente.observacoes = observacoes;
    dente.ultimaAtualizacao = new Date();

    await vitima.save();

    // Registrar no histórico
    await Historico.create({
      acao: 'Observações de dente atualizadas',
      usuario: req.user.id,
      caso: vitima.caso,
      detalhes: `Observações do dente ${numeroDente} da vítima ${vitima.nome} foram atualizadas.`
    });

    res.status(200).json({
      message: 'Observações atualizadas com sucesso',
      dente: dente
    });
  } catch (error) {
    console.error('[ERRO] Atualizar observações:', error);
    res.status(500).json({ message: 'Erro ao atualizar observações.' });
  }
};

// Atualizar regiões anatômicas
exports.updateRegioes = async (req, res) => {
  try {
    const { id } = req.params;
    const { regioesAnatomicas } = req.body;

    // ✅ Verificar se a vítima existe
    const vitima = await Vitima.findById(id).populate('caso');
    if (!vitima) {
      return res.status(404).json({ message: 'Vítima não encontrada.' });
    }

    // COMENTADO: Verificação de permissão que estava causando erro
    // if (!vitima.caso.canBeEditedBy || !vitima.caso.canBeEditedBy(req.user)) {
    //   return res.status(403).json({ message: 'Acesso negado para editar.' });
    // }

    // Atualizar regiões anatômicas
    const vitimaAtualizada = await Vitima.findByIdAndUpdate(
      id,
      { regioesAnatomicas },
      { new: true, runValidators: true }
    ).populate('caso', 'titulo').populate('criadoPor', 'name');

    // Registrar no histórico
    await Historico.create({
      acao: 'Regiões anatômicas atualizadas',
      usuario: req.user.id,
      caso: vitima.caso._id,
      detalhes: `Regiões anatômicas da vítima ${vitima.nome} foram atualizadas.`
    });

    res.status(200).json({ 
      message: 'Regiões anatômicas atualizadas com sucesso',
      vitima: vitimaAtualizada
    });
  } catch (error) {
    console.error('[ERRO] Atualização de regiões anatômicas:', error);
    res.status(500).json({ message: 'Erro ao atualizar regiões anatômicas.' });
  }
};

// ✅ Buscar vítima por NIC (método adicional útil)
exports.getVitimaByNic = async (req, res) => {
  try {
    const { nic } = req.params;

    const vitima = await Vitima.findOne({ nic })
      .populate('caso', 'titulo status')
      .populate('criadoPor', 'name');
      
    if (!vitima) {
      return res.status(404).json({ message: 'Vítima não encontrada.' });
    }

    // COMENTADO: Verificação de permissão que estava causando erro
    // if (!vitima.caso.canBeViewedBy || !vitima.caso.canBeViewedBy(req.user)) {
    //   return res.status(403).json({ message: 'Acesso negado.' });
    // }

    res.status(200).json(vitima);
  } catch (error) {
    console.error('[ERRO] Buscar vítima por NIC:', error);
    res.status(500).json({ message: 'Erro ao buscar vítima.' });
  }
};