const express = require('express');
const { likeLiveStream, getLikes } = require('../controllers/likeLiveStream');

const router = express.Router();

// Endpoint to like a live stream with swagger annotation
/**
 * @swagger
 * /liveStreams/{id}/like:
 *   post:
 *     summary: Like a live stream
 *     description: Like a live stream
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the live stream
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Live stream liked successfully
 *       400:
 *         description: Error liking live stream
 */
router.post('/:id/like', likeLiveStream);

// Endpoint to get likes for a live stream with swagger annotation
/**
 * @swagger
 * /liveStreams/{id}/likes:
 *   get:
 *     summary: Get likes for a live stream
 *     description: Get likes for a live stream
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the live stream
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Likes retrieved successfully
 *       400:
 *         description: Error retrieving likes
 */
router.get('/:id/likes', getLikes);

module.exports = router;
