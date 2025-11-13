const mongoose = require('mongoose');

async function connectToDatabase(uri) {
  if (!uri) {
    throw new Error('MONGO_URI est manquant (variable d’environnement non définie)');
  }


  await mongoose.connect(uri);
  console.log('Connexion à MongoDB établie');

 // ping de vérification de la connexion
  console.log('Base utilisée :', mongoose.connection.name);


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