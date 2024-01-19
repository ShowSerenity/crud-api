const xlsx = require('xlsx');
const fileController = require('../controllers/fileController');
const Book = require('../models/bookModel')
const booksService = require('../services/booksService')

exports.readAll = (excelFile) => {
    const workbook = xlsx.readFile(excelFile);

    const bookSheetName = workbook.SheetNames[0];
    const bookWorksheet = workbook.Sheets[bookSheetName];
    const bookFromExcel = xlsx.utils.sheet_to_json(bookWorksheet);

    bookFromExcel.forEach(bookData => {
        const bookObject = Book.create(
            bookData.Name,
            bookData.Author,
            parseInt(bookData.Publish_Year),
            parseInt(bookData.Page_Count),
            parseInt(bookData.Price)
        );
        const result = fileController.addBook(bookObject);
        console.log(result);
    })
}

exports.getExcelFile = () => {
    const books = booksService.getAllBooks();

    const workSheetBook = xlsx.utils.json_to_sheet(books);

    const workBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workBook, workSheetBook, 'Book')

    const filePath = 'export_data.xlsx';

    xlsx.writeFile(workBook, filePath);

    return filePath;
}