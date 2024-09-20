const responseMessages = Object.freeze({
  SUCCESS: "Success",
  REGISTRATION_SUCCESS: "User registered successfully",
  LOGIN_SUCCESS: "User logged in successfully",
  LOGOUT_SUCCESS: "User logged out successfully",
  INVALID_CREDENTIALS: "Invalid credentials",
  TOKEN_GENERATED: "Token generated successfully",
  PASSWORD_RESET_SUCCESS: "Password reset successfully",

  TASK_CREATED: "Task created successfully",
  TASK_UPDATED: "Task updated successfully",
  TASK_DELETED: "Task deleted successfully",
  TASK_NOT_FOUND: "Task not found or you are not authorized",

  USER_NOT_FOUND: "User not found",
  USER_EXISTS: "User already exists",
  INVALID_TOKEN: "Invalid or expired reset token",
  INVALID_KEYS: "Invalid keys provided",
  INVALID_UPDATE: "Invalid updates!",

  AUTH_REQUIRED: "Authentication required!",
  UNAUTHORISED: "Unauthorised!",

  DATA_STORED: "Data stored successfully",
  DATA_FETCHED: "Data fetched successfully",
  DATA_UPDATED: "Data updated successfully",
  DATA_DELETED: "Data deleted successfully",
  DATA_NOT_STORED: "Error storing the data",
  DATA_NOT_AVAILABLE: "No data available",
  DATA_NOT_UPDATED: "Error updating the data",
  INTERNAL_SERVER_ERROR: "Internal server error",
  NOT_FOUND: "No data found",
  DATA_FOUND: "Data found",
});

module.exports = responseMessages;
