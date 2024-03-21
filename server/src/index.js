// Import required modules
const express = require('express');
const EventEmitter = require('events');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swaggerSpec');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const liveStreamRoutes = require('./routes/liveStream');
const { getComments, postComment } = require('./controllers/commentLiveStream');
const { likeLiveStream, getLikes } = require('./controllers/likeLiveStream');

const app = express();

// Create an event emitter instance
EventEmitter.defaultMaxListeners = 20;

// Middleware
app.use(express.json());
app.use(cors());

// Define routes
app.use('/users', userRoutes);
app.use('/chats', chatRoutes);
app.use('/notifications', notificationRoutes);
app.use('/live-streams', liveStreamRoutes);
app.use('/live-streams', postComment);
app.use('/live-streams', getComments);
app.use('/live-streams', likeLiveStream);
app.use('/live-streams', getLikes);

// Serve Swagger UI at /api-docs route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start the server
const port = process.env.PORT || 3200;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;
