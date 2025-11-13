const mongoose = require('mongoose');

async function connectToDatabase(uri) {
  if (!uri) {
    throw new Error('MONGO_URI est manquant (variable d environnement non definie)');
  }

  let retries = 5;
  
  while (retries > 0) {
    try {
      console.log(`🔄 Tentative de connexion à MongoDB... (${6 - retries}/5)`);
      
      // Simple connection - wait until connected or fail
      await mongoose.connect(uri);
      
      // Wait for the connection to be ready
      while (mongoose.connection.readyState !== 1) {
        console.log('⏳ Attente de la connexion...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log('✅ Connexion à MongoDB établie');
      console.log('📊 Base utilisée :', mongoose.connection.name);
      
      return mongoose.connection;
      
    } catch (error) {
      retries--;
      console.error(`❌ Échec de connexion: ${error.message}`);
      
      if (retries === 0) {
        throw new Error(`Impossible de se connecter à MongoDB après 5 tentatives: ${error.message}`);
      }
      
      console.log(`🔄 Nouvelle tentative dans 3 secondes... (${retries} tentatives restantes)`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

module.exports = {
  connectToDatabase,
};