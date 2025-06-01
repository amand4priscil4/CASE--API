const LaudoOdontologico = require('../models/laudoOdontologico.model');
const Vitima = require('../models/vitima.model');
const Historico = require('../models/historico.model');
const fs = require('fs');
const path = require('path');

// Função para organizar odontograma por quadrantes
const organizarOdontogramaPorQuadrantes = (odontograma) => {
  const quadrantes = {
    superiorDireito: { nome: 'Superior Direito (1º Quadrante)', dentes: [] },
    superiorEsquerdo: { nome: 'Superior Esquerdo (2º Quadrante)', dentes: [] },
    inferiorEsquerdo: { nome: 'Inferior Esquerdo (3º Quadrante)', dentes: [] },
    inferiorDireito: { nome: 'Inferior Direito (4º Quadrante)', dentes: [] }
  };

  // Definir intervalos de dentes por quadrante
  const intervalos = {
    superiorDireito: { adulto: [18, 11], infantil: [55, 51] },
    superiorEsquerdo: { adulto: [21, 28], infantil: [61, 65] },
    inferiorEsquerdo: { adulto: [31, 38], infantil: [71, 75] },
    inferiorDireito: { adulto: [41, 48], infantil: [81, 85] }
  };

  const tipoOdontograma = odontograma.tipoOdontograma || 'adulto';

  // Organizar arcada superior
  if (odontograma.arcadaSuperior) {
    odontograma.arcadaSuperior.forEach(dente => {
      if (dente.condicoes && dente.condicoes.length > 0) {
        const numero = parseInt(dente.numero);
        const denteData = {
          numero: dente.numero,
          condicoes: dente.condicoes.map(c => ({
            tipo: c.tipo,
            descricao: c.descricao || '',
            faces: c.faces || []
          })),
          observacoes: dente.observacoes || ''
        };

        // Superior Direito
        const sdInterval = intervalos.superiorDireito[tipoOdontograma];
        if (numero >= sdInterval[1] && numero <= sdInterval[0]) {
          quadrantes.superiorDireito.dentes.push(denteData);
        }
        
        // Superior Esquerdo
        const seInterval = intervalos.superiorEsquerdo[tipoOdontograma];
        if (numero >= seInterval[0] && numero <= seInterval[1]) {
          quadrantes.superiorEsquerdo.dentes.push(denteData);
        }
      }
    });
  }

  // Organizar arcada inferior
  if (odontograma.arcadaInferior) {
    odontograma.arcadaInferior.forEach(dente => {
      if (dente.condicoes && dente.condicoes.length > 0) {
        const numero = parseInt(dente.numero);
        const denteData = {
          numero: dente.numero,
          condicoes: dente.condicoes.map(c => ({
            tipo: c.tipo,
            descricao: c.descricao || '',
            faces: c.faces || []
          })),
          observacoes: dente.observacoes || ''
        };

        // Inferior Esquerdo
        const ieInterval = intervalos.inferiorEsquerdo[tipoOdontograma];
        if (numero >= ieInterval[0] && numero <= ieInterval[1]) {
          quadrantes.inferiorEsquerdo.dentes.push(denteData);
        }
        
        // Inferior Direito
        const idInterval = intervalos.inferiorDireito[tipoOdontograma];
        if (numero >= idInterval[0] && numero <= idInterval[1]) {
          quadrantes.inferiorDireito.dentes.push(denteData);
        }
      }
    });
  }

  // Ordenar dentes dentro de cada quadrante
  Object.keys(quadrantes).forEach(key => {
    quadrantes[key].dentes.sort((a, b) => parseInt(a.numero) - parseInt(b.numero));
  });

  return quadrantes;
};

// Função para formatar o texto do laudo
const formatarTextoLaudo = (vitima, odontograma, observacoes, parecer) => {
  const quadrantes = organizarOdontogramaPorQuadrantes(odontograma);
  
  let textoLaudo = `LAUDO ODONTOLÓGICO

Dados da Vítima:
Nome: ${vitima.nome}
NIC: ${vitima.nic}
Gênero: ${vitima.genero}
Idade: ${vitima.idade} anos

DESCRIÇÃO DAS ALTERAÇÕES DENTÁRIAS

`;

  // Adicionar cada quadrante que tem alterações
  Object.keys(quadrantes).forEach(key => {
    const quadrante = quadrantes[key];
    if (quadrante.dentes.length > 0) {
      textoLaudo += `${quadrante.nome}:\n\n`;
      textoLaudo += `Dente\tCaracterística\t\t\tObservação\n`;
      textoLaudo += `─────────────────────────────────────────────────────────────\n`;
      
      quadrante.dentes.forEach(dente => {
        dente.condicoes.forEach((condicao, index) => {
          const denteNum = index === 0 ? dente.numero : '';
          const caracteristica = condicao.tipo.charAt(0).toUpperCase() + condicao.tipo.slice(1);
          const obs = index === 0 ? dente.observacoes : '';
          
          textoLaudo += `${denteNum}\t${caracteristica}\t\t\t${obs}\n`;
        });
      });
      textoLaudo += `\n`;
    }
  });

  // Adicionar observações gerais
  if (observacoes || odontograma.observacoesGerais) {
    textoLaudo += `OBSERVAÇÕES:\n`;
    textoLaudo += `${observacoes || odontograma.observacoesGerais}\n\n`;
  }

  // Adicionar parecer técnico
  textoLaudo += `PARECER TÉCNICO:\n`;
  textoLaudo += `${parecer}\n\n`;

  textoLaudo += `Data do Exame: ${new Date().toLocaleDateString('pt-BR')}\n`;
  
  return {
    textoCompleto: textoLaudo,
    quadrantesEstruturados: quadrantes
  };
};

// Criar laudo odontológico
exports.criarLaudoOdontologico = async (req, res) => {
  try {
    const { vitimaId } = req.params;
    const { observacoes, parecer, odontogramaSnapshot } = req.body;
    const peritoId = req.user.id;

    // Verificar se a vítima existe
    const vitima = await Vitima.findById(vitimaId).populate('caso', 'titulo');
    if (!vitima) {
      return res.status(404).json({ message: 'Vítima não encontrada.' });
    }

    // Validar se o usuário é um perito odontológico
    if (req.user.role !== 'perito' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Apenas peritos odontológicos podem emitir laudos odontológicos.' 
      });
    }

    // Validar parecer obrigatório
    if (!parecer || parecer.trim() === '') {
      return res.status(400).json({ message: 'O parecer técnico é obrigatório.' });
    }

    // Obter odontograma atual se não foi fornecido snapshot
    let odontogramaParaLaudo = odontogramaSnapshot;
    if (!odontogramaParaLaudo) {
      // Buscar odontograma atual da vítima
      odontogramaParaLaudo = vitima.odontograma;
    }

    // Formatar o texto do laudo
    const laudoFormatado = formatarTextoLaudo(vitima, odontogramaParaLaudo, observacoes, parecer);

    // Criar o laudo
    const novoLaudo = new LaudoOdontologico({
      vitima: vitimaId,
      perito: peritoId,
      caso: vitima.caso._id,
      observacoes: observacoes || '',
      parecer,
      textoCompleto: laudoFormatado.textoCompleto,
      quadrantesEstruturados: laudoFormatado.quadrantesEstruturados,
      odontogramaSnapshot: odontogramaParaLaudo,
      tipoOdontograma: odontogramaParaLaudo.tipoOdontograma || 'adulto'
    });

    await novoLaudo.save();

    // Registrar no histórico
    await Historico.create({
      acao: 'Laudo odontológico emitido',
      usuario: peritoId,
      caso: vitima.caso._id,
      detalhes: `Laudo odontológico emitido para a vítima ${vitima.nome}.`
    });

    res.status(201).json({
      message: 'Laudo odontológico criado com sucesso.',
      laudo: novoLaudo
    });
  } catch (error) {
    console.error('[ERRO] Criação de laudo odontológico:', error);
    res.status(500).json({ message: 'Erro ao criar laudo odontológico.', error: error.message });
  }
};

// Listar laudos odontológicos de uma vítima
exports.listarLaudosOdontologicos = async (req, res) => {
  try {
    const { vitimaId } = req.params;

    const laudos = await LaudoOdontologico.find({ vitima: vitimaId })
      .populate('perito', 'name email')
      .populate('vitima', 'nome nic')
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
      .populate('vitima', 'nome nic genero idade documento endereco')
      .populate('perito', 'name email')
      .populate('caso', 'titulo');

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
    const laudo = await LaudoOdontologico.findById(laudoId).populate('vitima');
    if (!laudo) {
      return res.status(404).json({ message: 'Laudo odontológico não encontrado.' });
    }

    // Verificar se o usuário é o perito que criou o laudo ou um admin
    if (laudo.perito.toString() !== peritoId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Apenas o perito que emitiu o laudo ou um administrador pode atualizá-lo.' 
      });
    }

    // Validar parecer obrigatório
    if (!parecer || parecer.trim() === '') {
      return res.status(400).json({ message: 'O parecer técnico é obrigatório.' });
    }

    // Regenerar texto do laudo com as novas informações
    const laudoFormatado = formatarTextoLaudo(
      laudo.vitima, 
      laudo.odontogramaSnapshot, 
      observacoes, 
      parecer
    );

    // Atualizar os campos
    laudo.observacoes = observacoes || '';
    laudo.parecer = parecer;
    laudo.textoCompleto = laudoFormatado.textoCompleto;
    laudo.quadrantesEstruturados = laudoFormatado.quadrantesEstruturados;
    
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

// Exportar laudo em formato texto estruturado
exports.exportarLaudoTexto = async (req, res) => {
  try {
    const { laudoId } = req.params;

    const laudo = await LaudoOdontologico.findById(laudoId)
      .populate('vitima', 'nome nic genero idade')
      .populate('perito', 'name email');

    if (!laudo) {
      return res.status(404).json({ message: 'Laudo odontológico não encontrado.' });
    }

    // Definir cabeçalhos para download
    res.setHeader('Content-Disposition', `attachment; filename="laudo_${laudo._id}.txt"`);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');

    // Enviar o texto do laudo
    res.send(laudo.textoCompleto);
  } catch (error) {
    console.error('[ERRO] Exportar laudo texto:', error);
    res.status(500).json({ message: 'Erro ao exportar laudo em texto.' });
  }
};