const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Endpoint to like a live stream
const likeLiveStream = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // Assuming user is authenticated
  try {
    const like = await prisma.like.create({
      data: {
        userId,
        liveStreamId: id,
      },
    });
    res.status(201).json(like);
  } catch (error) {
    console.error('Error liking live stream:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Endpoint to get likes for a live stream
const getLikes = async (req, res) => {
  const { id } = req.params;
  try {
    const likes = await prisma.like.findMany({
      where: {
        liveStreamId: id,
      },
    });
    res.status(200).json(likes);
  } catch (error) {
    console.error('Error getting likes for live stream:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { likeLiveStream, getLikes };
