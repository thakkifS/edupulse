const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "30d",
  });
};

// POST /api/Register
exports.register = async (req, res, next) => {
  try {
    const { Name, studentID, PhoneNumber, Email, Password } = req.body;

    if (!Name || !studentID || !PhoneNumber || !Email || !Password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existing = await User.findOne({
      $or: [
        { Email: Email.toLowerCase().trim() },
        { studentID: studentID.toUpperCase().trim() },
      ],
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "Email or Student ID already exists" });
    }

    const user = await User.create({
      Name: Name.trim(),
      studentID: studentID.toUpperCase().trim(),
      PhoneNumber: PhoneNumber.trim(),
      Email: Email.toLowerCase().trim(),
      Password: Password.trim(),
      role: "student",
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: { Name: user.Name, Email: user.Email, studentID: user.studentID, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/Register/login
exports.login = async (req, res, next) => {
  try {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ Email: Email.toLowerCase().trim() });
    if (!user || user.Password !== Password) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token: token,
      data: { Name: user.Name, Email: user.Email, studentID: user.studentID, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};