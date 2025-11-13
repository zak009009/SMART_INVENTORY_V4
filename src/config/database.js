const mongoose = require('mongoose');

async function connectToDatabase(uri) {
  if (!uri) {
    throw new Error('MONGO_URI est manquant (variable d’environnement non définie)');
  }

  const options = {
    // Connection timeout settings
    serverSelectionTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000, // 45 seconds
    connectTimeoutMS: 30000, // 30 seconds
    
    // Connection pool settings
    maxPoolSize: 10,
    minPoolSize: 1,
    
    // Retry settings
    retryWrites: true,
    
    // Heartbeat settings
    heartbeatFrequencyMS: 10000
  };

  try {
    await mongoose.connect(uri, options);
    console.log('Connexion à MongoDB établie');
    
    // Verify connection with a ping
    await mongoose.connection.db.admin().ping();
    console.log('Base utilisée :', mongoose.connection.name);
    console.log('✅ Connexion MongoDB vérifiée avec succès');
    
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    throw error;
  }


  mongoose.connection.on('error', (err) => {
    console.error('Erreur de connexion MongoDB :', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('Connexion à MongoDB perdue');
  });

  return mongoose.connection;
}

module.exports = {
  connectToDatabase,
};