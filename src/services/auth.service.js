const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

function generateToken(user) {
  // On ne met que le minimum d'informations dans le token
  const payload = {
    sub: user._id.toString(), // "subject" du token : l'identité principale
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

async function register({ email, password, role = 'user' }) {
  // Vérifier si l'email est déjà utilisé
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('Cet email est déjà enregistré');
    error.status = 400;
    throw error;
  }

  // Hasher le mot de passe (paramétrable via variable d'environnement pour les tests)
  const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Créer l'utilisateur
  const user = await User.create({
    email,
    passwordHash,
    role,
  });

  // On peut décider de générer un token automatiquement après inscription
  const token = generateToken(user);

  // On retourne les infos non sensibles + le token
  return {
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    token,
  };
}

async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Identifiants invalides');
    error.status = 401;
    throw error;
  }

  // Vérifier le mot de passe
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    const error = new Error('Identifiants invalides');
    error.status = 401;
    throw error;
  }

  const token = generateToken(user);

  return {
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    token,
  };
}

module.exports = {
  register,
  login,
};