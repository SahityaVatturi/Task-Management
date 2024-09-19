const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

/**
 * Register a new user
 *
 * @param {Object} req - The incoming request
 * @param {Object} res - The outgoing response
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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" }); // change the expiresIn value to suit your needs

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Login a user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" }); // change the expiresIn value to suit your needs

    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Logout a user (handle on client-side, clearing tokens)
const logout = (req, res) => {
  // No actual operation needed server-side for JWT logout.
  res.status(200).json({ message: "Logged out successfully" });
};

// Refresh JWT token
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

    const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ token: newToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

// Forgot password - sends a reset token
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

// Reset password using the reset token
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

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = req.user; // req.user is populated by authMiddleware
    const { _id, username, email } = user;
    res.status(200).json({ _id, username, email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
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
      req.user.password = await bcrypt.hash(req.body.password, 10); // Hash new password if updated
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
