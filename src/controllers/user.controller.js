const User = require('../models/user.model');
const cloudinary = require('../services/cloudinary');
const { hashPassword } = require('../utils/hashPassword');

// Criar um novo usuário (restrita a administradores)
exports.createUser = async (req, res) => {
  try {
    const { name, email, matricula, password, role } = req.body;
    
    // Validação básica
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Nome, email, senha e role são obrigatórios' });
    }
    
    // Verifica se o role é válido
    const validRoles = ['admin', 'perito', 'assistente'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Role inválido. Use: admin, perito ou assistente' });
    }
    
    // Verifica se o email já está em uso
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }
    
    // Criptografa a senha
    const hashedPassword = await hashPassword(password);
    
    // Cria o novo usuário
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      matricula,
      password: hashedPassword,
      role
    });
    
    await newUser.save();
    
    // Retorna os dados sem a senha
    const userResponse = {
      name,
      email,
      matricula,
      role
    };
    
    res.status(201).json({ message: 'Usuário criado com sucesso', user: userResponse });
  } catch (err) {
    console.error('[ERRO] Cadastro de usuário:', err);
    res.status(500).json({ message: 'Erro ao criar usuário', error: err.message });
  }
};

// Buscar todos os usuários (restrita a administradores)
exports.getAllUsers = async (req, res) => {
  try {
    // Remove senha da resposta (importantíssimo)
    const users = await User.find({}, '-password');
    res.status(200).json(users);
  } catch (err) {
    console.error('[ERRO] Listagem de usuários:', err);
    res.status(500).json({ message: 'Erro ao buscar usuários', error: err.message });
  }
};

// Buscar um usuário específico pelo ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Verifica se o usuário está tentando acessar informações de outro usuário sem ser admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('[ERRO] Busca de usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar usuário', error: error.message });
  }
};

// Atualizar um usuário (acessível pelo próprio usuário ou admin)
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, password, matricula, role } = req.body;
    
    // Verifica se o usuário existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Verifica permissões: apenas admins podem alterar roles ou dados de outros usuários
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    // Apenas admins podem alterar roles
    if (role && role !== user.role && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Apenas administradores podem alterar roles' });
    }
    
    // Verifica se o role é válido
    if (role) {
      const validRoles = ['admin', 'perito', 'assistente'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Role inválido. Use: admin, perito ou assistente' });
      }
    }
    
    // Verifica se o email já está em uso (por outro usuário)
    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'Email já está em uso' });
      }
    }
    
    // Atualiza os dados
    const updatedData = {};
    if (name) updatedData.name = name;
    if (email) updatedData.email = email.toLowerCase();
    if (matricula) updatedData.matricula = matricula;
    if (role) updatedData.role = role;
    
    // Atualiza a senha se necessário
    if (password) {
      updatedData.password = await hashPassword(password);
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      updatedData,
      { new: true, runValidators: true, select: '-password' }
    );
    
    res.status(200).json({ 
      message: 'Usuário atualizado com sucesso', 
      user: updatedUser 
    });
  } catch (error) {
    console.error('[ERRO] Atualização de usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário', error: error.message });
  }
};

// Deletar um usuário (restrita a administradores)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Verifica se o usuário existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Impede a exclusão do próprio usuário administrador que faz a requisição
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Não é possível excluir seu próprio usuário' });
    }
    
    const deletedUser = await User.findByIdAndDelete(userId);
    
    res.status(200).json({ message: 'Usuário deletado com sucesso' });
  } catch (err) {
    console.error('[ERRO] Exclusão de usuário:', err);
    res.status(500).json({ message: 'Erro ao deletar usuário', error: err.message });
  }
};
