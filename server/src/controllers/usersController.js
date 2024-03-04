const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword } = require('../middlewares/auth');
const {
  validateUser,
  validateLogin,
} = require('../validations/usersValidations');
const { uploadProfilePic } = require('../middlewares/fileUpload');

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
    // Hashing the password
    const hashedPassword = await hashPassword(req.body.password);

    const user = await prisma.user.create({
      data: {
        email: req.body.email,
        password: hashedPassword,
      },
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error('Prisma Error', error);
    return res.status(400).json({ Error: error.message });
  }
};

// Update user profile for the onboarding
const onBoarding = async (req, res) => {
  try {
    // Handle profile picture upload using Multer
    uploadProfilePic(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(500).json({ error: 'File upload error' });
      } else if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Update user profile with uploaded profile picture URL
      try {
        const updatedUser = await prisma.User.update({
          where: {
            id: parseInt(req.user.id),
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
  } catch (error) {
    return res.status(400).json({ Error: error.message });
  }
};


// Login a user
const loginUser = async (req, res) => {
  try {
    // validate request body against schema
    const { error } = validateLogin.validateRequest(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await prisma.User.findUnique({
      where: {
        email: req.body.email,
      },
    });
    const result = await comparePassword(req.body.password, user.password);
    if (result) {
      return res.status(200).json(user);
    }
    return res.status(400).json({ Error: 'Invalid password' });
  } catch (error) {
    return res.status(400).json({ Error: 'Kindly correct your mail' });
  }
};

// Update user details for the settings page
const updateSettings = async (req, res) => {
  try {
    // Hashing the password
    const hashedPassword = await hashPassword(req.body.password);

    const updateUser = prisma.User.update({
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
}

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

module.exports = { registerUser, loginUser, getUsers, onBoarding, updateSettings };

