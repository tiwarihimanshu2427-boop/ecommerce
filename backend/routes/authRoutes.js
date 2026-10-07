const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const router = express.Router();

/* =====================================================
   JWT SECRET
===================================================== */

const JWT_SECRET =
  process.env.JWT_SECRET || "shopnest-secret-key";

/* =====================================================
   USER REGISTER
===================================================== */

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      password
    } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobile.trim();

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1 OR mobile = $2",
      [cleanEmail, cleanMobile]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email or mobile number already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users
       (name, email, mobile, password)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, mobile, role`,
      [
        name.trim(),
        cleanEmail,
        cleanMobile,
        hashedPassword
      ]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role || "user"
      },
      JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message
    });
  }
});


/* =====================================================
   USER LOGIN
===================================================== */

router.post("/login", async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role || "user"
      },
      JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    delete user.password;

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message
    });
  }
});


/* =====================================================
   ADMIN LOGIN
===================================================== */

router.post("/admin-login", async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    const adminEmail = "admin@shopnest.com";
    const adminPassword = "admin123";

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Admin email and password are required"
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (
      cleanEmail !== adminEmail ||
      password !== adminPassword
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password"
      });
    }

    /* ================================================
       CREATE REAL ADMIN JWT
    ================================================= */

    const token = jwt.sign(
      {
        id: "admin",
        email: adminEmail,
        role: "admin"
      },
      JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    const admin = {
      id: "admin",
      name: "ShopNest Admin",
      email: adminEmail,
      role: "admin"
    };

    console.log("=================================");
    console.log("ADMIN LOGIN SUCCESS");
    console.log("EMAIL:", adminEmail);
    console.log("ROLE:", "admin");
    console.log(
      "TOKEN CREATED:",
      token ? "YES" : "NO"
    );
    console.log("=================================");

    return res.status(200).json({
      success: true,
      message: "Admin login successful",

      // IMPORTANT
      token: token,

      admin: admin
    });

  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Admin login failed",
      error: error.message
    });
  }
});


/* =====================================================
   AUTH TEST
===================================================== */

router.get("/me", async (req, res) => {
  return res.json({
    success: true,
    message: "Auth route working"
  });
});


module.exports = router;