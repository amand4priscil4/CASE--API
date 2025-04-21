//Aqui vamos gerar um hash seguro para a senha usando o bcrypt
const bcrypt = require('bcryptjs'); //exportando a biblioteca

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}
// Exporta a função para ser usada em outras partes da aplicação
module.exports = hashPassword;
