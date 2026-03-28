const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    BookID: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    BookName: {
        type: String,
        required: true,
        trim: true
    },
    Author: {
        type: String,
        required: true,
        trim: true
    },
    Description: {
        type: String,
        required: true,
        trim: true
    },
    BookImg: {
        type: String,
        default: '',
        trim: true
    }
}, {
    timestamps: true
});


bookSchema.index({ BookName: 'text', Author: 'text' });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;