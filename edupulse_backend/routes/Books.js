const express = require('express');
const router = express.Router();
const Book = require('../models/books');

// GET all books
router.get('/', async (req, res) => {
    try {
        console.log('GET /api/Book - Fetching all books');
        const books = await Book.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            count: books.length,
            data: books
        });
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// GET single book by ID
router.get('/:id', async (req, res) => {
    try {
        console.log(`GET /api/Book/${req.params.id} - Fetching book`);
        const book = await Book.findOne({ BookID: req.params.id });
        
        if (!book) {
            console.log(`Book with ID ${req.params.id} not found`);
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        console.log(`Found book:`, book);
        res.json({
            success: true,
            data: book
        });
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// CREATE new book
router.post('/', async (req, res) => {
    try {
        console.log('POST /api/Book - Creating new book with data:', req.body);
        
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Request body is empty or invalid JSON'
            });
        }

        const { BookID, BookName, Author, Description, BookImg } = req.body;

        if (!BookID || !BookName || !Author || !Description) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: BookID, BookName, Author, Description are required'
            });
        }

        const existingBook = await Book.findOne({ BookID });
        if (existingBook) {
            return res.status(400).json({
                success: false,
                message: 'Book with this ID already exists'
            });
        }

        const newBook = new Book({
            BookID: BookID.trim(),
            BookName: BookName.trim(),
            Author: Author.trim(),
            Description: Description.trim(),
            BookImg: BookImg ? BookImg.trim() : ''
        });

        const savedBook = await newBook.save();
        console.log('Book created successfully:', savedBook);

        res.status(201).json({
            success: true,
            message: 'Book created successfully',
            data: savedBook
        });
    } catch (error) {
        console.error('Error creating book:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                error: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// UPDATE book
router.put('/:id', async (req, res) => {
    try {
        console.log(`PUT /api/Book/${req.params.id} - Updating book with data:`, req.body);

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Request body is empty or invalid JSON'
            });
        }

        const { BookName, Author, Description, BookImg } = req.body;

        if (!BookName || !Author || !Description) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: BookName, Author, Description are required'
            });
        }

        const updatedBook = await Book.findOneAndUpdate(
            { BookID: req.params.id },
            {
                BookName: BookName.trim(),
                Author: Author.trim(),
                Description: Description.trim(),
                BookImg: BookImg ? BookImg.trim() : ''
            },
            { new: true, runValidators: true }
        );

        if (!updatedBook) {
            console.log(`Book with ID ${req.params.id} not found for update`);
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        console.log('Book updated successfully:', updatedBook);
        res.json({
            success: true,
            message: 'Book updated successfully',
            data: updatedBook
        });
    } catch (error) {
        console.error('Error updating book:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                error: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// DELETE book
router.delete('/:id', async (req, res) => {
    try {
        console.log(`DELETE /api/Book/${req.params.id} - Deleting book`);
        
        const deletedBook = await Book.findOneAndDelete({ BookID: req.params.id });

        if (!deletedBook) {
            console.log(`Book with ID ${req.params.id} not found for deletion`);
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        console.log('Book deleted successfully:', deletedBook);
        res.json({
            success: true,
            message: 'Book deleted successfully',
            data: deletedBook
        });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// SEARCH books
router.get('/search/:query', async (req, res) => {
    try {
        console.log(`GET /api/Book/search/${req.params.query} - Searching books`);
        
        const { query } = req.params;
        
        const books = await Book.find({
            $or: [
                { BookName: { $regex: query, $options: 'i' } },
                { Author: { $regex: query, $options: 'i' } },
                { Description: { $regex: query, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 });

        console.log(`Search found ${books.length} books`);
        res.json({
            success: true,
            count: books.length,
            data: books
        });
    } catch (error) {
        console.error('Error searching books:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;