const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const authMiddleware = require('../middlewares/auth.middleware');
const roleCheckMiddleware = require('../middlewares/roleCheck.middleware');

// Rota para cadastrar um novo usuário (restrita a administradores)
router.post('/', authMiddleware, roleCheckMiddleware(['admin']), async (req, res) => {
  const { name, email, password, role } = req.body;
  // Validação básica
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Nome, email, senha e role são obrigatórios' });
  }
  // Verifica se o role é válido
  const validRoles = ['admin', 'perito', 'assistente'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Role inválido. Use: admin, perito ou assistente' });
  }
  try {
    // Verifica se o email já está em uso
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }
    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);
    // Cria o novo usuário
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role
    });
    await newUser.save();
    res.status(201).json({ message: 'Usuário criado com sucesso', user: { name, email, role } });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
  }
});

// Rota para obter todos os usuários (restrita a administradores)
router.get('/', authMiddleware, roleCheckMiddleware(['admin']), async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclui o campo password na resposta
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários', error: error.message });
  }
});

// Rota para obter um usuário específico pelo ID
router.get('/:id', authMiddleware, async (req, res) => {
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
    res.status(500).json({ message: 'Erro ao buscar usuário', error: error.message });
  }
});

// Rota para atualizar um usuário (acessível pelo próprio usuário ou admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, password, role } = req.body;
    
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
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (role) updateData.role = role;
    
    // Atualiza a senha se necessário
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      updateData,
      { new: true, select: '-password' }
    );
    
    res.status(200).json({ 
      message: 'Usuário atualizado com sucesso', 
      user: updatedUser 
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar usuário', error: error.message });
  }
});

// Rota para deletar um usuário (restrita a administradores)
router.delete('/:id', authMiddleware, roleCheckMiddleware(['admin']), async (req, res) => {
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
    
    await User.findByIdAndDelete(userId);
    
    res.status(200).json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar usuário', error: error.message });
  }
});

module.exports = router;
