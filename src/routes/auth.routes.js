const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');

// Rota de login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }

  try {
    console.log('Tentativa de login para o email:', email); // Log do email

    const user = await User.findOne({ email });
    console.log('Usuário encontrado:', user); // Log do usuário encontrado

    if (!user) {
      console.log('Usuário não encontrado.');
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Senha corresponde:', isMatch); // Log da comparação da senha

    if (!isMatch) {
      console.log('Senha incorreta.');
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'sua-chave-secreta',
      { expiresIn: '1h' }
    );

    console.log('Token gerado:', token); // Log do token gerado

    res.status(200).json({ token, user: { id: user._id, email: user.email, role: user.role } });
    console.log('Login bem-sucedido!'); // Log de sucesso

  } catch (error) {
    console.error('Erro na rota /login:', error); // Log do erro completo
    res.status(500).json({ message: 'Erro ao fazer login', error: error.message }); // Enviar a mensagem de erro detalhada
  }
});

module.exports = router;

