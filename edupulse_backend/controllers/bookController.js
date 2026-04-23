const Book = require("../models/Book");

// GET /api/Book
exports.getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json({ success: true, count: books.length, data: books });
  } catch (err) {
    next(err);
  }
};

// GET /api/Book/:id
exports.getBookById = async (req, res, next) => {
  try {
    const book = await Book.findOne({ BookID: req.params.id });
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }
    res.json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

// GET /api/Book/search/:query
exports.searchBooks = async (req, res, next) => {
  try {
    const raw = String(req.params.query || "").trim();
    if (!raw) return res.json({ success: true, count: 0, data: [] });

    const rx = new RegExp(raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const books = await Book.find({
      $or: [{ BookName: rx }, { Author: rx }, { Description: rx }],
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: books.length, data: books });
  } catch (err) {
    next(err);
  }
};

// POST /api/Book
exports.createBook = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: "Request body is empty or invalid JSON" });
    }

    const { BookID, BookName, Author, Description, BookImg } = req.body;

    if (!BookID || !BookName || !Author || !Description) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: BookID, BookName, Author, Description are required",
      });
    }

    const existing = await Book.findOne({ BookID });
    if (existing) {
      return res.status(400).json({ success: false, message: "Book with this ID already exists" });
    }

    const saved = await Book.create({
      BookID: BookID.trim(),
      BookName: BookName.trim(),
      Author: Author.trim(),
      Description: Description.trim(),
      BookImg: BookImg ? BookImg.trim() : "",
    });

    res.status(201).json({ success: true, message: "Book created successfully", data: saved });
  } catch (err) {
    next(err);
  }
};

// PUT /api/Book/:id
exports.updateBook = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: "Request body is empty or invalid JSON" });
    }

    const { BookName, Author, Description, BookImg } = req.body;

    if (!BookName || !Author || !Description) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: BookName, Author, Description are required",
      });
    }

    const updated = await Book.findOneAndUpdate(
      { BookID: req.params.id },
      {
        BookName: BookName.trim(),
        Author: Author.trim(),
        Description: Description.trim(),
        BookImg: BookImg ? BookImg.trim() : "",
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    res.json({ success: true, message: "Book updated successfully", data: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/Book/:id
exports.deleteBook = async (req, res, next) => {
  try {
    const deleted = await Book.findOneAndDelete({ BookID: req.params.id });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }
    res.json({ success: true, message: "Book deleted successfully", data: deleted });
  } catch (err) {
    next(err);
  }
};