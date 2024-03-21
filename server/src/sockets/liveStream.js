const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const app = require('../index');

const prisma = new PrismaClient();

const io = new Server(app);

// Define namespace for live streams
const liveStreamSocket = io.of('/liveStream');

liveStreamSocket.use((socket, next) => {
  // Check if user is authenticated
  if (socket.handshake.auth.token) {
    return next();
  }
  return next(new Error('Authentication error'));
});

liveStreamSocket.on('connection', (socket) => {
  // Get user ID from the token
  const userId = socket.handshake.auth.token;

  // Join the user to a room with their ID
  socket.join(userId);

  // Listen for start live stream event
  socket.on('startStream', async (streamData) => {
    try {
      // Save the live stream details to the database
      const newLiveStream = await prisma.LiveStream.create({
        data: {
          title: streamData.title,
          streamUrl: streamData.streamUrl,
          ownerId: userId,
        },
      });

      // Broadcast live stream start event to all clients
      liveStreamSocket.emit('streamStarted', {
        message: 'Live stream started successfully',
        liveStream: newLiveStream,
      });
    } catch (error) {
      console.error('Error starting live stream:', error);
      socket.emit('streamError', { error: 'Failed to start live stream' });
    }
  });

  // Handle like live stream event
  socket.on('likeStream', async (streamId) => {
    try {
      // Save the like to the database
      const like = await prisma.Like.create({
        data: {
          userId,
          liveStreamId: streamId,
        },
      });

      // Broadcast like event to all clients
      liveStreamSocket.emit('streamLiked', like);
    } catch (error) {
      console.error('Error liking live stream:', error);
      socket.emit('likeError', { error: 'Failed to like live stream' });
    }
  });

  // Handle get likes event
  socket.on('getLikes', async (streamId) => {
    try {
      // Get likes for the live stream
      const likes = await prisma.Like.findMany({
        where: {
          liveStreamId: streamId,
        },
      });

      // Send likes to the client
      socket.emit('likes', likes);
    } catch (error) {
      console.error('Error getting likes for live stream:', error);
      socket.emit('likesError', {
        error: 'Failed to get likes for live stream',
      });
    }
  });

  // Handle post comment event
  socket.on('postComment', async (commentData) => {
    try {
      // Save the comment to the database
      const comment = await prisma.Comment.create({
        data: {
          content: commentData.content,
          userId,
          liveStreamId: commentData.streamId,
        },
      });

      // Broadcast comment event to all clients
      liveStreamSocket.emit('commentPosted', comment);
    } catch (error) {
      console.error('Error posting comment on live stream:', error);
      socket.emit('commentError', {
        error: 'Failed to post comment on live stream',
      });
    }
  });

  // Handle get comments event
  socket.on('getComments', async (streamId) => {
    try {
      // Get comments for the live stream
      const comments = await prisma.Comment.findMany({
        where: {
          liveStreamId: streamId,
        },
      });

      // Send comments to the client
      socket.emit('comments', comments);
    } catch (error) {
      console.error('Error getting comments for live stream:', error);
      socket.emit('commentsError', {
        error: 'Failed to get comments for live stream',
      });
    }
  });

  // Listen for disconnect event
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

module.exports = liveStreamSocket;
