/**
 * Middleware for handling errors in the application.
 *
 * This function logs the error stack for debugging purposes and sends a JSON response
 * with the appropriate HTTP status code and error message. It defaults to a 500 status code
 * and a generic "Internal Server Error" message if no specific status code or message is provided.
 *
 * @param {Object} err - The error object containing details about the error.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object used to send the error response.
 * @param {Function} next - The callback function to pass control to the next middleware (not used in this case).
 *
 * @returns {void}
 */
const errorHandler = (err, req, res, next) => {
  // Log the error details for debugging
  console.error(err.stack);

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

module.exports = errorHandler;
