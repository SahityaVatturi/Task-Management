/**
 * Middleware for validating request body against a Joi schema.
 *
 * @param {Object} schema - The Joi schema to validate the request body against.
 * @returns {Function} - A middleware function that validates the request body and calls `next()` if valid, or responds with a 400 status code and error message if invalid.
 */
const validateSchema = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
};

module.exports = validateSchema;
