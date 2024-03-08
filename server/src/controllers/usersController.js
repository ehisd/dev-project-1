const { db } = require('../utils/db.js');
const multer = require('multer');
const { hashPassword, comparePassword, findUserByEmail, findUserById, createUserByEmailAndPassword } = require('../middlewares/auth');
const {
  validateUser,
  validateLogin,
} = require('../validations/usersValidations');
const { uploadProfilePic } = require('../middlewares/fileUpload');

// Tokens
const { v4: uuidv4 } = require('uuid');
const { generateTokens } = require('../utils/jwt');
const {
  addRefreshTokenToWhitelist,
} = require('../services/tokenServices');

// Register User
const registerUser = async (req, res) => {
  try {
    // Get user input
    const { email, password } = req.body;
    // Validate request body against schema
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
      password: hashedPassword
    });

    // Generate tokens
    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(user, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });

    // Return response
    return res.status(201).json({
      accessToken,
      refreshToken,
      user
    });
  } catch (error) {
    console.error('Error in registerUser:', error);
    return res.status(400).json({ error: error.message });
  }
};

// Update user profile for the onboarding
// Function to handle user profile update during onboarding process
const onBoarding = async (req, res) => {
  // Destructure request object for clarity
  const { body, file, user } = req;

  // Handle profile picture upload using Multer middleware
  uploadProfilePic(req, res, async (err) => {
    try {
      // Check for Multer errors
      if (err instanceof multer.MulterError) {
        // Return error response for file upload error
        return res.status(500).json({ error: 'File upload error' });
      }

      // Update user profile in the database
      const updatedUser = await db.User.update({
        // Specify user ID for updating the correct user
        where: {
          id: user.id,
        },
        // Data to update in the user profile
        data: {
          username: body.username, // Update username
          bio: body.bio, // Update bio
          profilePicUrl: file ? file.path : null, // Update profile picture URL if file is uploaded
        },
      });

      // Return success response with updated user details
      return res.status(200).json(updatedUser);
    } catch (error) {
      // Return error response if an error occurs during the update process
      return res.status(400).json({ Error: error.message });
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
      // Return validation error response
      return res.status(400).json({ error: error.details[0].message });
    }

    // Find user by email
    const existingUser = await findUserByEmail(email);
    if (!existingUser) {
      // Return authentication failure response if user not found
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Compare password hash
    const passwordMatch = await comparePassword(password, existingUser.password);
    if (!passwordMatch) {
      // Return authentication failure response if password does not match
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
    const { username, email, password, bio } = req.body;

    // Hash the password if provided
    const hashedPassword = password ? await hashPassword(password) : undefined;

    // Update user details in the database
    const updateUser = await db.User.update({
      where: {
        id: req.user.id,
      },
      data: {
        username,
        email,
        password: hashedPassword,
        bio,
      },
    });

    // Handle profile picture upload using Multer
    uploadProfilePic(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(500).json({ error: 'File upload error' });
      }
      if (err) {
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
    // Handle errors
    return res.status(400).json({ Error: error.message });
  }
};


// Get all users based on the username
const getUsers = async (req, res) => {
  try {
    const users = await db.User.findMany({
      where: {
        username: {
          contains: req.query.username,
        },
      },
    });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(400).json({ Error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  onBoarding,
  updateSettings,
};
