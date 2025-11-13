const express = require('express');
const ordersController = require('../controllers/orders.controller');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

const router = express.Router();
router.get('/', ordersController.getOrders);
router.get('/:id', ordersController.getOrder);


router.post('/', 
    auth,   
    authorize('user',  'admin'),
    ordersController.createOrder);

module.exports = router;
