module.exports = function roleCheck(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Неautenticirani' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Нямате права за тази операция' });
    }
    next();
  };
};
