const jwt = require('jsonwebtoken');


// We determine how long to keep the token 5 minutes - 15 minutes
function generateAccessToken(user) {
  return jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '5m',
  });
}

// I choosed 8h because i prefer to make the user login again each day.
// But we can keep the user logged in if he is using the app.
// This value can be changed to whatever we conclude on
// We can go for a maximum of 7 days, and make the user login again after 7 days of inactivity.
function generateRefreshToken(user, jti) {
  return jwt.sign({
    userId: user.id,
    jti
  }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '8h',
  });
}

// Generate Tokens
function generateTokens(user, jti) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, jti);
  return {
    accessToken,
    refreshToken,
  };
}
module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens
};