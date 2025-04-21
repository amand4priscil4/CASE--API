const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Função auxiliar para gerar token JWT

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('[LOGIN] Tentativa de login com:', email);

    // Verifica se o usuário existe
    const user = await User.findOne({ email });
    if (!user) {
      console.log('[ERRO] Usuário não encontrado.');
      return res.status(401).json({ message: 'Usuário não encontrado.' });
    }

    // Verifica se a senha é válida
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log('[ERRO] Senha inválida.');
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // Gera token JWT
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name, // Esse campo precisa existir no seu model
        perfil: user.role.toLowerCase() // ou user.perfil, dependendo do nome no schema
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    console.log('[LOGIN] Token gerado com sucesso');

    // Retorna o token para o frontend
    res.status(200).json({ token });
  } catch (err) {
    console.error('[LOGIN] Erro durante o login:', err);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
};
