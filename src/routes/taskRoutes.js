const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const validateSchema = require("../middlewares/validateSchema");
const { createTaskSchema, updateTaskSchema } = require("../utils/validators");
const taskController = require("../controllers/taskController");

router.post("/", validateSchema(createTaskSchema), authMiddleware, taskController.createTask);
router.get("/", authMiddleware, taskController.getAllTasks);
router.put("/:id", validateSchema(updateTaskSchema), authMiddleware, taskController.updateTask);
router.delete("/:id", authMiddleware, taskController.deleteTask);

module.exports = router;
