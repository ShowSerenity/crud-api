const excelJS = require("exceljs");
const {getAllBooks} = require("../services/booksService");
const fs = require("fs");
const excelReader = require('../services/excelReaderService')

const exportFile = async (req, res) => {
    const workbook = new excelJS.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet("Books"); // New Worksheet
    const path = "C:/Users/asana/WebStormProjects/crud-api";  // Path to download excel
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

    // Making first line in excel bold
    worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
    });
    try {
        const data = await workbook.xlsx.writeFile(`${path}/downloadedBooks.xlsx`)
            .then(() => {
                res.send({
                    status: "success",
                    message: "file successfully downloaded",
                    path: `${path}/downloadedBooks.xlsx`,
                });
            });
    } catch (err) {
        res.send({
            status: "error",
            message: "Something went wrong",
        });
    }
};

exports.uploadFile = async (req, res) => {
    try {
        const filePath = excelReader.getExcelFile();

        fs.exists(filePath, function (exists) {
            if (exists) {
                res.writeHead(200, {
                    "Content-Type": "application/octet-stream",
                    "Content-Disposition": "attachment; filename=" + "fake_library_data.xlsx"
                });
                fs.createReadStream(filePath).pipe(res);
                return;
            }
            res.writeHead(400, { "Content-Type": "text/plain" });
            res.end("ERROR File does not exist");
        });
    } catch (err) {
        res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message: error.message});
    }
}

exports.addBook = (book_body) => {

    book_body.id = id++;
    books.push(book_body);
    return message;
}

module.exports = exportFile;