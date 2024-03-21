const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Endpoint to post a comment on a live stream
const postComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id; // Assuming user is authenticated
  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        liveStreamId: id,
      },
    });
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error posting comment on live stream:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Endpoint to get comments for a live stream
const getComments = async (req, res) => {
  const { id } = req.params;
  try {
    const comments = await prisma.comment.findMany({
      where: {
        liveStreamId: id,
      },
    });
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error getting comments for live stream:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { postComment, getComments };
