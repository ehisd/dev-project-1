const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

const messageController = {
  // Function to send a message
  sendMessage: async (senderId, recipientId, content) => {
    try {
      // Check if sender and recipient exist
      const sender = await prisma.User.findUnique({
        where: { id: senderId },
      });
      const recipient = await prisma.User.findUnique({
        where: { id: recipientId },
      });

      if (!sender || !recipient) {
        throw new Error('Sender or recipient not found');
      }

      // Encrypt message content
      const encryptedContent = await this.encryptMessage(content, recipientId);

      // Create the message
      const message = await prisma.Message.create({
        data: {
          senderId,
          recipientId,
          content: encryptedContent,
        },
      });

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Function to get messages received by a User
  getReceivedMessages: async (userId) => {
    try {
      // Get all messages where the User is the recipient
      const messages = await prisma.Message.findMany({
        where: { recipientId: userId },
      });

      return messages;
    } catch (error) {
      console.error('Error getting received messages:', error);
      throw error;
    }
  },

  // Function to encrypt message content
  encryptMessage: async (content, recipientId) => {
    try {
      // Load recipient's public key (Assuming it's stored in Prisma User model)
      const recipientPublicKey = await prisma.User.findUnique({
        where: { id: recipientId },
        select: { publicKey: true },
      });

      if (!recipientPublicKey) {
        throw new Error('Recipient public key not found');
      }

      // Encrypt message content with recipient's public key
      const encryptedContent = crypto
        .publicEncrypt(recipientPublicKey, Buffer.from(content))
        .toString('base64');

      return encryptedContent;
    } catch (error) {
      console.error('Error encrypting message content:', error);
      throw error;
    }
  },

  // Function to decrypt message content
  decryptMessage: async (encryptedContent, userId) => {
    try {
      // Load user's private key (Assuming it's stored in Prisma user model)
      const userPrivateKey = await prisma.User.findUnique({
        where: { id: userId },
        select: { privateKey: true },
      });

      if (!userPrivateKey) {
        throw new Error('User private key not found');
      }

      // Decrypt message content with user's private key
      const decryptedContent = crypto
        .privateDecrypt(userPrivateKey, Buffer.from(encryptedContent, 'base64'))
        .toString();

      return decryptedContent;
    } catch (error) {
      console.error('Error decrypting message content:', error);
      throw error;
    }
  },
};

module.exports = messageController;
