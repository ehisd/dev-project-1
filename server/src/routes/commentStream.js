const express = require('express');

const router = express.Router();
const {
  getComments,
  postComment,
} = require('../controllers/commentLiveStream');

// Endpoint to post a comment on a live stream with swagger annotation
/**
 * @swagger
 * /liveStreams/{id}/comments:
 *   post:
 *     summary: Post a comment on a live stream
 *     description: Post a comment on a live stream
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the live stream
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment posted successfully
 *       400:
 *         description: Error posting comment
 */
router.post('/:id/comments', postComment);

// Endpoint to get comments for a live stream with swagger annotation
/**
 * @swagger
 * /liveStreams/{id}/comments:
 *   get:
 *     summary: Get comments for a live stream
 *     description: Get comments for a live stream
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the live stream
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *       400:
 *         description: Error retrieving comments
 */
router.get('/:id/comments', getComments);

module.exports = router;
