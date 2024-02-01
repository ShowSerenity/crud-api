const db = require('../db')

module.exports.getAllGenres = async () => {
    const [rows] = await db.query("SELECT * FROM genres")
    return rows;
}

module.exports.getGenreById = async (id) => {
    const [[row]] = await db.query("SELECT * FROM genres WHERE id = ?", [id])
    return row;
}

module.exports.deleteGenre = async (id) => {
    const [{affectedRows}] = await db.query("DELETE FROM genres WHERE id = ?", [id])
    return affectedRows;
}

module.exports.addOrEditGenre = async (obj, id = 0) => {
    const [[[{affectedRows}]]] = await db.query("CALL usp_genre_add_or_edit(?,?)",
        [id, obj.Name])
    return affectedRows;
}

module.exports.getGenresBooks = async () => {
    const [rows] = await db.query("SELECT \n" +
    "genres.Name AS Genre, \n" +
        "books.Name AS BookName, \n" +
        "books.Publish_Year, \n" +
        "books.Pages_Count, \n" +
        "books.Price \n" +
    "FROM genres \n" +
    "JOIN books \n" +
    "ON genres.Name = books.Genre")
    return rows;
}

module.exports.getGenresBooksById = async (id) => {
    const [row] = await db.query("SELECT \n" +
        "genres.Name AS Genre, \n" +
        "books.Name AS BookName, \n" +
        "books.Publish_Year, \n" +
        "books.Pages_Count, \n" +
        "books.Price, \n" +
        "books.id \n" +
        "FROM genres \n" +
        "JOIN books \n" +
        "ON genres.Name = books.Genre WHERE genres.id = ?;", [id])
    return row;
}