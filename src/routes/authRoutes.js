const express = require("express");
const router = express.Router();
const validateSchema = require("../middlewares/validateSchema");
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require("../utils/validators");
const authController = require("../controllers/authController");

router.post("/register", validateSchema(registerSchema), authController.register);
router.post("/login", validateSchema(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.post("/forgot-password", validateSchema(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validateSchema(resetPasswordSchema), authController.resetPassword);
router.post("/google-signin", authController.googleSignIn);

module.exports = router;
