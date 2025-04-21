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

module.exports = router;
