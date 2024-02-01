//booksController
const express = require('express'),
    router = express.Router()

const service = require('../services/booksService')
const exportFile = require("../controllers/fileController");

//http://localhost:3000/api/books/
router.get('/', async (req, res) => {
    const books = await service.getAllBooks()
    res.send(books)
})

router.get('/:id', async (req, res) => {
    const book = await service.getBookById(req.params.id)
    if (book === undefined)
        res.status(404).json("no record with given id: "+req.params.id)
    else
        res.send(book)
})

router.delete('/:id', async (req, res) => {
    const affectedRows = await service.deleteBook(req.params.id)
    if (affectedRows === 0)
        res.status(404).json("no record with given id: "+req.params.id)
    else
        res.send("deleted successfully")
})

router.post('/', async (req, res) => {
    await service.addOrEditBook(req.body)
    res.status(201).send("created successfully")
})

router.put('/:id', async (req, res) => {
    const affectedRows = await service.addOrEditBook(req.body, req.params.id)
    if (affectedRows === 0)
        res.status(404).json("no record with given id: "+req.params.id)
    else
        res.send("updated successfully")
})

router.get('/download/excel', exportFile)

module.exports = router;