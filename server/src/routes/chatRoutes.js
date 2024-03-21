// routes/messageRoutes.js
const express = require('express');
const messageController = require('../controllers/messagController');

const router = express.Router();

/**
 * @swagger
 * /chat/send:
 *   post:
 *     summary: Send a message
 *     description: Send a message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               senderId:
 *                 type: string
 *               recipientId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Error sending message
 */
router.post('/send', messageController.sendMessage);

/**
 * @swagger
 * /chat/received/{userId}:
 *   get:
 *     summary: Get received messages
 *     description: Get received messages for a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *       400:
 *         description: Error retrieving messages
 */
router.get('/received/:userId', messageController.getReceivedMessages);

/**
 * @swagger
 * /chat/decrypt:
 *   post:
 *     summary: Decrypt a message
 *     description: Decrypt a message using the user's private key
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               encryptedContent:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message decrypted successfully
 *       400:
 *         description: Error decrypting message
 */
router.post('/decrypt', async (req, res) => {
  try {
    const { encryptedContent, userId } = req.body;
    const decryptedContent = await messageController.decryptMessage(
      encryptedContent,
      userId,
    );
    res.status(200).json({ decryptedContent });
  } catch (error) {
    console.error('Error decrypting message:', error);
    res
      .status(400)
      .json({ error: 'Error decrypting message', message: error.message });
  }
});

module.exports = router;
