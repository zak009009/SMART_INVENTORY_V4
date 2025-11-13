function errorHandler(err, req, res, next) {
  // Ne pas logger les erreurs en mode test
  if (process.env.NODE_ENV !== 'test') {
    console.error('Erreur non gérée:', err);
  }
  
  // Gérer les erreurs Mongoose
  if (err.name === 'CastError' || err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Données invalides'
    });
  }
  
  // Gérer les erreurs JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token invalide ou expiré'
    });
  }
  
  // Erreur par défaut
  res.status(err.statusCode || err.status || 500).json({
    status: 'error',
    message: err.message || 'Erreur interne du serveur'
  });
}

module.exports = errorHandler;
