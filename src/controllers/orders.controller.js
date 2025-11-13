const ordersService = require('../services/orders.service');

async function getOrders(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);

    const { items, total, pages } = await ordersService.listOrders({
      status: req.query.status,
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

async function getOrder(req, res, next) {
  try {
    const order = await ordersService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Commande introuvable',
      });
    }

    res.json({
      status: 'success',
      data: order,
    });
  } catch (err) {
    next(err);
  }
}

async function createOrder(req, res, next) {
  try {
    const userId = req.user ? req.user.id : null;
    const order = await ordersService.createOrder({ ...req.body, userId });
    res.status(201).json({
      status: 'success',
      data: order,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getOrders,
  getOrder,
  createOrder,
};