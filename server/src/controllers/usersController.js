// Import required modules
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const { db } = require('../utils/db');
const { 
  hashPassword,
  comparePassword,
  findUserByEmail,
  createUserByEmailAndPassword,
} = require('../middlewares/auth');
const {
  validateUser,
  validateLogin,
} = require('../validations/usersValidations');
const { uploadProfilePic } = require('../middlewares/fileUpload');
const { generateTokens } = require('../utils/jwt');
const {
  addRefreshTokenToWhitelist,
} = require('../services/tokenServices');

// Register User
const registerUser = async (req, res) => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;

    // Validate user input
    const { error } = validateUser.validate({ email, password });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Check if the email is already in use
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Create user
    const user = await createUserByEmailAndPassword({
      email,
      password: hashedPassword,
    });

    // Generate tokens
    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(user, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });

    // Return success response with tokens and user details
    return res.status(201).json({
      accessToken,
      refreshToken,
      user,
    });
  } catch (error) {
    // Handle unexpected errors
    console.error('Error in registerUser:', error);
    return res.status(400).json({ error: error.message });
  }
};

// Update user profile for the onboarding process
const onBoarding = async (req, res) => {
  // Destructure request object for clarity
  const { body, file, user } = req;

  // Handle profile picture upload using Multer middleware
  uploadProfilePic(req, res, async (err) => {
    try {
      // Check for Multer errors
      if (err instanceof multer.MulterError) {
        console.error('Error uploading profile picture:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Update user profile in the database
      const updatedUser = await db.User.update({
        where: { id: user.id },
        data: {
          username: body.username,
          bio: body.bio,
          profilePicUrl: file ? file.path : null,
        },
      });

      // Return success response with updated user details
      return res.status(200).json(updatedUser);
    } catch (error) {
      // Handle unexpected errors during profile update
      console.error('Error updating user profile:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
};

// Login a user
const loginUser = async (req, res) => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;

    // Validate user input
    const { error } = validateLogin.validate({ email, password });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Find user by email
    const existingUser = await findUserByEmail(email);
    // Return authentication failure response if user not found or password does not match
    if (!existingUser || !(await comparePassword(password, existingUser.password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate tokens
    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(existingUser, jti);

    // Add refresh token to whitelist
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: existingUser.id });

    // Return success response with tokens
    return res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    // Handle unexpected errors
    console.error('Error in loginUser:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// Update user details for the settings page
const updateSettings = async (req, res) => {
  try {
    // Destructure request body for clarity
    const { 
      username,
      email,
      password,
      bio,
    } = req.body;

    // Hash the password if provided
    const hashedPassword = password ? await hashPassword(password) : undefined;

    // Update user details in the database
    const updateUser = await db.User.update({
      where: { id: req.user.id },
      data: {
        username,
        email,
        password: hashedPassword,
        bio,
      },
    });

    // Handle profile picture upload using Multer
    uploadProfilePic(req, res, async (err) => {
      if (err) {
        console.error('Error uploading profile picture:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Update profilePicUrl if a file was uploaded
      if (req.file) {
        updateUser.profilePicUrl = req.file.path;
        await updateUser.save();
      }

      // Return updated user details
      return res.status(200).json(updateUser);
    });
  } catch (error) {
    // Handle unexpected errors during settings update
    console.error('Error updating user settings:', error);
    return res.status(400).json({ error: error.message });
  }
};


// Get all users based on the username
const getUsers = async (req, res) => {
  try {
    // Fetch users from database based on username query
    const users = await db.User.findMany({
      where: { username: { contains: req.query.username } },
    });
    // Return success response with users
    return res.status(200).json(users);
  } catch (error) {
    // Handle unexpected errors during user retrieval
    console.error('Error fetching users:', error);
    return res.status(400).json({ error: error.message });
  }
};

// Export functions for use in other modules
module.exports = {
  registerUser,
  loginUser,
  getUsers,
  onBoarding,
  updateSettings,
};
