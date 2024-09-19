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
