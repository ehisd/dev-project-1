const express = require('express');
const {
  registerUser,
  loginUser,
  getUsers,
  onBoarding,
  updateSettings,
} = require('../controllers/usersController');
const { uploadProfilePic } = require('../middlewares/fileUpload');

const router = express.Router();

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
router.post('/register', registerUser);

// Annotate logging in a user
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
router.post('/login', loginUser);

// Annotate getting the list of users based on the username
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Get all users
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       400:
 *         description: Error retrieving users
 */
router.get('/users', getUsers);

// Annotate updating user details for the settings page
/**
 * @swagger
 * /settings:
 *   put:
 *     summary: Update user settings
 *     description: Update user settings
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: User settings updated successfully
 *       400:
 *         description: Error updating user settings
 */
router.put('/settings', updateSettings);

// Annotate Onboarding route with profile picture upload
/**
 * @swagger
 * /onboarding:
 *   post:
 *     summary: Onboarding
 *     description: Onboarding
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePic:
 *                 type: string
 *                 format: binary
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       201:
 *         description: User onboarding successful
 *       400:
 *         description: Error onboarding user
 */
router.post('/onboarding', uploadProfilePic, onBoarding);

module.exports = router;
