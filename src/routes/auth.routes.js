const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');

// Rota de login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Verificar se o email e a senha foram fornecidos
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }

  try {
    console.log('Tentativa de login para o email:', email); // Log do email

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Comparar a senha fornecida com a senha armazenada (hash)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Gerar o token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'sua-chave-secreta',
      { expiresIn: '1h' } // Token expira em 1 hora
    );

    console.log('Token gerado:', token); // Log do token gerado

    res.status(200).json({ token, user: { id: user._id, email: user.email, role: user.role } });
    console.log('Login bem-sucedido!'); // Log de sucesso

  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer login', error });
  }
});

<<<<<<< HEAD
module.exports = router;
=======
module.exports = router;
>>>>>>> 9eeebffc900873ddd312a338d0d87724b0611b6c
