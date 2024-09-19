const Task = require("../models/taskModel");

/**
 * Creates a new task for the authenticated user.
 *
 * @param {Object} req - The HTTP request object containing the task data.
 * @param {Object} res - The HTTP response object to send back the created task.
 */
const createTask = async (req, res) => {
  const { title, description, status } = req.body;
  const userId = req.user._id;
  const newTask = new Task({ title, description, status, userId });
  try {
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Retrieves all tasks associated with the authenticated user.
 *
 * @param {Object} req - The HTTP request object (user ID is accessed from the request object).
 * @param {Object} res - The HTTP response object containing the list of tasks.
 */
const getAllTasks = async (req, res) => {
  try {
    const user = req.user._id;
    const tasks = await Task.find({ user }).select("_id title description status createdAt updatedAt");
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Retrieves a specific task by its ID for the authenticated user.
 *
 * @param {Object} req - The HTTP request object containing the task ID as a URL parameter.
 * @param {Object} res - The HTTP response object containing the task data or an error message.
 */
const getTaskById = async (req, res) => {
  try {
    const user = req.user._id;
    const task = await Task.findOne({ _id: req.params.id, user });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Updates a specific task by its ID for the authenticated user.
 *
 * @param {Object} req - The HTTP request object containing the task ID and update data.
 * @param {Object} res - The HTTP response object containing the updated task or an error message.
 */
const updateTask = async (req, res) => {
  try {
    const user = req.user._id;
    const task = await Task.findOneAndUpdate({ _id: req.params.id, user }, req.body, { new: true, runValidators: true });

    if (!task) {
      return res.status(404).json({ message: "Task not found or you are not authorized" });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Deletes a specific task by its ID for the authenticated user.
 *
 * @param {Object} req - The HTTP request object containing the task ID as a URL parameter.
 * @param {Object} res - The HTTP response object confirming the deletion or an error message.
 */
const deleteTask = async (req, res) => {
  try {
    const user = req.user._id;
    const task = await Task.findOneAndDelete({ _id: req.params.id, user });

    if (!task) {
      return res.status(404).json({ message: "Task not found or you are not authorized" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const taskController = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
};

module.exports = taskController;
