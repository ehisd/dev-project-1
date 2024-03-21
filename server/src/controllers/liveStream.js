const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Endpoint for live stream
const createLiveStream = async (req, res) => {
  try {
    // Extract user ID from authenticated user's JWT token
    const userId = req.user.id;

    // Extract live stream title and URL from request body
    const { title, streamUrl } = req.body;

    // Save the live stream details to the database
    const newLiveStream = await prisma.LiveStream.create({
      data: {
        title,
        streamUrl,
        ownerId: userId,
      },
    });

    res.status(201).json({
      message: 'Live stream created successfully',
      liveStream: newLiveStream,
    });
  } catch (error) {
    console.error('Error creating live stream:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createLiveStream };
