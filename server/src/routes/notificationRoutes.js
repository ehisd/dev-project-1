const express = require('express');
const {
  handleNewNotification,
  getNotifications,
} = require('../controllers/notificationsController');

const router = express.Router();

// Define notification routes
/**
 * @swagger
 * /notifications/new:
 *   post:
 *     summary: Handle new notification
 *     description: Handle new notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification handled successfully
 *       400:
 *         description: Error handling notification
 */
router.post('/new', handleNewNotification);

/**
 * @swagger
 * /notifications/{userId}:
 *   get:
 *     summary: Get notifications
 *     description: Get notifications for a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       400:
 *         description: Error retrieving notifications
 */
router.get('/:userId', getNotifications);

module.exports = router;
