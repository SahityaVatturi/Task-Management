const Task = require("../models/taskModel");

/**
 * Create a new task for the authenticated user
 *
 * @param {Object} req - The incoming request
 * @param {Object} res - The outgoing response
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
 * Get all tasks for the authenticated user
 *
 * @param {Object} req - The incoming request
 * @param {Object} res - The outgoing response
 */
const getAllTasks = async (req, res) => {
  try {
    // Get authenticated user ID
    const user = req.user._id;
    const tasks = await Task.find({ user }).select("_id title description status createdAt updatedAt");
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get a specific task by ID for the authenticated user
 *
 * @param {Object} req - The incoming request
 * @param {Object} res - The outgoing response
 */
const getTaskById = async (req, res) => {
  try {
    // Get authenticated user ID
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
 * Update a task by ID for the authenticated user
 *
 * @param {Object} req - The incoming request
 * @param {Object} res - The outgoing response
 */
const updateTask = async (req, res) => {
  try {
    // Get authenticated user ID
    const user = req.user._id;

    // Update the task with the given ID if it belongs to the current user
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user },
      req.body,
      { new: true, runValidators: true } // Return the updated document and run validators
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found or you are not authorized" });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a task by ID for the authenticated user
 *
 * @param {Object} req - The incoming request
 * @param {Object} res - The outgoing response
 */
const deleteTask = async (req, res) => {
  try {
    // Get authenticated user ID
    const user = req.user._id;

    // Delete the task with the given ID if it belongs to the current user
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
