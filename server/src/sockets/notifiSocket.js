// Chat notification socket to handle real-time notifications
const { Server } = require('socket.io');
const app = require('../index');
const messageController = require('../controllers/messagController');

// Create Socket.IO server
const io = new Server(app);

// Notification socket to handle real-time notifications
const notifications = io.of('/notifications');

notifications.use((socket, next) => {
  // Check if user is authenticated
  if (socket.handshake.auth.token) {
    return next();
  }
  return next(new Error('Authentication error'));
});

notifications.on('connection', (socket) => {
  // Set maximum listeners to prevent memory leaks
  socket.setMaxListeners(20);

  // Get user ID from the token
  const userId = socket.handshake.auth.token;

  // Join the user to a room with their ID
  socket.join(userId);

  // Listen for a message event
  socket.on('message', async (data) => {
    try {
      // Send the message to the recipient
      const message = await messageController.sendMessage(
        userId,
        data.recipientId,
        data.content,
      );

      // Send the message to the recipient
      notifications.to(data.recipientId).emit('message', message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  // Listen for a get messages event
  socket.on('get messages', async (recipientId) => {
    try {
      // Get messages received by the user
      const messages = await messageController.getReceivedMessages(recipientId);

      // Send the messages to the user
      socket.emit('messages', messages);
    } catch (error) {
      console.error('Error getting messages:', error);
    }
  });
});

module.exports = notifications;
