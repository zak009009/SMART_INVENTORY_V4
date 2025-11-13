// Load test environment configuration
require('dotenv').config({ path: '.env.test' });

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key';
process.env.SALT_ROUNDS = process.env.SALT_ROUNDS || '1';

console.log('🧪 Test Environment Loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  MONGO_URI: process.env.MONGO_URI,
  PORT: process.env.PORT
});

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;
let usingMemoryServer = false;
const LIGHT = process.env.LIGHT_TESTS === '1';

beforeAll(async () => {
  if (LIGHT) {
    return;
  }
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    const localUri = process.env.TEST_MONGO_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_inventory_test';
    try {
      await mongoose.connect(localUri, { serverSelectionTimeoutMS: 1500 });
      console.log('✅ Connexion à MongoDB locale pour les tests:', localUri);
    } catch (err) {
      console.warn('⚠️ MongoDB locale non disponible, démarrage du serveur en mémoire...');
      usingMemoryServer = true;
      mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      await mongoose.connect(memoryUri, { serverSelectionTimeoutMS: 5000 });
      console.log('✅ Connexion au serveur MongoDB en mémoire établie');
    }
  } catch (error) {
    console.error('❌ Échec de la connexion à la base de données de test:', error);
    throw error;
  }
});

afterAll(async () => {
  if (LIGHT) return;
  try {
    // Clean up and close connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    if (usingMemoryServer && mongoServer) {
      await mongoServer.stop();
    }
      console.log('✅ Nettoyage de la base de données de test terminé');
  } catch (error) {
    console.error('❌ Échec du nettoyage des tests:', error);
  }
});

afterEach(async () => {
  if (LIGHT) return;
  try {
    if (mongoose.connection.readyState === 1) {
      const collections = mongoose.connection.collections;
      // Nettoyer toutes les collections sauf users (pour préserver les tokens)
      for (const key in collections) {
        if (key !== 'users') {
          await collections[key].deleteMany({});
        }
      }
    }
  } catch (error) {
    console.error('❌ Échec du nettoyage des données de test:', error);
  }
});

jest.setTimeout(20000);
