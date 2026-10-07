const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Temporary admin account
// Database connect hone ke baad isko PostgreSQL se replace karenge.
const ADMIN_EMAIL = "admin@ecommerce.com";
const ADMIN_PASSWORD = "Admin@123";

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password",
      });
    }

    const token = jwt.sign(
      {
        email: ADMIN_EMAIL,
        role: "admin",
      },
      process.env.JWT_SECRET || "ecommerce_secret_key",
      {
        expiresIn: "1d",
      }
    );

    res.json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        email: ADMIN_EMAIL,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;