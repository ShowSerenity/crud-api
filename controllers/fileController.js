const excelJS = require("exceljs");
const { getAllBooks } = require("../services/booksService");
const fs = require("fs");
const excelReader = require("../services/excelReaderService");

/**
 * @swagger
 * tags:
 *   name: File
 *   description: API operations related to file export/import
 */

/**
 * @swagger
 * /api/books/download/excel:
 *   get:
 *     summary: Download books data in Excel format.
 *     tags: [File]
 *     responses:
 *       200:
 *         description: Excel file containing books data.
 */
const exportFile = async (req, res) => {
  const workbook = new excelJS.Workbook(); // Create a new workbook
  const worksheet = workbook.addWorksheet("Books"); // New Worksheet
  const path = "C:/Users/asana/WebStormProjects/crud-api"; // Path to download excel

  // Column for data in excel. key must match data key
  worksheet.columns = [
    { header: "id", key: "id", width: 10 },
    { header: "Name", key: "Name", width: 10 },
    { header: "Author", key: "Author", width: 10 },
    { header: "Publish_Year", key: "Publish_Year", width: 10 },
    { header: "Pages_Count", key: "Pages_Count", width: 10 },
    { header: "Price", key: "Price", width: 10 },
  ];

  // Get all books from the database
  const books = await getAllBooks();

  // Create a new array of objects with modified id property
  const booksWithId = books.map((book, index) => ({
    ...book,
    id: index + 1,
  }));

  // Looping through User data
  booksWithId.forEach((book) => {
    worksheet.addRow(book);
  });

  // Making the first line in excel bold
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  try {
    await workbook.xlsx.writeFile(`${path}/downloadedBooks.xlsx`);
    res.sendFile(`${path}/downloadedBooks.xlsx`);
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

/**
 * @swagger
 * /api/books/upload/excel:
 *   get:
 *     summary: Upload books data in Excel format.
 *     tags: [File]
 *     responses:
 *       200:
 *         description: Excel file successfully uploaded.
 */
exports.uploadFile = async (req, res) => {
  try {
    const filePath = excelReader.getExcelFile();

    fs.exists(filePath, function (exists) {
      if (exists) {
        res.sendFile(filePath);
        return;
      }
      res.status(400).send("ERROR: File does not exist");
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

/**
 * @swagger
 * /api/books/add:
 *   post:
 *     summary: Add a new book from Excel file.
 *     tags: [File]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example: {"title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "genre": "Fiction"}
 *     responses:
 *       200:
 *         description: Book added successfully.
 */
exports.addBook = (book_body) => {
  // Implementation for adding a new book from Excel file
  book_body.id = id++;
  books.push(book_body);
  return message;
};

module.exports = exportFile;
