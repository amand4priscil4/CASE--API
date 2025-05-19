const User = require('../models/user.model');
const { hashPassword } = require('../utils/hashPassword');

<<<<<<< HEAD
/**
 * Cria automaticamente um usuário administrador padrão
 * caso nenhum usuário com a role 'admin' exista no sistema.
 * Esse processo é executado no início aplicação.
 */

module.exports = async function createInitialAdmin() {
=======
// Função para criar o administrador ao iniciar o sistem
const createAdmin = async () => {
>>>>>>> c8eacf05725f2797d0e85f77e114a1ebbba5fba5
  try {
    const adminExists = await User.findOne({ email: 'admin@olin.com' });
    if (adminExists) {
      console.log('Administrador já existe');
      return;
    }

    const hashedPassword = await hashPassword('admin123'); // Usa a função utilitária
    const admin = new User({
<<<<<<< HEAD
      // Cria novo usuário com perfil de administrador
      name: 'Administrador Master',
      email: 'admin@case.com',
      matricula: 'ADM-0001',
      password: hashed,
      role: 'admin',
      active: true
=======
      name: 'Administrador',
      email: 'admin@olin.com',
      password: hashedPassword,
      role: 'admin'
>>>>>>> c8eacf05725f2797d0e85f77e114a1ebbba5fba5
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
