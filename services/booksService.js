//bookService.js
const db = require("../db");
const nodemailer = require("nodemailer");

module.exports.getAllBooks = async () => {
  const [rows] = await db.query("SELECT * FROM books");
  return rows;
};

module.exports.getBookById = async (id) => {
  const [[row]] = await db.query("SELECT * FROM books WHERE id = ?", [id]);
  return row;
};

module.exports.deleteBook = async (id) => {
  const [{ affectedRows }] = await db.query("DELETE FROM books WHERE id = ?", [
    id,
  ]);
  return affectedRows;
};

module.exports.addOrEditBook = async (obj, id = 0) => {
  // Validation checks
  if (!validateName(obj.Name)) {
    throw new Error(
      "Invalid Name. Must be a string with length between 2 and 30 characters.",
    );
  }

  if (!validateAuthor(obj.Author)) {
    throw new Error(
      "Invalid Author. Must be a string with length between 2 and 30 characters.",
    );
  }

  if (!validatePublishYear(obj.Publish_Year)) {
    throw new Error(
      "Invalid Publish Year. Must be an integer between 1900 and 2024.",
    );
  }

  if (!validatePagesCount(obj.Pages_Count)) {
    throw new Error(
      "Invalid Pages Count. Must be an integer between 3 and 1300.",
    );
  }

  if (!validatePrice(obj.Price)) {
    throw new Error("Invalid Price. Must be a decimal between 0 and 150000.");
  }

  const [[[{ affectedRows }]]] = await db.query(
    "CALL usp_book_add_or_edit(?,?,?,?,?,?)",
    [id, obj.Name, obj.Author, obj.Publish_Year, obj.Pages_Count, obj.Price],
  );

  if (affectedRows > 0) {
    // Book added successfully, send email notification
    sendEmailNotification(obj.Name, obj.Author);
  }

  return affectedRows;
};

// Validation functions
function validateName(name) {
  return typeof name === "string" && name.length >= 2 && name.length <= 30;
}

function validateAuthor(author) {
  return (
    typeof author === "string" && author.length >= 2 && author.length <= 30
  );
}

function validatePublishYear(publishYear) {
  return (
    Number.isInteger(publishYear) && publishYear >= 1900 && publishYear <= 2024
  );
}

function validatePagesCount(pagesCount) {
  return Number.isInteger(pagesCount) && pagesCount >= 3 && pagesCount <= 1300;
}

function validatePrice(price) {
  return typeof price === "number" && price >= 0 && price <= 150000;
}

function sendEmailNotification(bookName, author) {
  // Create a Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "email@gmail.com",
      pass: "",
    },
  });

  // Setup email data
  const mailOptions = {
    from: "email@gmail.com",
    to: "email@gmail.com",
    subject: "New Book Added to Library",
    text: `A new book "${bookName}" by ${author} has been added to the library.`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}
