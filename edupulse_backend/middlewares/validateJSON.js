/**
 * Validates that the raw request body is parseable JSON
 * before body-parser processes it.
 */
const validateJSON = (req, res, buf) => {
  try {
    JSON.parse(buf);
  } catch (e) {
    res.status(400).json({
      success: false,
      message: "Invalid JSON format in request body",
      error: e.message,
    });
    throw new Error("Invalid JSON");
  }
};

module.exports = validateJSON;