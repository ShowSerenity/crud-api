const express = require('express'),
    router = express.Router()

const db = require('../db')

//http:localhost:3000/api/books/
router.get('/', async (req, res) => {
    await db.query("SELECT * FROM books")
        .catch(err => console.log(err))
})

module.exports = router;