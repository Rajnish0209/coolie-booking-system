const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Notification routes
router.route('/')
  .get(getNotifications);

router.put('/read-all', markAllAsRead);

router.route('/:id')
  .delete(deleteNotification);

router.route('/:id/read')
  .put(markAsRead);

module.exports = router; 