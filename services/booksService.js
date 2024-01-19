const db = require('../db')
const excelJS = require("exceljs");
var arraySort = require('array-sort');
let books = [];

module.exports.getAllBooks = async () => {
    let query = "SELECT * FROM books"
    const [rows] = await db.query("SELECT * FROM books")
    return rows;
}

module.exports.getFilter = async (price_param, priceOption, reverseSort, limit_param, startIndex, endIndex) => {
    if (typeof price_param !== 'undefined' || typeof priceOption !== 'undefined') {
        if (priceOption === 'more') {
            filtered_books = filtered_books.filter(book => book.Price > price_param);
        } else if (priceOption === 'less') {
            filtered_books = filtered_books.filter(book => book.Price < price_param);
        }
    }
    const [[row]] = await db.query("SELECT * FROM books WHERE Name Like = ?", [id])
    return row;


}

module.exports.getFilterBooks = async (price_param, priceOption, reverseSort, limit_param, startIndex, endIndex) => {
    let filtered_books = books;
    filtered_books = exports.getAllBooks()

    if (typeof price_param !== 'undefined' || typeof priceOption !== 'undefined') {
        if (priceOption === 'more') {
            filtered_books = filtered_books.filter(book => book.Price > price_param);
        } else if (priceOption === 'less') {
            filtered_books = filtered_books.filter(book => book.Price < price_param);
        }
    }

    if (typeof reverseSort !== 'undefined') {
        arraySort(filtered_books, 'price', {reverse: true});
    } else {
        arraySort(filtered_books, 'price', {reverse: false});
    }

    filtered_books = filtered_books.slice(startIndex, endIndex);

    return filtered_books
}

module.exports.getBookById = async (id) => {
    const [[row]] = await db.query("SELECT * FROM books WHERE id = ?", [id])
    return row;
}

module.exports.deleteBook = async (id) => {
    const [{affectedRows}] = await db.query("DELETE FROM books WHERE id = ?", [id])
    return affectedRows;
}

module.exports.addOrEditBook = async (obj, id = 0) => {
    // Validation checks
    if (!validateName(obj.Name)) {
        throw new Error('Invalid Name. Must be a string with length between 2 and 30 characters.');
    }

    if (!validateAuthor(obj.Author)) {
        throw new Error('Invalid Author. Must be a string with length between 2 and 30 characters.');
    }

    if (!validatePublishYear(obj.Publish_Year)) {
        throw new Error('Invalid Publish Year. Must be an integer between 1900 and 2024.');
    }

    if (!validatePagesCount(obj.Pages_Count)) {
        throw new Error('Invalid Pages Count. Must be an integer between 3 and 1300.');
    }

    if (!validatePrice(obj.Price)) {
        throw new Error('Invalid Price. Must be a decimal between 0 and 150000.');
    }

    const [[[{ affectedRows }]]] = await db.query("CALL usp_book_add_or_edit(?,?,?,?,?,?)",
        [id, obj.Name, obj.Author, obj.Publish_Year, obj.Pages_Count, obj.Price]);

    return affectedRows;
};

// Validation functions
function validateName(name) {
    return typeof name === 'string' && name.length >= 2 && name.length <= 30;
}

function validateAuthor(author) {
    return typeof author === 'string' && author.length >= 2 && author.length <= 30;
}

function validatePublishYear(publishYear) {
    return Number.isInteger(publishYear) && publishYear >= 1900 && publishYear <= 2024;
}

function validatePagesCount(pagesCount) {
    return Number.isInteger(pagesCount) && pagesCount >= 3 && pagesCount <= 1300;
}

function validatePrice(price) {
    return typeof price === 'number' && price >= 0 && price <= 150000;
}
