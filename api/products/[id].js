// Serverless function for individual product operations (GET, PUT, DELETE)
const { connectToDatabase } = require('../../src/config/database');
const config = require('../../src/config/config');
const Product = require('../../src/models/product.model');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user.model');
const Joi = require('joi');

// Product validation schema for updates
const updateSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  sku: Joi.string().pattern(/^[A-Za-z0-9\-_]+$/).min(3).max(20).optional(),
  price: Joi.number().positive().precision(2).optional(),
  category: Joi.string().min(3).max(100).optional(),
  stock: Joi.number().integer().min(0).optional(),
  inStock: Joi.boolean().optional(),
  description: Joi.string().max(500).optional()
});

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return;
  }
  
  try {
    await connectToDatabase(config.mongoUri);
    isConnected = true;
    console.log('✅ Database connected for product [id] API');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

async function authenticateAdmin(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw { status: 401, message: 'Token manquant ou mal formé' };
  }

  const token = authHeader.split(' ')[1];
  let payload;
  
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET || 'test_jwt_secret_key');
  } catch (err) {
    throw { status: 401, message: 'Token invalide ou expiré' };
  }

  const user = await User.findById(payload.sub);
  if (!user || user.role !== 'admin') {
    throw { status: 403, message: 'Accès refusé - Admin requis' };
  }

  return user;
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();
    
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'ID du produit requis'
      });
    }

    if (req.method === 'GET') {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Produit non trouvé'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: product
      });
    }

    if (req.method === 'PUT') {
      try {
        await authenticateAdmin(req);
      } catch (authError) {
        return res.status(authError.status).json({
          status: 'error',
          message: authError.message
        });
      }

      // Validate request body
      const { error, value } = updateSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message
        });
      }

      // Check if product exists
      const existingProduct = await Product.findById(id);
      if (!existingProduct) {
        return res.status(404).json({
          status: 'error',
          message: 'Produit non trouvé'
        });
      }

      // If updating SKU, check uniqueness
      if (value.sku && value.sku !== existingProduct.sku) {
        const skuExists = await Product.findOne({ sku: value.sku, _id: { $ne: id } });
        if (skuExists) {
          return res.status(400).json({
            status: 'error',
            message: 'Un produit avec ce SKU existe déjà'
          });
        }
      }

      // Update product
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { ...value, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        status: 'success',
        message: 'Produit mis à jour avec succès',
        data: updatedProduct
      });
    }

    if (req.method === 'DELETE') {
      try {
        await authenticateAdmin(req);
      } catch (authError) {
        return res.status(authError.status).json({
          status: 'error',
          message: authError.message
        });
      }

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Produit non trouvé'
        });
      }

      await Product.findByIdAndDelete(id);

      return res.status(200).json({
        status: 'success',
        message: 'Produit supprimé avec succès'
      });
    }

    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('Product [id] API error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Database error: ' + error.message
    });
  }
};
