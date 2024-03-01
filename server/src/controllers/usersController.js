const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error'],
});

// Register a new user
async function registerUser(req, res) {
  try {
    const user = await prisma.User.create({
      data: {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      },
    });
    res.status(201).json(user);
    throw new Error('Invalid Data');
  } catch (error) {
    console.error('Prisma Error', error);
    res.status(400).json({ Error: error.message });
  }
}

// Login a user
async function loginUser(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
        password: req.body.password,
      },
    });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(400).json({ Error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(400).json({ Error: error.message });
  }
}

// Get all users
async function getUser(req, res) {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ Error: error.message });
  }
}

module.exports = { registerUser, loginUser, getUser };
