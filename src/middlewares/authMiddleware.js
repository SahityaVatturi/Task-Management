const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const responseMessages = require("../constants/responseMessages");

/**
 * Middleware for authenticating requests using JWT.
 *
 * This middleware extracts the JWT token from the `Authorization` header, verifies it,
 * and attaches the authenticated user to the `req.user` object if the token is valid.
 * Responds with a 401 status code if the token is missing, invalid, or if the user is not found.
 *
 * @param {Object} req - The HTTP request object, which may contain the `Authorization` header.
 * @param {Object} res - The HTTP response object, used to send error responses if authentication fails.
 * @param {Function} next - The callback function to pass control to the next middleware or route handler.
 *
 * @returns {void}
 */
const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: responseMessages.AUTH_REQUIRED });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: responseMessages.INVALID_TOKEN });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error.stack);
    res.status(401).json({ error: error.message });
  }
};

module.exports = authMiddleware;
