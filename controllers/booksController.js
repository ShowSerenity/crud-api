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

router.get('/filter/parameters', async (req, res) => {
    try {
        const price_param = req.query.price;
        const reverseSort = req.query.reverseSort;
        const priceOption = req.query.priceOption;
        const limit_param = req.query.limit;
        const page_param = parseInt(req.query.page) || 1;

        const startIndex = 0;
        const endIndex = page_param * limit_param;

        // Get filtered books based on query parameters
        const filteredBooks = service.getFilterBooks(price_param, priceOption, reverseSort, limit_param, startIndex, endIndex);

        if (Array.isArray(filteredBooks)) {
            const response = {
                totalFilteredBooks: filteredBooks.length,
                filteredBooks: filteredBooks.slice(startIndex, endIndex),
                currentPage: page_param,
                totalPages: Math.ceil(filteredBooks.length / limit_param),
            };

            res.json(response);
        } else {
            res.status(200).json({ message: "Invalid data structure for filtered books" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

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