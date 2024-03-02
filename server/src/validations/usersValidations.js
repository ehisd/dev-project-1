const Joi = require('joi');

// validation schema for user registration
const validateUser = Joi.object({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')).required(),
});

// validate schema for user login
const validateLogin = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')).required(),
});

module.exports = {
  validateUser,
  validateLogin,
};
