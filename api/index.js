// Vercel serverless function entry point
const { connectToDatabase } = require('../src/config/database');
const config = require('../src/config/config');

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return;
  }
  
  try {
    await connectToDatabase(config.mongoUri);
    isConnected = true;
    console.log('✅ Database connected in serverless function');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

module.exports = async (req, res) => {
  try {
    // Ensure database connection
    await connectDB();
    
    // Import app after database connection
    const app = require('../src/app');
    
    // Handle the request
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error: ' + error.message
    });
  }
};
