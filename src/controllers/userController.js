const bcrypt = require("bcryptjs");
const responseMessages = require("../constants/responseMessages");

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

const userController = {
  getProfile,
  updateProfile,
};

module.exports = userController;
