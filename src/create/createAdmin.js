const bcrypt = require('bcrypt');
const User = require('../models/user.model');

async function createAdmin() {
  try {
    // Verifica se já existe um admin
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = new User({
        name: 'Administrador',
        email: 'admin@sistema.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      await admin.save();
      console.log('Usuário administrador criado com sucesso!');
      console.log('Email: admin@sistema.com');
      console.log('Senha: admin123');
    } else {
      console.log('Usuário administrador já existe.');
    }
  } catch (error) {
    console.error('Erro ao criar administrador:', error);
  }
}

// Executa a função quando o módulo é carregado
createAdmin();

module.exports = createAdmin;