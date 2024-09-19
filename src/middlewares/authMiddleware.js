const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

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
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = authMiddleware;
