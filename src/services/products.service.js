const Product = require('../models/product.model');
const mongoose = require('mongoose');

async function listProducts({ category, inStock, page = 1, limit = 10 } = {}) {
  const filter = {};

  if (category) {
    filter.category = category;
  }

  if (inStock !== undefined) {
    filter.inStock = inStock;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Product.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function getProductById(id) {
  if (!isValidObjectId(id)) {
    return null;
  }
  const product = await Product.findById(id);
  return product;
}

async function createProduct(data) {
  try {
    const product = await Product.create(data);
    return product;
  } catch (error) {
    // Gérer les erreurs de duplication de SKU
    if (error.code === 11000 && error.keyPattern && error.keyPattern.sku) {
      const duplicateError = new Error('Ce SKU existe déjà');
      duplicateError.status = 400;
      throw duplicateError;
    }
    throw error;
  }
}

async function updateProduct(id, data) {
  if (!isValidObjectId(id)) {
    return null;
  }
  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  return product;
}

async function deleteProduct(id) {
  if (!isValidObjectId(id)) {
    return null;
  }
  const product = await Product.findByIdAndDelete(id);
  return product;
}

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};