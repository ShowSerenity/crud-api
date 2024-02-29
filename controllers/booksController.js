//bookService.js
const db = require("../db");
const nodemailer = require("nodemailer");
const { emailFrom, emailTo, pass } = require("../config");

module.exports.getAllBooks = async () => {
  const [rows] = await db.query("SELECT * FROM books");
  return rows;
};

module.exports.getBookById = async (id) => {
  const [[row]] = await db.query("SELECT * FROM books WHERE id = ?", [id]);
  return row;
};

module.exports.deleteBook = async (req, res, id) => {
  if (req.cookies.roles === "admin") {
    const [{ affectedRows }] = await db.query(
      "DELETE FROM books WHERE id = ?",
      [id],
    );
    return affectedRows;
  } else {
    return res.json({ message: "access denied" });
  }
};

module.exports.addOrEditBook = async (req, res, obj, id = 0) => {
  if (req.cookies.roles === "admin" || req.cookies.roles === "manager") {
    const [[[{ affectedRows }]]] = await db.query(
      "CALL usp_book_add_or_edit(?,?,?,?,?,?)",
      [id, obj.Name, obj.Author, obj.Publish_Year, obj.Pages_Count, obj.Price],
    );

    if (affectedRows > 0) {
      // Book added successfully, send email notification
      sendEmailNotification(obj.Name, obj.Author);
    }

    return affectedRows;
  } else {
    return res.json({ message: "access denied" });
  }
};

function sendEmailNotification(bookName, author) {
  // Create a Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailFrom,
      pass: pass,
    },
  });

  // Setup email data
  const mailOptions = {
    from: emailFrom,
    to: emailTo,
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
