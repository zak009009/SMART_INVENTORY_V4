// Serverless function for products API
const { connectToDatabase } = require('../src/config/database');
const config = require('../src/config/config');
const Product = require('../src/models/product.model');

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return;
  }
  
  try {
    await connectToDatabase(config.mongoUri);
    isConnected = true;
    console.log('✅ Database connected for products API');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Ensure database connection
    await connectDB();
    
    if (req.method === 'GET') {
      const products = await Product.find({}).limit(50);
      return res.status(200).json({
        status: 'success',
        data: products,
        count: products.length
      });
    }
    
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed'
    });
    
  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Database error: ' + error.message
    });
  }
};
