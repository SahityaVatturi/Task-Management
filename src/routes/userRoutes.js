const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const validateSchema = require("../middlewares/validateSchema");
const { updateProfileSchema } = require("../utils/validators");
const userController = require("../controllers/userController");

router.get("/profile", authMiddleware, userController.getProfile);
router.put("/profile", validateSchema(updateProfileSchema), authMiddleware, userController.updateProfile);

module.exports = router;
