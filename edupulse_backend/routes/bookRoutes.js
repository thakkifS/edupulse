const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/bookController");

router.get("/search/:query", ctrl.searchBooks); // must be before /:id
router.get("/", ctrl.getAllBooks);
router.get("/:id", ctrl.getBookById);
router.post("/", ctrl.createBook);
router.put("/:id", ctrl.updateBook);
router.delete("/:id", ctrl.deleteBook);

module.exports = router;