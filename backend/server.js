const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

/*
==================================================
CORS
==================================================
*/

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

/*
==================================================
BODY PARSER
==================================================
*/

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    limit: "10mb",
    extended: true,
  })
);

/*
==================================================
ROUTES
==================================================
*/

const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

/*
==================================================
API ROUTES
==================================================
*/

app.use(
  "/api/products",
  productRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/payment",
  paymentRoutes
);

/*
==================================================
HEALTH CHECK
==================================================
*/

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      success: true,
      message:
        "Ecommerce backend is running",
    });
  }
);

/*
==================================================
SERVER
==================================================
*/

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {
    console.log(
      `Server running on http://localhost:${PORT}`
    );
  }
);