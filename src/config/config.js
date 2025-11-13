require("dotenv").config();

// Centraliser la configuration dans un objet exporté
const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },
  logLevel: process.env.LOG_LEVEL || "info",
};

module.exports = config;
