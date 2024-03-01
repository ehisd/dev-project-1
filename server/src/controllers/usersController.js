const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword } = require('../middlewares/auth');

const prisma = new PrismaClient({
  log: ['error'],
});

const registerUser = async (req, res) => {
  // Hashing the password
  const hashedPassword = await hashPassword(req.body.password);

  try {
    const user = await prisma.User.create({
      data: {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Prisma Error', error);
    res.status(400).json({ Error: error.message });
  }
};

// Login a user
const loginUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email
      }
    });
    const result = await comparePassword(req.body.password, user.password);
    if (result) {
      res.status(200).json(user);
    } else {
      res.status(400).json({ Error: 'Invalid password' });
    }
  } catch (error) {
    res.status(400).json({ Error: 'Kindly correct your mail' });
  }
};

// Get all users
const getUser = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ Error: error.message });
  }
};

module.exports = { registerUser, loginUser, getUser };
