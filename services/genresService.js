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