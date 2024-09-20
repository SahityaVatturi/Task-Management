const router = require("express").Router();
const authRoutes = require("./authRoutes");
const taskRoutes = require("./taskRoutes");
const userRoutes = require("./userRoutes");

// Response should always have status code, message, data

router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);
router.use("/users", userRoutes);

// Home route for testing
router.get("/", (req, res) => {
  res.status(200).send("Server is running");
});

module.exports = router;
