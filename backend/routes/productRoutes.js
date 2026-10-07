const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// ===============================
// GET ALL PRODUCTS
// ===============================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY id DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
});

// ===============================
// GET SINGLE PRODUCT
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch product",
    });
  }
});

// ===============================
// ADD PRODUCT
// ===============================
router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      sub_category,
      brand,
      gender,
      price,
      old_price,
      discount,
      stock,
      sku,
      sizes,
      color,
      material,
      sole_material,
      weight,
      image,
      status,
      featured,
      new_arrival,
    } = req.body;

    if (!name || !category || price === undefined || price === "") {
      return res.status(400).json({
        message: "Name, category and price are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO products (
        name,
        description,
        category,
        sub_category,
        brand,
        gender,
        price,
        old_price,
        discount,
        stock,
        sku,
        sizes,
        color,
        material,
        sole_material,
        weight,
        image,
        status,
        featured,
        new_arrival
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20
      )
      RETURNING *
      `,
      [
        name,
        description || "",
        category,
        sub_category || "",
        brand || "ShoeMaker",
        gender || "",
        Number(price),
        Number(old_price || 0),
        Number(discount || 0),
        Number(stock || 0),
        sku || null,
        sizes || "",
        color || "",
        material || "",
        sole_material || "",
        weight || "",
        image || "",
        status || "Active",
        Boolean(featured),
        Boolean(new_arrival),
      ]
    );

    res.status(201).json({
      message: "Product added successfully",
      product: result.rows[0],
    });
  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);

    // Duplicate SKU
    if (error.code === "23505") {
      return res.status(409).json({
        message: "SKU already exists",
      });
    }

    res.status(500).json({
      message: "Failed to add product",
      error: error.message,
    });
  }
});

// ===============================
// UPDATE PRODUCT
// ===============================
router.put("/:id", async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      sub_category,
      brand,
      gender,
      price,
      old_price,
      discount,
      stock,
      sku,
      sizes,
      color,
      material,
      sole_material,
      weight,
      image,
      status,
      featured,
      new_arrival,
    } = req.body;

    if (!name || !category || price === undefined || price === "") {
      return res.status(400).json({
        message: "Name, category and price are required",
      });
    }

    const result = await pool.query(
      `
      UPDATE products
      SET
        name = $1,
        description = $2,
        category = $3,
        sub_category = $4,
        brand = $5,
        gender = $6,
        price = $7,
        old_price = $8,
        discount = $9,
        stock = $10,
        sku = $11,
        sizes = $12,
        color = $13,
        material = $14,
        sole_material = $15,
        weight = $16,
        image = $17,
        status = $18,
        featured = $19,
        new_arrival = $20,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $21
      RETURNING *
      `,
      [
        name,
        description || "",
        category,
        sub_category || "",
        brand || "ShoeMaker",
        gender || "",
        Number(price),
        Number(old_price || 0),
        Number(discount || 0),
        Number(stock || 0),
        sku || null,
        sizes || "",
        color || "",
        material || "",
        sole_material || "",
        weight || "",
        image || "",
        status || "Active",
        Boolean(featured),
        Boolean(new_arrival),
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product updated successfully",
      product: result.rows[0],
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "SKU already exists",
      });
    }

    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
});

// ===============================
// DELETE PRODUCT
// ===============================
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product deleted successfully",
      product: result.rows[0],
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    res.status(500).json({
      message: "Failed to delete product",
    });
  }
});

module.exports = router;