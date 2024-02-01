const express = require('express'),
    router = express.Router()

const service = require('../services/authorsService')

//http://localhost:3000/api/authors/
router.get('/', async (req, res) => {
    const authors = await service.getAllAuthors()
    res.send(authors)
})

router.get('/books', async (req, res) => {
    const authorsBooks = await service.getAuthorsBooks()
    res.send(authorsBooks)
})

router.get('/:id/books', async (req, res) => {
    const authorBooks = await service.getAuthorsBooksById(req.params.id)
    if (authorBooks === undefined)
        res.status(404).json("no record with given id: "+req.params.id)
    else
        res.send(authorBooks)
})

router.get('/:id', async (req, res) => {
    const author = await service.getAuthorById(req.params.id)
    if (author === undefined)
        res.status(404).json("no record with given id: "+req.params.id)
    else
        res.send(author)
})

router.delete('/:id', async (req, res) => {
    const affectedRows = await service.deleteAuthor(req.params.id)
    if (affectedRows === 0)
        res.status(404).json("no record with given id: "+req.params.id)
    else
        res.send("deleted successfully")
})

router.post('/', async (req, res) => {
    await service.addOrEditAuthor(req.body)
    res.status(201).send("created successfully")
})

router.put('/:id', async (req, res) => {
    const affectedRows = await service.addOrEditAuthor(req.body, req.params.id)
    if (affectedRows === 0)
        res.status(404).json("no record with given id: "+req.params.id)
    else
        res.send("updated successfully")
})

module.exports = router;