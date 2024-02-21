const db = require("../db");

module.exports.getAllAuthors = async () => {
  const [rows] = await db.query("SELECT * FROM authors");
  return rows;
};

module.exports.getAuthorById = async (id) => {
  const [[row]] = await db.query("SELECT * FROM authors WHERE id = ?", [id]);
  return row;
};

module.exports.deleteAuthor = async (id) => {
  const [{ affectedRows }] = await db.query(
    "DELETE FROM authors WHERE id = ?",
    [id],
  );
  return affectedRows;
};

module.exports.addOrEditAuthor = async (obj, id = 0) => {
  const [[[{ affectedRows }]]] = await db.query(
    "CALL usp_author_add_or_edit(?,?,?,?)",
    [id, obj.Surname, obj.Name, obj.Birthday],
  );
  return affectedRows;
};

module.exports.getAuthorsBooks = async () => {
  const [rows] = await db.query(
    "SELECT \n" +
      "CONCAT(authors.Name, ' ', authors.Surname) AS Author, \n" +
      "books.Name AS BookName, \n" +
      "books.Publish_Year, \n" +
      "books.Pages_Count, \n" +
      "books.Price \n" +
      "FROM authors \n" +
      "LEFT JOIN \n" +
      "books ON CONCAT(authors.Name, ' ', authors.Surname) = books.Author;",
  );
  return rows;
};

module.exports.getAuthorsBooksById = async (id) => {
  const [row] = await db.query(
    "SELECT \n" +
      "CONCAT(authors.Name, ' ', authors.Surname) AS Author, \n" +
      "books.Name AS BookName, \n" +
      "books.Publish_Year, \n" +
      "books.Pages_Count, \n" +
      "books.Price, \n" +
      "books.id \n" +
      "FROM authors \n" +
      "JOIN \n" +
      "books ON CONCAT(authors.Name, ' ', authors.Surname) = books.Author \n" +
      "WHERE authors.id = ?;",
    [id],
  );
  return row;
};
