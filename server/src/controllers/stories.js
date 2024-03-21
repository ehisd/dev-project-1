const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const { uploadProfilePic } = require('../middlewares/fileUpload');

const prisma = PrismaClient();

// Endpoint to post a story for the user and handle file upload
const postStory = async (req, res) => {
  // Handle story upload using Multer
  uploadProfilePic(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        return res.status(500).json({ error: 'File upload error' });
      }

      // Create a story in the database
      const story = await prisma.Story.create({
        data: {
          imageUrl: req.file.path,
          content: req.body.content,
          ownerId: req.user.id,
        },
      });
      return res.status(201).json(story);
    } catch (error) {
      console.error('Error posting story:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
};

// Endpoint to get stories for the user's feed
const getStories = async (req, res) => {
  try {
    // Get stories from the database
    const stories = await prisma.Story.findMany({
      include: {
        owner: true,
      },
    });

    res.status(200).json(stories);
  } catch (error) {
    console.error('Error getting stories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { postStory, getStories };
