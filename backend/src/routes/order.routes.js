const express = require('express');
const { createOrder, getOrders, updateOrderStatus, getAnalytics } = require('../controllers/order.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const router = express.Router();

// Get all orders (Restricted to Chef and Admin to view KDS / Dashboard)
router.get('/', requireAuth, requireRole(['Chef', 'Admin', 'Waiter']), getOrders);

// Create a new order (Restricted to Waiter)
router.post('/', requireAuth, requireRole(['Waiter', 'Admin']), createOrder);

// Update order status (Restricted to Chef)
router.patch('/:id/status', requireAuth, requireRole(['Chef', 'Admin']), updateOrderStatus);

// Admin Analytics Route
router.get('/analytics', requireAuth, requireRole(['Admin']), getAnalytics);

module.exports = router;
