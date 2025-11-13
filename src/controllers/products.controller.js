const productsService = require('../services/products.service');

async function getProducts(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);

    const { items, total, pages } = await productsService.listProducts({
      category: req.query.category,
      inStock: req.query.inStock === 'true' ? true : req.query.inStock === 'false' ? false : undefined,
      page,
      limit,
    });

    res.json({
      status: 'success',
      data: items,
      meta: { total, page, pages },
    });
  } catch (err) {
    next(err);
  }
}

async function getProduct(req, res, next) {
  try {
    const product = await productsService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Produit introuvable',
      });
    }

    res.json({
      status: 'success',
      data: product,
    });
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const product = await productsService.createProduct(req.body);
    res.status(201).json({
      status: 'success',
      data: product,
    });
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const product = await productsService.updateProduct(req.params.id, req.body);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Produit introuvable',
      });
    }

    res.json({
      status: 'success',
      data: product,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const product = await productsService.deleteProduct(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Produit introuvable',
      });
    }

    res.status(204).send(); // pas de contenu
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};