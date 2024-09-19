const router = require("express").Router();
const authRoutes = require("./authRoutes");
const taskRoutes = require("./taskRoutes");
// const userRoutes = require("./userRoutes");

// Response should always have status code, message, data
// I removed due data, but we do need it -> as it can help in bonus tasks like reminder
// Check the queries properly --> Send only necessary data in response

router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);
// router.use("/users", userRoutes);

router.get("/", (req, res) => {
  res.status(200).send("Server is running");
});

module.exports = router;
