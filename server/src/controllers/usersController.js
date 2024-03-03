const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword } = require('../middlewares/auth');
const {
  validateUser,
  validateLogin,
} = require('../validations/usersValidations');

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
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
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

// Login a user
const loginUser = async (req, res) => {
  try {
    // validate request body against schema
    const { error } = validateLogin.validateRequest(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await prisma.user.findUnique({
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

// Get all users
const getUser = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(400).json({ Error: error.message });
  }
};

module.exports = { registerUser, loginUser, getUser };
