/**
 * Global error-handling middleware.
 * Must be registered AFTER all routes: app.use(errorHandler)
 */
const errorHandler = (err, req, res, next) => {
  // Body-parser / JSON syntax errors
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format",
      error:
        "Please check your JSON syntax. Make sure all quotes are properly closed and there are no trailing commas.",
    });
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: err.message,
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate key error",
      error: err.message,
    });
  }

  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

module.exports = errorHandler;