const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const notificationController = {
  handleNewNotification: async (req, res) => {
    try {
      const { userId, message } = req.body;

      // Create a new notification entry in the database
      await prisma.Notification.create({
        data: {
          userId,
          message,
        },
      });

      res.status(201).json({ message: 'Notification handled successfully' });
    } catch (error) {
      console.error('Error handling notification:', error);
      res
        .status(400)
        .json({ error: 'Error handling notification', message: error.message });
    }
  },

  getNotifications: async (req, res) => {
    try {
      const { userId } = req.params;

      // Retrieve notifications for the specified user
      const notifications = await prisma.Notification.findMany({
        where: { userId },
      });

      res.status(200).json({ notifications });
    } catch (error) {
      console.error('Error retrieving notifications:', error);
      res.status(400).json({
        error: 'Error retrieving notifications',
        message: error.message,
      });
    }
  },
};

module.exports = notificationController;
