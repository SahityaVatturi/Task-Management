const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const responseMessages = require("../constants/responseMessages");

/**
 * Registers a new user with the provided firstName, lastName, email, and password.
 *
 * @param {Object} req - The HTTP request object containing user details.
 * @param {Object} res - The HTTP response object with user and token data or error message.
 */
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res.status(409).json({ message: responseMessages.USER_EXISTS });
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: false, // Set to false allowing HTTP and HTTPS for dev environment
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: "strict", // Helps prevent CSRF attacks by not sending the cookie with cross-site requests
    });

    res.status(201).json({ message: responseMessages.REGISTRATION_SUCCESS, data: { user: newUser, token: token } });
  } catch (error) {
    console.log(error.stack);
    res.status(500).json({ error: error.message });
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
    const user = await User.findOne({ email: email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: responseMessages.INVALID_CREDENTIALS });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: false, // Set to false allowing HTTP and HTTPS for dev environment
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: "strict", // Helps prevent CSRF attacks by not sending the cookie with cross-site requests
    });

    res.status(200).json({ message: responseMessages.LOGIN_SUCCESS, data: { user: user, token: token } });
  } catch (error) {
    console.log(error.stack);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Logs out the user by clearing the authentication token from cookies.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object confirming logout.
 */
const logout = (req, res) => {
  res.clearCookie("authToken", { httpOnly: true, secure: true });
  res.status(200).json({ message: responseMessages.LOGOUT_SUCCESS });
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
      return res.status(404).json({ message: responseMessages.USER_NOT_FOUND });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    // Needs to send the resetToken via email in a real application
    return res.status(200).json({ message: responseMessages.TOKEN_GENERATED, token: resetToken });
  } catch (error) {
    console.log(error.stack);
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
      return res.status(400).json({ message: responseMessages.INVALID_TOKEN });
    }

    user.password = await bcrypt.hash(req.body.newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({ message: responseMessages.PASSWORD_RESET_SUCCESS });
  } catch (error) {
    console.log(error.stack);
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
    const { _id, firstName, lastName, email } = user;
    return res.status(200).json({ message: responseMessages.DATA_FETCHED, data: { id: _id, firstName, lastName, email } });
  } catch (error) {
    console.log(error.stack);
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
    const allowedUpdates = ["firstName", "lastName", "email", "password"]; // Allow only certain fields to be updated
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: responseMessages.INVALID_UPDATE });
    }
    const user = req.user;
    updates.forEach((update) => {
      user[update] = req.body[update];
    });
    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }
    await user.save();
    const { _id, firstName, lastName, email } = user;
    res.status(200).json({ message: responseMessages.DATA_UPDATED, data: { id: _id, firstName, lastName, email } });
  } catch (error) {
    console.log(error.stack);
    res.status(500).json({ error: error.message });
  }
};

const authController = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
};

module.exports = authController;
