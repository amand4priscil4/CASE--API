const User = require('../models/user.model');
const { hashPassword } = require('../utils/hashPassword');

// Função para criar o administrador ao iniciar o sistem
const createAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@olin.com' });
    if (adminExists) {
      console.log('Administrador já existe');
      return;
    }

    const hashedPassword = await hashPassword('admin123'); // Usa a função utilitária
    const admin = new User({
      name: 'Administrador',
      email: 'admin@olin.com',
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('Administrador criado com sucesso');
  } catch (error) {
    console.error('Erro ao criar administrador:', error);
  }
};

// Executa a função ao iniciar
createAdmin();

module.exports = createAdmin;
