const User = require('../models/user.model');
const cloudinary = require('../services/cloudinary');
const { hashPassword } = require('../utils/hashPassword');

// Função auxiliar para criar um novo usuário
exports.createUser = async (req, res) => {
  try {
    const { name, email, matricula, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Usuário já cadastrado.' });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      name,
      email,
      matricula,
      password: hashedPassword,
      role
    });

    await newUser.save();

    res.status(201).json({ message: 'Usuário criado com sucesso.' });
  } catch (err) {
    console.error('[ERRO] Cadastro de usuário:', err);
    res.status(500).json({ message: 'Erro ao criar usuário.' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    // Apenas admin pode ver todos os usuários
    if (req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ message: 'Acesso negado. Apenas administradores podem listar usuários.' });
    }

    // Remove senha da resposta (importantíssimo)
    const users = await User.find({}, '-password');
    res.status(200).json(users);
  } catch (err) {
    console.error('[ERRO] Listagem de usuários:', err);
    res.status(500).json({ message: 'Erro ao buscar usuários.' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, matricula, role } = req.body;

    const updatedData = {};
    if (name) updatedData.name = name;
    if (email) updatedData.email = email;
    if (matricula) updatedData.matricula = matricula;
    if (role) updatedData.role = role;
    if (password) updatedData.password = await hashPassword(password);

    const updatedUser = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.status(200).json({ message: 'Usuário atualizado com sucesso.', user: updatedUser });
  } catch (error) {
    console.error('[ERRO] Atualização de usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.status(200).json({ message: 'Usuário deletado com sucesso.' });
  } catch (err) {
    console.error('[ERRO] Exclusão de usuário:', err);
    res.status(500).json({ message: 'Erro ao deletar usuário.' });
  }
};
