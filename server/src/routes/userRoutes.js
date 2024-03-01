const express = require('express');

const { registerUser, loginUser, getUser } = require('../controllers/usersController');
const app = express();

app.use(express.json());

// Annotate your API route files with Swagger annotations to describe the endpoints
/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Error creating user
 */
app.post('/register', registerUser);

// Annotate getting the list of users
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     description: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Error logging in user
 */
app.post('/login', loginUser);

// Annotate getting the list of users
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Get all users
 *     responses:
 *       200:
 *         description: List of users
 *       400:
 *         description: Error getting users
 */
app.get('/users', getUser);

module.exports = app;
