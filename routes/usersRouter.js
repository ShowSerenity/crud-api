// routes/userRouter.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/usersController");
const db = require("../db");
const bcrypt = require("bcrypt");
const speakeasy = require("speakeasy");
const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");
const qrcode = require("qrcode");
const jsonDB = new JsonDB(new Config("myDatabase", true, false, "/"));
require("dotenv").config();

// Get users
router.get("/", controller.getUsers);

router.post("/two-factor/add", (req, res) => {
  const id = req.cookies.userId;
  try {
    const path = `/user/${id}`;
    const temp_secret = speakeasy.generateSecret();
    jsonDB.push(path, { id, temp_secret });
    res.json({ id, secret: temp_secret.base32 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error generating the secret" });
  }
});

// Verify token and make secret permanent
router.post("/two-factor/verify", async (req, res) => {
  const { token } = req.body;
  const userId = req.cookies.userId;

  try {
    const path = `/user/${userId}`;
    const user = await jsonDB.getData(path);
    console.log("User Object:", user);
    const { base32: secret } = user.temp_secret;

    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
    });

    if (verified) {
      jsonDB.push(path, { id: userId, secret: user.temp_secret });
      res.json({ verified: true });
    } else {
      res.json({ verified: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error finding user" });
  }
});

// Validate token
router.post("/two-factor/validate", async (req, res) => {
  const { token } = req.body;
  const userId = req.cookies.userId;

  try {
    const path = `/user/${userId}`;
    const user = await jsonDB.getData(path);

    const { base32: secret } = user.secret;

    const tokenValidates = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (tokenValidates) {
      res.json({ validated: true });
    } else {
      res.json({ validated: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error finding user" });
  }
});

router.get("/two-factor/qr", async (req, res) => {
  const userId = req.cookies.userId;

  try {
    const path = `/user/${userId}`;
    const user = await jsonDB.getData(path);

    const twoFactorURL = user.secret.otpauth_url;

    // Create QR code and send as HTML response
    qrcode.toDataURL(twoFactorURL, (err, qrDataUrl) => {
      if (err) {
        console.error("Error generating QR code:", err);
        res.status(500).send("Error generating QR code");
        return;
      }

      // Send HTML response with the QR code image
      const htmlResponse = `
      <html lang="en">
        <body>
          <p>Scan the QR code with your authenticator app:</p>
          <img src="${qrDataUrl}" alt="QR Code">
        </body>
      </html>
    `;

      res.send(htmlResponse);
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error generating QR code" });
  }
});

router.post("/register", async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const { affectedRows, userId } = await controller.registerUser(
      username,
      password,
      email,
    );
    if (affectedRows > 0) {
      res.status(201).json({ userId, message: "User registered successfully" });
    } else {
      res.status(500).json({ message: "User registration failed" });
    }
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Login user
router.post("/login", controller.getUserByUsername);

// Assign role to user
router.post("/assign-role/:userId/:roleName", async (req, res) => {
  const { userId, roleName } = req.params;
  try {
    const affectedRows = await controller.assignRoleToUser(
      res,
      userId,
      roleName,
    );
    if (affectedRows > 0) {
      res.status(200).json({ message: "Role assigned successfully" });
    } else {
      res
        .status(404)
        .json({ message: "User not found or role does not exist" });
    }
  } catch (error) {
    console.error("Error assigning role to user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get user role
router.get("/user-role/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const role = await controller.getUserRole(userId);
    if (role) {
      res.status(200).json({ role });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error getting user role:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/request-password-recovery", async (req, res) => {
  const { username } = req.body;
  try {
    const [[user]] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = await controller.generateOTP(user.id);
    // Send the OTP to the user via email
    await controller.sendRecoveryEmail(user.email, otp); // Implement this function

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error requesting password recovery:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { username, otp, newPassword, currentPassword } = req.body;

  // Check if either OTP or currentPassword is provided
  if ((!otp && !currentPassword) || (otp && currentPassword)) {
    return res.status(400).json({
      message: "Provide either OTP or current password, but not both",
    });
  }

  try {
    const [[user]] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (otp) {
      // Check if the OTP is valid
      const isValidOTP = await controller.checkOTP(user.id, otp);

      if (!isValidOTP) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
    }

    if (currentPassword) {
      // Check if the current password matches
      const passwordMatch = await bcrypt.compare(
        currentPassword,
        user.password,
      );

      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid current password" });
      }
    }

    // Update the user's password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedNewPassword,
      user.id,
    ]);

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
