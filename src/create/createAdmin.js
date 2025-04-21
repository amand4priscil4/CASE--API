const User = require('../models/user.model');
const hashPassword = require('../utils/hashPassword');

/**
 * Cria automaticamente um usuário administrador padrão
 * caso nenhum usuário com a role 'admin' exista no sistema
 * Esse processo é executado no início aplicação
 */

module.exports = async function createInitialAdmin() {
  try {
    const adminExists = await User.findOne({ role: 'admin' }); // Verifica se já existe pelo menos um administrador cadastrado

    if (adminExists) {
      console.log('[✔] Usuário administrador já existente. Nenhuma ação necessária.');
      return;
    }

    const hashed = await hashPassword('admin123'); // Gera hash da senha padrão
    const admin = new User({
      // Cria novo usuário com perfil de administrador
      name: 'Administrador Master',
      email: 'admin@olin.com',
      matricula: 'ADM-0001',
      password: hashed,
      role: 'admin',
      active: true
    });

    await admin.save(); // Salva o usuário no banco de dados
    console.log('[INFO] Usuário administrador criado com sucesso.');
  } catch (err) {
    console.error('[ERRO] Falha ao criar administrador inicial:', err.message);
  }
};
