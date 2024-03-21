const express = require('express');
const { createLiveStream } = require('../controllers/liveStream');

const router = express.Router();

// Endpoint to start a live stream with swagger annotation
/**
 * @swagger
 * /liveStreams/start:
 *   post:
 *     summary: Start a live stream
 *     description: Start a live stream
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Live stream started successfully
 *       400:
 *         description: Error starting live stream
 */
router.post('/start', createLiveStream);

module.exports = router;
