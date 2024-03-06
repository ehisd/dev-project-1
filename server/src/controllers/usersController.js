const { PrismaClient } = require('@prisma/client');
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


const prisma = new PrismaClient({
  log: ['error'],
});

const registerUser = async (req, res) => {
  try {
    // Validate request body against schema
    const { error } = validateUser.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    // Hash the password
    const hashedPassword = await hashPassword(req.body.password);

    //not checking if the email is already used
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400);
        throw new Error('You must provide the required details.');
      }
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        console.log(existingUser);
        res.status(400);
        throw new Error('Email already in use');
      }

      // const user = await prisma.User.create({
      //   data: {
      //     email: req.body.email,
      //     password: hashedPassword,
      //   },
      // });
      const user = await createUserByEmailAndPassword({ email, password });
      // add access token and refresh token to user
      const jti = uuidv4();
      const { accessToken, refreshToken } = generateTokens(user, jti);
      await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });
      return res.status(201).json({
        accessToken,
        refreshToken,
        user,
      });
  } catch (err) {
    console.log(err);
  }
    // return res.status(201).json(user);
  } catch (error) {
    console.error('Prisma Error', error);
    return res.status(400).json({ Error: error.message });
  }
}
// Update user profile for the onboarding
const onBoarding = async (req, res) => {
  // Handle profile picture upload using Multer
  uploadProfilePic(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        return res.status(500).json({ error: 'File upload error' });
      }
      // return res.status(500).json({ error: 'Internal server error' });

      // Update user profile with uploaded profile picture URL
      const updatedUser = await prisma.User.update({
        where: {
          id: req.user.id,
        },
        data: {
          username: req.body.email,
          bio: req.body.bio,
          profilePicUrl: req.file ? req.file.path : null,
        },
      });
      return res.status(200).json(updatedUser);
    } catch (error) {
      return res.status(400).json({ Error: error.message });
    }
  });
};

// Login a user
const loginUser = async (req, res) => {
  try {
    console.log('entry');
    // Validate request body against schema
    // const { error } = validateLogin.validateRequest(req.body);
    // if (error) {
    //   console.log('begins here');
    //   return res.status(400).json({ error: error.details[0].message });
    // };
    
    const { email, password } = req.body;
    console.log(req.body);
    if (!email || !password) {
      res.status(400);
      throw new Error('You must provide an email and a password.');
    }

    // const user = await prisma.User.findUnique({
    //   where: {
    //     email: req.body.email,
    //   },
    // });

    const existingUser = await findUserByEmail(email);
    if (!existingUser) {
      res.status(403);
      throw new Error('Invalid login credentials.');
    }

    const result = await comparePassword(req.body.password, existingUser.password);
    if (!result) {
      res.status(403);
      throw new Error('Invalid login credentials.');
    }

    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(existingUser, jti);
    console.log("access token "+ accessToken, "refresh token " + refreshToken);
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: existingUser.id });
    // console.log("access token " + accessToken, "refresh token " + refreshToken, "user "+ user);

    res.status(200).json({
      accessToken,
      refreshToken,
      user
    });

    return res.status(400).json({ Error: 'Invalid password' });
  } catch (error) {
    console.log("always here");
    return res.status(400).json({ Error: 'Kindly correct your email' });
  }
};

// Update user details for the settings page
const updateSettings = async (req, res) => {
  try {
    // Hash the password
    const hashedPassword = await hashPassword(req.body.password);

    const updateUser = await prisma.User.update({
      where: {
        id: req.user.id,
      },
      data: {
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        bio: req.body.bio,
        profilePicUrl: req.body.profilePicUrl,
      },
    });
    return res.status(200).json(updateUser);
  } catch (error) {
    return res.status(400).json({ Error: error.message });
  }
};

// Get all users based on the username
const getUsers = async (req, res) => {
  try {
    const users = await prisma.User.findMany({
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
