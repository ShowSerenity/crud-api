const express = require('express'),
    app = express();

const db = require('./db'),
    bookRoutes = require('./controllers/booksController')

//middleware
app.use('/api/books', bookRoutes)

//making sure db connection is successful
//then starting the express server
db.query("SELECT 1")
    .then(() => {
        console.log("db connection succeeded")
        app.listen(3000, () => console.log("server started at 3000"))
    })
    .catch(err => console.log("db connection failed. \n"+err))