const express = require('express'),
    app = express();
    bodyparser = require('body-parser');
require('express-async-errors')

const db = require('./db'),
    bookRoutes = require('./controllers/booksController')
    authorRoutes = require('./controllers/authorsController')
    genreRoutes = require('./controllers/genresController')

//middleware
app.use(bodyparser.json())

app.use('/api/books', bookRoutes)
app.use('/api/authors', authorRoutes)
app.use('/api/genres', genreRoutes)

app.use((err, req, res, next) => {
    console.log(err)
    res.status(err.status || 500).send("Something went wrong!")
})

//making sure db connection is successful
//then starting the express server
db.query("SELECT 1")
    .then(() => {
        console.log("db connection succeeded")
        app.listen(3000, () => console.log("server started at 3000"))
    })
    .catch(err => console.log("db connection failed. \n"+err))