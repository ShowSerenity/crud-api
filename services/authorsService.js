const db = require('../db')

module.exports.getAllAuthors = async () => {
    const [rows] = await db.query("SELECT * FROM authors")
    return rows;
}

module.exports.getAuthorById = async (id) => {
    const [[row]] = await db.query("SELECT * FROM authors WHERE id = ?", [id])
    return row;
}

module.exports.deleteAuthor = async (id) => {
    const [{affectedRows}] = await db.query("DELETE FROM authors WHERE id = ?", [id])
    return affectedRows;
}

module.exports.addOrEditAuthor = async (obj, id = 0) => {
    const [[[{affectedRows}]]] = await db.query("CALL usp_author_add_or_edit(?,?,?,?)",
        [id, obj.Surname, obj.Name, obj.Birthday])
    return affectedRows;
}