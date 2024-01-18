const express = require('express'),
    router = express.Router()

const service = require('../services/genresService')

//http://localhost:3000/api/genres/
router.get('/', async (req, res) => {
    const genres = await service.getAllGenres()
    res.send(genres)
})

router.get('/:id', async (req, res) => {
    const genre = await service.getGenreById(req.params.id)
    if (genre === undefined)
        res.status(404).json("no record with given id: "+req.params.id)
    else
        res.send(genre)
})

router.delete('/:id', async (req, res) => {
    const affectedRows = await service.deleteGenre(req.params.id)
    if (affectedRows === 0)
        res.status(404).json("no record with given id: "+req.params.id)
    else
        res.send("deleted successfully")
})

router.post('/', async (req, res) => {
    await service.addOrEditGenre(req.body)
    res.status(201).send("created successfully")
})

router.put('/:id', async (req, res) => {
    const affectedRows = await service.addOrEditGenre(req.body, req.params.id)
    if (affectedRows === 0)
        res.status(404).json("no record with given id: "+req.params.id)
    else
        res.send("updated successfully")
})

module.exports = router;