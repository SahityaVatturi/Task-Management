const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const validateSchema = require("../middlewares/validateSchema");
const { createTaskSchema, updateTaskSchema, getTaskByIdSchema, getTasksByUserSchema } = require("../utils/validators");
const taskController = require("../controllers/taskController");

router.post("/", validateSchema(createTaskSchema), authMiddleware, taskController.createTask);
router.get("/", authMiddleware, taskController.getAllTasks);
router.get("/:id", authMiddleware, taskController.getTaskById); // only login user's tasks --> Not in use
router.put("/:id", validateSchema(updateTaskSchema), authMiddleware, taskController.updateTask);
router.delete("/:id", authMiddleware, taskController.deleteTask);
// router.get("/users/:userId/tasks", taskController.getTasksByUser);

module.exports = router;
