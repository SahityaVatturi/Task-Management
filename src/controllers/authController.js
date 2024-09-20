const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const responseMessages = require("../constants/responseMessages");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    res.status(201).json({ message: responseMessages.REGISTRATION_SUCCESS, token });
  } catch (error) {
    console.log(error.stack);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Authenticates a user and returns a JWT token if credentials are valid.
 *
 * @param {Object} req - The HTTP request object containing email and password.
 * @param {Object} res - The HTTP response object with token data or error message.
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

    res.status(200).json({ message: responseMessages.LOGIN_SUCCESS, token });
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
 * Verifies the Google ID token and processes the user's information.
 *
 * @param {Object} req - The HTTP request object containing the ID token in the body.
 * @param {Object} res - The HTTP response object used to send the response.
 */
const googleSignIn = async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log(payload, 155);
    // Process the payload (create user in your database)
    res.status(200).json({ message: responseMessages.AUTHORISED, user: payload });
  } catch (error) {
    console.log(error.stack);
    res.status(500).json({ message: error.message });
  }
};

const authController = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  googleSignIn,
};

module.exports = authController;
