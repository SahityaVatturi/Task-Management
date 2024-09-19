const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

/**
 * Registers a new user with the provided username, email, and password.
 *
 * @param {Object} req - The HTTP request object containing user details.
 * @param {Object} res - The HTTP response object with user and token data or error message.
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Authenticates a user and returns a JWT token if credentials are valid.
 *
 * @param {Object} req - The HTTP request object containing email and password.
 * @param {Object} res - The HTTP response object with user and token data or error message.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Logs out the user. No server-side action is needed for JWT logout.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object confirming logout.
 */
const logout = (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};

/**
 * Refreshes the JWT token using a valid refresh token.
 *
 * @param {Object} req - The HTTP request object containing the refresh token.
 * @param {Object} res - The HTTP response object with a new token or error message.
 */
const refreshToken = async (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(403).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }

    const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.status(200).json({ token: newToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

/**
 * Sends a password reset token to the user's email for password recovery.
 *
 * @param {Object} req - The HTTP request object containing the user's email.
 * @param {Object} res - The HTTP response object with the reset token or error message.
 */
const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    // Needs to send the resetToken via email in a real application
    res.status(200).json({ resetToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Resets the user's password using the provided reset token and new password.
 *
 * @param {Object} req - The HTTP request object containing the reset token and new password.
 * @param {Object} res - The HTTP response object confirming password reset or error message.
 */
const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash("sha256").update(req.body.token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = await bcrypt.hash(req.body.newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Retrieves the profile information of the authenticated user.
 *
 * @param {Object} req - The HTTP request object with authenticated user details.
 * @param {Object} res - The HTTP response object with user profile data or error message.
 */
const getProfile = async (req, res) => {
  try {
    const user = req.user;
    const { _id, username, email } = user;
    res.status(200).json({ _id, username, email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Updates the profile information of the authenticated user.
 *
 * @param {Object} req - The HTTP request object containing fields to update.
 * @param {Object} res - The HTTP response object with updated profile data or error message.
 */
const updateProfile = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["username", "email", "password"]; // Allow only certain fields to be updated
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: "Invalid updates!" });
    }
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });
    if (req.body.password) {
      req.user.password = await bcrypt.hash(req.body.password, 10);
    }
    await req.user.save();
    const { _id, username, email } = req.user;
    res.status(200).json({ _id, username, email });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const authController = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
};

module.exports = authController;
