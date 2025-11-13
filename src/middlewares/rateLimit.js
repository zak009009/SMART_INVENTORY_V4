const rateLimit = require('express-rate-limit');

// Limiteur pour les routes d'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requêtes par IP / 15min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Trop de tentatives de connexion, réessayez plus tard',
  },
});

// Limiteur global léger pour l'ensemble de l'API (optionnel)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requêtes par minute
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  apiLimiter,
};