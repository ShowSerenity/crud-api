/**
 * @swagger
 * tags:
 *   name: Books
 *   description: API operations related to books
 */

const express = require("express");
const router = express.Router();

const service = require("../controllers/booksController");
const exportFile = require("./filesRouter");
require("dotenv").config();

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Retrieve all books.
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: A list of books.
 *         content:
 *           application/json:
 *             example: [{"title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "genre": "Fiction"}]
 */
router.get("/", async (req, res) => {
  const books = await service.getAllBooks();
  res.send(books);
});

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Retrieve a specific book by ID.
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the book to retrieve.
 *         example: 123
 *     responses:
 *       200:
 *         description: The requested book.
 *         content:
 *           application/json:
 *             example: {"title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "genre": "Fiction"}
 *       404:
 *         description: Book not found.
 */
router.get("/:id", async (req, res) => {
  const book = await service.getBookById(req.params.id);
  if (book === undefined)
    res.status(404).json("no record with given id: " + req.params.id);
  else res.send(book);
});

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book by ID.
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the book to delete.
 *         example: 123
 *     responses:
 *       200:
 *         description: Book deleted successfully.
 *       404:
 *         description: Book not found.
 */
router.delete("/:id", async (req, res) => {
  const affectedRows = await service.deleteBook(req, res, req.params.id);
  if (affectedRows === 0) res.status(404).json("no record with given id: ");
  else res.send("deleted successfully");
});

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Add a new book.
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example: {"title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "genre": "Fiction"}
 *     responses:
 *       201:
 *         description: Book created successfully.
 */
router.post("/", async (req, res) => {
  await service.addOrEditBook(req, res, req.body);
  res.status(201).send("created successfully");
});

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update a book by ID.
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the book to update.
 *         example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example: {"title": "Updated Title", "author": "Updated Author", "genre": "Updated Genre"}
 *     responses:
 *       200:
 *         description: Book updated successfully.
 *       404:
 *         description: Book not found.
 */
router.put("/:id", async (req, res) => {
  const affectedRows = await service.addOrEditBook(
    req,
    res,
    req.body,
    req.params.id,
  );
  if (affectedRows === 0)
    res.status(404).json("no record with given id: " + req.params.id);
  else res.send("updated successfully");
});

/**
 * @swagger
 * /api/books/download/excel:
 *   get:
 *     summary: Download books data in Excel format.
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Excel file containing books data.
 */
router.get("/download/excel", exportFile);

module.exports = router;
