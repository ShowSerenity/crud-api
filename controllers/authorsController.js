/**
 * @swagger
 * tags:
 *   name: Authors
 *   description: API operations related to authors
 */

const express = require("express");
const router = express.Router();

const service = require("../services/authorsService");

/**
 * @swagger
 * /api/authors:
 *   get:
 *     summary: Retrieve all authors.
 *     tags: [Authors]
 *     responses:
 *       200:
 *         description: A list of authors.
 *         content:
 *           application/json:
 *             example: [{"name": "Jane Doe", "country": "USA"}]
 */
router.get("/", async (req, res) => {
  const authors = await service.getAllAuthors();
  res.send(authors);
});

/**
 * @swagger
 * /api/authors/books:
 *   get:
 *     summary: Retrieve all authors and their books.
 *     tags: [Authors]
 *     responses:
 *       200:
 *         description: A list of authors with their books.
 *         content:
 *           application/json:
 *             example: [{"name": "Jane Doe", "country": "USA", "books": [...] }]
 */
router.get("/books", async (req, res) => {
  const authorsBooks = await service.getAuthorsBooks();
  res.send(authorsBooks);
});

/**
 * @swagger
 * /api/authors/{id}/books:
 *   get:
 *     summary: Retrieve books by author ID.
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the author to retrieve books.
 *         example: 123
 *     responses:
 *       200:
 *         description: Books by the requested author.
 *         content:
 *           application/json:
 *             example: [{"title": "The Great Gatsby", "genre": "Fiction"}]
 *       404:
 *         description: Author not found.
 */
router.get("/:id/books", async (req, res) => {
  const authorBooks = await service.getAuthorsBooksById(req.params.id);
  if (authorBooks === undefined)
    res.status(404).json("no record with given id: " + req.params.id);
  else res.send(authorBooks);
});

/**
 * @swagger
 * /api/authors/{id}:
 *   get:
 *     summary: Retrieve a specific author by ID.
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the author to retrieve.
 *         example: 123
 *     responses:
 *       200:
 *         description: The requested author.
 *         content:
 *           application/json:
 *             example: {"name": "Jane Doe", "country": "USA"}
 *       404:
 *         description: Author not found.
 */
router.get("/:id", async (req, res) => {
  const author = await service.getAuthorById(req.params.id);
  if (author === undefined)
    res.status(404).json("no record with given id: " + req.params.id);
  else res.send(author);
});

/**
 * @swagger
 * /api/authors/{id}:
 *   delete:
 *     summary: Delete an author by ID.
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the author to delete.
 *         example: 123
 *     responses:
 *       200:
 *         description: Author deleted successfully.
 *       404:
 *         description: Author not found.
 */
router.delete("/:id", async (req, res) => {
  const affectedRows = await service.deleteAuthor(req.params.id);
  if (affectedRows === 0)
    res.status(404).json("no record with given id: " + req.params.id);
  else res.send("deleted successfully");
});

/**
 * @swagger
 * /api/authors:
 *   post:
 *     summary: Add a new author.
 *     tags: [Authors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example: {"name": "Jane Doe", "country": "USA"}
 *     responses:
 *       201:
 *         description: Author created successfully.
 */
router.post("/", async (req, res) => {
  await service.addOrEditAuthor(req.body);
  res.status(201).send("created successfully");
});

/**
 * @swagger
 * /api/authors/{id}:
 *   put:
 *     summary: Update an author by ID.
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the author to update.
 *         example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example: {"name": "Updated Name", "country": "Updated Country"}
 *     responses:
 *       200:
 *         description: Author updated successfully.
 *       404:
 *         description: Author not found.
 */
router.put("/:id", async (req, res) => {
  const affectedRows = await service.addOrEditAuthor(req.body, req.params.id);
  if (affectedRows === 0)
    res.status(404).json("no record with given id: " + req.params.id);
  else res.send("updated successfully");
});

module.exports = router;
