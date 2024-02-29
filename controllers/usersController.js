// controllers/usersController.js
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
const nodemailer = require("nodemailer");
const moment = require("moment");
const { secret, emailFrom, pass } = require("../config");

// Helper function to generate JWT token

const generateAccessToken = (id, roles) => {
  const payLoad = {
    id,
    roles,
  };
  return jwt.sign(payLoad, secret, { expiresIn: "24h" });
};

module.exports.registerUser = async (
  username,
  password,
  email,
  role = "user",
) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [{ affectedRows, insertId }] = await db.query(
    "INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)",
    [username, hashedPassword, email, role],
  );

  return { affectedRows, userId: insertId };
};

module.exports.getUsers = async (req, res) => {
  try {
    const [[users]] = await db.query("SELECT * FROM users");
    res.json(users);
  } catch (e) {
    console.log(e);
  }
};

module.exports.getUserByUsername = async (req, res) => {
  try {
    const { username, password } = req.body;
    const [[user]] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (!user) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      const token = generateAccessToken(user.id, user.role);
      res.cookie("roles", user.role, { httpOnly: true });
      res.cookie("userId", user.id, { httpOnly: true });

      return res.json({
        token,
        message: user.id + " " + user.role,
      });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update user service in bookService.js
module.exports.assignRoleToUser = async (res, userId, roleName) => {
  const validRoles = ["user", "manager", "admin"];

  if (!validRoles.includes(roleName)) {
    throw new Error(`Invalid role: ${roleName}`);
  }

  const [{ affectedRows }] = await db.query(
    "UPDATE users SET role = ? WHERE id = ?",
    [roleName, userId],
  );
  res.cookie("roles", roleName, { httpOnly: true });
  return affectedRows;
};

module.exports.getUserRole = async (userId) => {
  const [[user]] = await db.query("SELECT role FROM users WHERE id = ?", [
    userId,
  ]);
  return user ? user.role : null;
};

module.exports.generateOTP = async (userId) => {
  const otp = crypto.randomInt(100000, 999999).toString();

  // Store the OTP in database with an expiry time 10 minutes
  const expiryTime = moment().add(10, "minutes").format("YYYY-MM-DD HH:mm:ss");
  console.log(expiryTime);

  // Save OTP and expiry time in the database
  await db.query(
    "INSERT INTO otp_cache (user_id, otp, expiry_time) VALUES (?, ?, ?)",
    [userId, otp, expiryTime],
  );

  return otp;
};

module.exports.checkOTP = async (userId, otp) => {
  // Retrieve the OTP and expiry time from the database
  const [[result]] = await db.query(
    "SELECT * FROM otp_cache WHERE user_id = ?",
    [userId],
  );
  console.log(result.id);

  const currentDateTime = moment();
  const expiryTime = moment(result.expiry_time, "YYYY-MM-DD HH:mm:ss");

  if (!result || result.otp !== otp || currentDateTime.isAfter(expiryTime)) {
    // Invalid OTP or expired
    return false;
  }

  // Clear the OTP from the cache (since it's a one-time use)
  await db.query("DELETE FROM otp_cache WHERE user_id = ?", [userId]);

  return true;
};

module.exports.sendRecoveryEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailFrom,
      pass: pass,
    },
  });

  // Email options
  const mailOptions = {
    from: emailFrom,
    to: email,
    subject: "Password Recovery OTP",
    text: `Your OTP for password recovery is: ${otp}. It will expire in 10 minutes.`,
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log("Password recovery email sent successfully.");
  } catch (error) {
    console.error("Error sending password recovery email:", error);
    throw new Error("Failed to send recovery email");
  }
};
