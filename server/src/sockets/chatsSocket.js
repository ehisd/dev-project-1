const { Server } = require('socket.io');
const app = require('../index');
const messageController = require('../controllers/messagController');

// Create Socket.IO server
const io = new Server(app);

// Chat socket to handle real-time messaging between authenticated users
const chat = io.of('/chat');

chat.use((socket, next) => {
  // Check if user is authenticated
  if (socket.handshake.auth.token) {
    return next();
  }
  return next(new Error('Authentication error'));
});

chat.on('connection', async (socket) => {
  try {
    // Get user ID from the token
    const userId = socket.handshake.auth.token;

    // Join the user to a room with their ID
    socket.join(userId);

    // Listen for a message event
    socket.on('message', async (data) => {
      try {
        // Encrypt the message content
        const encryptedContent = await messageController.encryptMessage(
          data.content,
          data.recipientId,
        );

        // Send the encrypted message to the recipient
        const message = await messageController.sendMessage(
          userId,
          data.recipientId,
          encryptedContent,
        );

        // Send the message to the recipient
        chat.to(data.recipientId).emit('message', message);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', {
          message: 'Error sending message',
          error: error.message,
        });
      }
    });

    // Listen for a get messages event
    socket.on('get messages', async () => {
      try {
        // Get messages received by the user
        const messages = await messageController.getReceivedMessages(userId);

        // Decrypt messages before sending
        const decryptedMessages = await Promise.all(
          messages.map(async (message) => {
            const decryptedContent = await messageController.decryptMessage(
              message.content,
              message.senderId,
            );
            return {
              ...message,
              content: decryptedContent,
            };
          }),
        );

        // Send the decrypted messages to the user
        socket.emit('messages', decryptedMessages);
      } catch (error) {
        console.error('Error getting messages:', error);
        socket.emit('error', {
          message: 'Error getting messages',
          error: error.message,
        });
      }
    });
  } catch (error) {
    console.error('Error handling connection:', error);
    socket.emit('error', {
      message: 'Error handling connection',
      error: error.message,
    });
  }
});

module.exports = chat;
