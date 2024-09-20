const Task = require("../models/taskModel");
const responseMessages = require("../constants/responseMessages");

/**
 * Creates a new task for the authenticated user.
 *
 * @param {Object} req - The HTTP request object containing the task data.
 * @param {Object} res - The HTTP response object to send back the created task.
 */
const createTask = async (req, res) => {
  const { title, description, status } = req.body;
  const userId = req.user._id;
  const newTask = new Task({ title, description, status, user: userId });
  try {
    await newTask.save();
    res.status(201).json({ message: responseMessages.TASK_CREATED, data: newTask });
  } catch (error) {
    console.log(error.stack);
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
    const tasks = await Task.find({ user }).select("_id title description status createdAt updatedAt dueDate");
    res.status(200).json({ message: responseMessages.DATA_FETCHED, data: tasks });
  } catch (error) {
    console.log(error.stack);
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
      return res.status(404).json({ message: responseMessages.TASK_NOT_FOUND });
    }

    res.status(200).json({ message: responseMessages.TASK_UPDATED, data: task });
  } catch (error) {
    console.log(error.stack);
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
      return res.status(404).json({ message: responseMessages.TASK_NOT_FOUND });
    }

    res.status(200).json({ message: responseMessages.TASK_DELETED });
  } catch (error) {
    console.log(error.stack);
    res.status(500).json({ error: error.message });
  }
};

const taskController = {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
};

module.exports = taskController;
