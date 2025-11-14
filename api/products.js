// Serverless function for products API
const { connectToDatabase } = require('../src/config/database');
const config = require('../src/config/config');
const Product = require('../src/models/product.model');
const jwt = require('jsonwebtoken');
const User = require('../src/models/user.model');
const Joi = require('joi');

// Product validation schema
const productSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  sku: Joi.string().pattern(/^[A-Za-z0-9\-_]+$/).min(3).max(20).required(),
  price: Joi.number().positive().precision(2).required(),
  category: Joi.string().min(3).max(100).required(),
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
    console.log('✅ Database connected for products API');
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Ensure database connection
    await connectDB();
    
    // Parse URL to check if it's a specific product ID
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/').filter(part => part);
    const isSpecificProduct = pathParts.length > 2; // /api/products/[id]
    const productId = isSpecificProduct ? pathParts[2] : null;
    
    if (req.method === 'GET') {
      if (isSpecificProduct) {
        // Get single product
        const product = await Product.findById(productId);
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
      } else {
        // Get all products
        const products = await Product.find({}).limit(50);
        return res.status(200).json({
          status: 'success',
          data: products,
          count: products.length
        });
      }
    }
    
    if (req.method === 'POST') {
      // Authentication check
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          status: 'error',
          message: 'Token manquant ou mal formé'
        });
      }

      const token = authHeader.split(' ')[1];
      let payload;
      
      try {
        payload = jwt.verify(token, process.env.JWT_SECRET || 'test_jwt_secret_key');
      } catch (err) {
        return res.status(401).json({
          status: 'error',
          message: 'Token invalide ou expiré'
        });
      }

      // Get user and check admin role
      const user = await User.findById(payload.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Accès refusé - Admin requis'
        });
      }

      // Validate request body
      const { error, value } = productSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message
        });
      }

      // Check if SKU already exists
      const existingProduct = await Product.findOne({ sku: value.sku });
      if (existingProduct) {
        return res.status(400).json({
          status: 'error',
          message: 'Un produit avec ce SKU existe déjà'
        });
      }

      // Create product
      const product = new Product(value);
      await product.save();

      return res.status(201).json({
        status: 'success',
        message: 'Produit créé avec succès',
        data: product
      });
    }
    
    if (req.method === 'PUT') {
      if (!isSpecificProduct) {
        return res.status(400).json({
          status: 'error',
          message: 'ID du produit requis pour la mise à jour'
        });
      }

      try {
        await authenticateAdmin(req);
      } catch (authError) {
        return res.status(authError.status).json({
          status: 'error',
          message: authError.message
        });
      }

      // Validate request body (partial validation for updates)
      const updateSchema = Joi.object({
        name: Joi.string().min(3).max(100).optional(),
        sku: Joi.string().pattern(/^[A-Za-z0-9\-_]+$/).min(3).max(20).optional(),
        price: Joi.number().positive().precision(2).optional(),
        category: Joi.string().min(3).max(100).optional(),
        stock: Joi.number().integer().min(0).optional(),
        inStock: Joi.boolean().optional(),
        description: Joi.string().max(500).optional()
      });

      const { error, value } = updateSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message
        });
      }

      // Check if product exists
      const existingProduct = await Product.findById(productId);
      if (!existingProduct) {
        return res.status(404).json({
          status: 'error',
          message: 'Produit non trouvé'
        });
      }

      // If updating SKU, check uniqueness
      if (value.sku && value.sku !== existingProduct.sku) {
        const skuExists = await Product.findOne({ sku: value.sku, _id: { $ne: productId } });
        if (skuExists) {
          return res.status(400).json({
            status: 'error',
            message: 'Un produit avec ce SKU existe déjà'
          });
        }
      }

      // Update product
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
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
      if (!isSpecificProduct) {
        return res.status(400).json({
          status: 'error',
          message: 'ID du produit requis pour la suppression'
        });
      }

      try {
        await authenticateAdmin(req);
      } catch (authError) {
        return res.status(authError.status).json({
          status: 'error',
          message: authError.message
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Produit non trouvé'
        });
      }

      await Product.findByIdAndDelete(productId);

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
    console.error('Products API error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Database error: ' + error.message
    });
  }
};
