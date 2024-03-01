const bcrypt = require('bcrypt');

const saltRounds = 10;

// Hash a password
async function hashPassword(password) {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return (hashedPassword);
  } catch (error) {
    return (`Internal server error from hashing password: ${error}`);
  }
}

// Compare a password with a hash
async function comparePassword(password, hash) {
  try {
    const hashedPassword = await bcrypt.compare(password, hash);
    if (!hashedPassword) {
      return false;
    }
    return true;
  } catch (error) {
    return (`Internal server error from comparing password: ${error}`);
  }
}

module.exports = { hashPassword, comparePassword };
