const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const validateSchema = require("../middlewares/validateSchema");
const { updateProfileSchema } = require("../utils/validators");
const authController = require("../controllers/authController");

router.get("/profile", authMiddleware, authController.getProfile);
router.put("/profile", validateSchema(updateProfileSchema), authMiddleware, authController.updateProfile);

module.exports = router;
