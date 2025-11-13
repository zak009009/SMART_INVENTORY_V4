const Order = require('../models/order.model');
const Product = require('../models/product.model');

async function listOrders({ status, page = 1, limit = 10 } = {}) {
  const filter = {};

  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Order.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('items.product')
      .populate('user'), // <- pour voir l'utilisateur lié
    Order.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

async function getOrderById(id) {
  const order = await Order.findById(id)
    .populate('items.product')
    .populate('user'); // <- idem ici si tu veux l'info user
  return order;
}

// data : { items: [ { productId, quantity } ], userId }
async function createOrder({ items, userId }) {
  // 1. Récupérer les produits
  const productIds = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  // 2. Construire les items de commande
  const orderItems = items.map((item) => {
    const product = products.find((p) => p._id.toString() === item.productId);
    if (!product) {
      throw new Error(`Produit introuvable: ${item.productId}`);
    }
    return {
      product: product._id,
      quantity: item.quantity,
      unitPrice: product.price,
    };
  });

  // 3. Calculer le total
  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  // 4. Créer la commande en liant l'utilisateur
  const order = await Order.create({
    items: orderItems,
    totalAmount,
    status: 'pending',
    user: userId, // <- LIEN AVEC L'UTILISATEUR CONNECTÉ
  });

  return order;
}

module.exports = {
  listOrders,
  getOrderById,
  createOrder,
};