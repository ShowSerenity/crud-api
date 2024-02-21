/**
 * @swagger
 * tags:
 *   name: Genres
 *   description: API operations related to genres
 */

const express = require("express");
const router = express.Router();

const service = require("../services/genresService");

/**
 * @swagger
 * /api/genres:
 *   get:
 *     summary: Retrieve all genres.
 *     tags: [Genres]
 *     responses:
 *       200:
 *         description: A list of genres.
 *         content:
 *           application/json:
 *             example: [{"name": "Fiction"}, {"name": "Mystery"}]
 */
router.get("/", async (req, res) => {
  const genres = await service.getAllGenres();
  res.send(genres);
});

/**
 * @swagger
 * /api/genres/books:
 *   get:
 *     summary: Retrieve all genres and their books.
 *     tags: [Genres]
 *     responses:
 *       200:
 *         description: A list of genres with their books.
 *         content:
 *           application/json:
 *             example: [{"name": "Fiction", "books": [...] }]
 */
router.get("/books", async (req, res) => {
  const genresBooks = await service.getGenresBooks();
  res.send(genresBooks);
});

/**
 * @swagger
 * /api/genres/{id}/books:
 *   get:
 *     summary: Retrieve books by genre ID.
 *     tags: [Genres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the genre to retrieve books.
 *         example: 123
 *     responses:
 *       200:
 *         description: Books of the requested genre.
 *         content:
 *           application/json:
 *             example: [{"title": "The Great Gatsby"}, {"title": "Sherlock Holmes"}]
 *       404:
 *         description: Genre not found.
 */
router.get("/:id/books", async (req, res) => {
  const genreBooks = await service.getGenresBooksById(req.params.id);
  if (genreBooks === undefined)
    res.status(404).json("no record with given id: " + req.params.id);
  else res.send(genreBooks);
});

/**
 * @swagger
 * /api/genres/{id}:
 *   get:
 *     summary: Retrieve a specific genre by ID.
 *     tags: [Genres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the genre to retrieve.
 *         example: 123
 *     responses:
 *       200:
 *         description: The requested genre.
 *         content:
 *           application/json:
 *             example: {"name": "Fiction"}
 *       404:
 *         description: Genre not found.
 */
router.get("/:id", async (req, res) => {
  const genre = await service.getGenreById(req.params.id);
  if (genre === undefined)
    res.status(404).json("no record with given id: " + req.params.id);
  else res.send(genre);
});

/**
 * @swagger
 * /api/genres/{id}:
 *   delete:
 *     summary: Delete a genre by ID.
 *     tags: [Genres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the genre to delete.
 *         example: 123
 *     responses:
 *       200:
 *         description: Genre deleted successfully.
 *       404:
 *         description: Genre not found.
 */
router.delete("/:id", async (req, res) => {
  const affectedRows = await service.deleteGenre(req.params.id);
  if (affectedRows === 0)
    res.status(404).json("no record with given id: " + req.params.id);
  else res.send("deleted successfully");
});

/**
 * @swagger
 * /api/genres:
 *   post:
 *     summary: Add a new genre.
 *     tags: [Genres]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example: {"name": "Mystery"}
 *     responses:
 *       201:
 *         description: Genre created successfully.
 */
router.post("/", async (req, res) => {
  await service.addOrEditGenre(req.body);
  res.status(201).send("created successfully");
});

/**
 * @swagger
 * /api/genres/{id}:
 *   put:
 *     summary: Update a genre by ID.
 *     tags: [Genres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the genre to update.
 *         example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example: {"name": "Updated Genre Name"}
 *     responses:
 *       200:
 *         description: Genre updated successfully.
 *       404:
 *         description: Genre not found.
 */
router.put("/:id", async (req, res) => {
  const affectedRows = await service.addOrEditGenre(req.body, req.params.id);
  if (affectedRows === 0)
    res.status(404).json("no record with given id: " + req.params.id);
  else res.send("updated successfully");
});

module.exports = router;
