module.exports = rolesPermitidos => {
  return (req, res, next) => {
    const userRole = req.user.role.toLowerCase(); // Ajustado para usar "role"
    const roles = rolesPermitidos.map(r => r.toLowerCase());

    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: 'Acesso negado. Usuário não tem permissão' });
    }

    next();
  };
};
