const express = require("express");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const pool = require("../config/db");

const router = express.Router();

/*
=========================================================
REQUIRED AUTH MIDDLEWARE
Used for:
- My Orders
- Admin order status update
=========================================================
*/

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    req.user = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    next();
  } catch (error) {
    console.error(
      "AUTH ERROR:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired authentication token",
    });
  }
};

/*
=========================================================
OPTIONAL AUTH
Guest checkout is allowed.
=========================================================
*/

const optionalAuth = (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      authHeader &&
      authHeader.startsWith("Bearer ")
    ) {
      const token =
        authHeader.split(" ")[1];

      try {
        req.user = jwt.verify(
          token,
          process.env.JWT_SECRET
        );
      } catch (error) {
        req.user = null;
      }
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

/*
=========================================================
EMAIL TRANSPORTER
=========================================================
*/

const transporter =
  nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(
      process.env.MAIL_PORT || 465
    ),
    secure:
      process.env.MAIL_SECURE === "true",

    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

/*
=========================================================
SEND ORDER RECEIPT EMAIL
=========================================================
*/

const sendOrderReceiptEmail = async (
  order,
  items
) => {
  if (!order.email) {
    throw new Error(
      "Customer email is missing"
    );
  }

  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="
            padding:10px;
            border-bottom:1px solid #eee;
          ">
            ${item.product_name || "Product"}
          </td>

          <td style="
            padding:10px;
            border-bottom:1px solid #eee;
          ">
            ${item.selected_size || "-"}
          </td>

          <td style="
            padding:10px;
            border-bottom:1px solid #eee;
            text-align:center;
          ">
            ${item.quantity || 1}
          </td>

          <td style="
            padding:10px;
            border-bottom:1px solid #eee;
            text-align:right;
          ">
            ₹${Number(
              item.price || 0
            ).toFixed(2)}
          </td>

          <td style="
            padding:10px;
            border-bottom:1px solid #eee;
            text-align:right;
          ">
            ₹${(
              Number(item.price || 0) *
              Number(item.quantity || 1)
            ).toFixed(2)}
          </td>
        </tr>
      `
    )
    .join("");

  const html = `
<!DOCTYPE html>

<html>

<head>
  <meta charset="UTF-8" />

  <title>
    ShoeMaker Order Receipt
  </title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#f5f7fb;
  font-family:Arial,Helvetica,sans-serif;
">

<div style="
  max-width:750px;
  margin:30px auto;
  background:#ffffff;
  border-radius:12px;
  overflow:hidden;
">

  <div style="
    background:#111827;
    color:white;
    padding:25px;
    text-align:center;
  ">

    <h1 style="margin:0;">
      👟 ShoeMaker
    </h1>

    <p>
      Order Receipt
    </p>

  </div>

  <div style="
    padding:30px;
  ">

    <h2>
      Thank you for your order!
    </h2>

    <p>
      Hi
      <strong>
        ${order.full_name || "Customer"}
      </strong>,
    </p>

    <p>
      Your order has been successfully
      placed with ShoeMaker.
    </p>

    <table width="100%" style="
      border-collapse:collapse;
      margin:25px 0;
    ">

      <tr>
        <td style="padding:8px;">
          <strong>
            Order Number
          </strong>
        </td>

        <td style="
          padding:8px;
          text-align:right;
        ">
          ${order.order_number}
        </td>
      </tr>

      <tr>
        <td style="padding:8px;">
          <strong>
            Order Date
          </strong>
        </td>

        <td style="
          padding:8px;
          text-align:right;
        ">
          ${new Date(
            order.created_at
          ).toLocaleString("en-IN")}
        </td>
      </tr>

      <tr>
        <td style="padding:8px;">
          <strong>
            Payment Method
          </strong>
        </td>

        <td style="
          padding:8px;
          text-align:right;
        ">
          ${order.payment_method || "COD"}
        </td>
      </tr>

      <tr>
        <td style="padding:8px;">
          <strong>
            Payment Status
          </strong>
        </td>

        <td style="
          padding:8px;
          text-align:right;
        ">
          ${order.payment_status || "Pending"}
        </td>
      </tr>

    </table>

    <h3>
      Order Items
    </h3>

    <table width="100%" style="
      border-collapse:collapse;
      font-size:14px;
    ">

      <thead>

        <tr style="
          background:#f3f4f6;
        ">

          <th style="
            padding:10px;
            text-align:left;
          ">
            Product
          </th>

          <th style="
            padding:10px;
            text-align:left;
          ">
            Size
          </th>

          <th style="
            padding:10px;
            text-align:center;
          ">
            Qty
          </th>

          <th style="
            padding:10px;
            text-align:right;
          ">
            Price
          </th>

          <th style="
            padding:10px;
            text-align:right;
          ">
            Total
          </th>

        </tr>

      </thead>

      <tbody>
        ${itemRows}
      </tbody>

    </table>

    <table width="100%" style="
      border-collapse:collapse;
      margin-top:25px;
    ">

      <tr>
        <td style="padding:8px;">
          Subtotal
        </td>

        <td style="
          padding:8px;
          text-align:right;
        ">
          ₹${Number(
            order.subtotal || 0
          ).toFixed(2)}
        </td>
      </tr>

      <tr>
        <td style="padding:8px;">
          Delivery
        </td>

        <td style="
          padding:8px;
          text-align:right;
        ">
          ₹${Number(
            order.delivery_charge || 0
          ).toFixed(2)}
        </td>
      </tr>

      <tr>
        <td style="padding:8px;">
          Discount
        </td>

        <td style="
          padding:8px;
          text-align:right;
        ">
          - ₹${Number(
            order.discount || 0
          ).toFixed(2)}
        </td>
      </tr>

      <tr style="
        border-top:2px solid #111827;
      ">

        <td style="
          padding:15px 8px;
          font-size:18px;
          font-weight:bold;
        ">
          Grand Total
        </td>

        <td style="
          padding:15px 8px;
          text-align:right;
          font-size:18px;
          font-weight:bold;
        ">
          ₹${Number(
            order.total || 0
          ).toFixed(2)}
        </td>

      </tr>

    </table>

    <div style="
      margin-top:30px;
      padding:20px;
      background:#f9fafb;
      border-radius:8px;
    ">

      <h3>
        Delivery Address
      </h3>

      <p>
        ${order.full_name || ""}
      </p>

      <p>
        ${order.address || ""}
      </p>

      <p>
        ${order.city || ""},
        ${order.state || ""}
        - ${order.pincode || ""}
      </p>

      <p>
        Phone:
        ${order.phone || ""}
      </p>

      <p>
        Email:
        ${order.email || ""}
      </p>

    </div>

    <p style="
      text-align:center;
      margin-top:30px;
      color:#777;
    ">

      Thank you for shopping with
      <strong>ShoeMaker</strong> 👟

    </p>

  </div>

  <div style="
    background:#111827;
    color:#d1d5db;
    text-align:center;
    padding:18px;
    font-size:13px;
  ">

    © ${new Date().getFullYear()}
    ShoeMaker.
    All rights reserved.

  </div>

</div>

</body>

</html>
`;

  await transporter.sendMail({
    from:
      `"ShoeMaker" <${process.env.MAIL_USER}>`,

    to: order.email,

    subject:
      `ShoeMaker Order Receipt - ${order.order_number}`,

    html,
  });
};

/*
=========================================================
SEND ORDER STATUS EMAIL
Confirmed / Cancelled
=========================================================
*/

const sendOrderStatusEmail = async (
  order,
  items,
  status
) => {
  if (!order.email) {
    throw new Error(
      "Customer email is missing"
    );
  }

  const isConfirmed =
    status === "Confirmed" ||
    status === "Order Confirmed";

  const isCancelled =
    status === "Cancelled";

  if (
    !isConfirmed &&
    !isCancelled
  ) {
    return false;
  }

  const subject = isConfirmed
    ? `Order Confirmed - ${order.order_number}`
    : `Order Cancelled - ${order.order_number}`;

  const title = isConfirmed
    ? "Your Order Has Been Confirmed! 🎉"
    : "Your Order Has Been Cancelled";

  const message = isConfirmed
    ? `
      Good news! Your order has been
      confirmed and will be processed shortly.
    `
    : `
      Your order has been cancelled.
      If you paid online, any applicable
      refund will be processed according
      to the payment/refund policy.
    `;

  const itemRows = items
    .map(
      (item) => `
        <tr>

          <td style="
            padding:10px;
            border-bottom:1px solid #eee;
          ">
            ${item.product_name || "Product"}
          </td>

          <td style="
            padding:10px;
            border-bottom:1px solid #eee;
            text-align:center;
          ">
            ${item.quantity || 1}
          </td>

          <td style="
            padding:10px;
            border-bottom:1px solid #eee;
            text-align:right;
          ">
            ₹${Number(
              item.price || 0
            ).toFixed(2)}
          </td>

        </tr>
      `
    )
    .join("");

  const html = `
<!DOCTYPE html>

<html>

<head>
  <meta charset="UTF-8" />

  <title>
    ${
      isConfirmed
        ? "Order Confirmed"
        : "Order Cancelled"
    }
  </title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#f5f7fb;
  font-family:Arial,Helvetica,sans-serif;
">

<div style="
  max-width:650px;
  margin:30px auto;
  background:#ffffff;
  border-radius:12px;
  overflow:hidden;
">

  <div style="
    background:#111827;
    color:white;
    padding:25px;
    text-align:center;
  ">

    <h1 style="margin:0;">
      👟 ShoeMaker
    </h1>

  </div>

  <div style="padding:30px;">

    <h2>
      ${title}
    </h2>

    <p>
      Dear
      <strong>
        ${order.full_name || "Customer"}
      </strong>,
    </p>

    <p>
      ${message}
    </p>

    <div style="
      background:#f3f4f6;
      padding:18px;
      border-radius:8px;
      margin:20px 0;
    ">

      <p>
        <strong>
          Order Number:
        </strong>
        ${order.order_number}
      </p>

      <p>
        <strong>
          Order Status:
        </strong>
        ${status}
      </p>

      <p>
        <strong>
          Total:
        </strong>
        ₹${Number(
          order.total || 0
        ).toFixed(2)}
      </p>

    </div>

    <h3>
      Order Items
    </h3>

    <table width="100%" style="
      border-collapse:collapse;
    ">

      <thead>

        <tr style="
          background:#f3f4f6;
        ">

          <th style="
            padding:10px;
            text-align:left;
          ">
            Product
          </th>

          <th style="
            padding:10px;
            text-align:center;
          ">
            Qty
          </th>

          <th style="
            padding:10px;
            text-align:right;
          ">
            Price
          </th>

        </tr>

      </thead>

      <tbody>
        ${itemRows}
      </tbody>

    </table>

    <p style="
      margin-top:25px;
    ">

      ${
        isConfirmed
          ? `
            Thank you for shopping with
            <strong>ShoeMaker</strong>.
            We will keep you updated
            about your order.
          `
          : `
            If you have any questions
            regarding this cancellation,
            please contact our support team.
          `
      }

    </p>

  </div>

  <div style="
    background:#111827;
    color:#d1d5db;
    text-align:center;
    padding:18px;
    font-size:13px;
  ">

    ShoeMaker —
    Thank you for shopping with us.

  </div>

</div>

</body>

</html>
`;

  await transporter.sendMail({
    from:
      `"ShoeMaker" <${process.env.MAIL_USER}>`,

    to: order.email,

    subject,

    html,
  });

  console.log(
    `ORDER ${status.toUpperCase()} EMAIL SENT:`,
    order.email
  );

  return true;
};

/*
=========================================================
CREATE ORDER
POST /api/orders

LOGIN NOT REQUIRED
=========================================================
*/

router.post(
  "/",
  optionalAuth,
  async (req, res) => {
    const client =
      await pool.connect();

    try {
      const {
        customer,
        items,

        subtotal = 0,
        deliveryCharge = 0,
        discount = 0,
        total = 0,

        deliveryMethod =
          "standard",

        paymentMethod =
          "cod",

        paymentStatus =
          null,

        paymentId =
          null,
      } = req.body;

      /*
      ==============================================
      VALIDATION
      ==============================================
      */

      if (!customer) {
        return res.status(400).json({
          success: false,
          message:
            "Customer details are required",
        });
      }

      if (!customer.fullName) {
        return res.status(400).json({
          success: false,
          message:
            "Customer name is required",
        });
      }

      if (!customer.email) {
        return res.status(400).json({
          success: false,
          message:
            "Customer email is required",
        });
      }

      if (!customer.phone) {
        return res.status(400).json({
          success: false,
          message:
            "Customer phone is required",
        });
      }

      if (!customer.address) {
        return res.status(400).json({
          success: false,
          message:
            "Delivery address is required",
        });
      }

      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Order items are required",
        });
      }

      await client.query(
        "BEGIN"
      );

      /*
      ==============================================
      USER ID
      Guest = NULL
      Logged in = user ID
      ==============================================
      */

      const userId =
        req.user?.id ||
        req.user?.userId ||
        req.user?.user_id ||
        null;

      /*
      ==============================================
      ORDER NUMBER
      ==============================================
      */

      const orderNumber =
        `SM-${Date.now()}-${Math.floor(
          Math.random() * 1000
        )}`;

      /*
      ==============================================
      PAYMENT STATUS
      ==============================================
      */

      const finalPaymentStatus =
        paymentStatus ||
        (
          paymentMethod === "cod"
            ? "Pending"
            : paymentId
            ? "Paid"
            : "Pending"
        );

      /*
      ==============================================
      INSERT ORDER
      ==============================================
      */

      const orderResult =
        await client.query(
          `
          INSERT INTO orders (
            order_number,
            user_id,
            full_name,
            email,
            phone,
            address,
            city,
            state,
            pincode,
            subtotal,
            delivery_charge,
            discount,
            total,
            delivery_method,
            payment_method,
            payment_status,
            payment_id,
            status
          )

          VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15,
            $16, $17, $18
          )

          RETURNING *
          `,
          [
            orderNumber,
            userId,

            customer.fullName,
            customer.email,
            customer.phone,

            customer.address,
            customer.city || "",
            customer.state || "",
            customer.pincode || "",

            Number(subtotal),
            Number(deliveryCharge),
            Number(discount),
            Number(total),

            deliveryMethod,
            paymentMethod,

            finalPaymentStatus,
            paymentId,

            "Order Placed",
          ]
        );

      const order =
        orderResult.rows[0];

      /*
      ==============================================
      INSERT ORDER ITEMS
      ==============================================

      IMPORTANT:
      image is saved here.
      ==============================================
      */

      for (const item of items) {
        await client.query(
          `
          INSERT INTO order_items (
            order_id,
            product_id,
            product_name,
            image,
            price,
            quantity,
            selected_size
          )

          VALUES (
            $1, $2, $3, $4, $5, $6, $7
          )
          `,
          [
            order.id,

            item.id ||
              item.product_id ||
              null,

            item.name ||
              item.product_name ||
              "Product",

            item.image ||
              null,

            Number(
              item.price || 0
            ),

            Number(
              item.quantity || 1
            ),

            item.selectedSize ||
              item.selected_size ||
              null,
          ]
        );
      }

      /*
      ==============================================
      COMMIT
      ==============================================
      */

      await client.query(
        "COMMIT"
      );

      /*
      ==============================================
      SEND RECEIPT EMAIL
      ==============================================
      */

      let receiptEmailSent =
        false;

      try {
        const itemsResult =
          await pool.query(
            `
            SELECT
              product_name,
              price,
              quantity,
              selected_size
            FROM order_items
            WHERE order_id = $1
            ORDER BY id ASC
            `,
            [order.id]
          );

        await sendOrderReceiptEmail(
          order,
          itemsResult.rows
        );

        receiptEmailSent =
          true;

        console.log(
          `ORDER RECEIPT EMAIL SENT: ${order.email} (${order.order_number})`
        );
      } catch (emailError) {
        console.error(
          "ORDER RECEIPT EMAIL ERROR:",
          emailError.message
        );
      }

      /*
      ==============================================
      RESPONSE
      ==============================================
      */

      return res.status(201).json({
        success: true,

        message:
          receiptEmailSent
            ? "Order placed successfully. Receipt sent to customer email."
            : "Order placed successfully, but receipt email could not be sent.",

        receiptEmailSent,

        order: {
          id: order.id,

          orderNumber:
            order.order_number,

          order_number:
            order.order_number,

          userId:
            order.user_id,

          fullName:
            order.full_name,

          email:
            order.email,

          phone:
            order.phone,

          address:
            order.address,

          city:
            order.city,

          state:
            order.state,

          pincode:
            order.pincode,

          subtotal:
            Number(order.subtotal),

          deliveryCharge:
            Number(
              order.delivery_charge
            ),

          discount:
            Number(order.discount),

          total:
            Number(order.total),

          deliveryMethod:
            order.delivery_method,

          paymentMethod:
            order.payment_method,

          paymentStatus:
            order.payment_status,

          paymentId:
            order.payment_id,

          status:
            order.status,

          createdAt:
            order.created_at,

          items,
        },
      });
    } catch (error) {
      await client.query(
        "ROLLBACK"
      );

      console.error(
        "CREATE ORDER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to create order",
        error:
          error.message,
      });
    } finally {
      client.release();
    }
  }
);

/*
=========================================================
GET ALL ORDERS
GET /api/orders

IMPORTANT FIX:
Returns order_items + product image.
=========================================================
*/

router.get(
  "/",
  async (req, res) => {
    try {
      const ordersResult =
        await pool.query(
          `
          SELECT *
          FROM orders
          ORDER BY created_at DESC
          `
        );

      const orders = [];

      /*
      ==============================================
      GET ITEMS FOR EVERY ORDER
      ==============================================
      */

      for (
        const order of ordersResult.rows
      ) {
        const itemsResult =
          await pool.query(
            `
            SELECT
              id,
              order_id,
              product_id,
              product_name,
              image,
              price,
              quantity,
              selected_size,
              created_at
            FROM order_items
            WHERE order_id = $1
            ORDER BY id ASC
            `,
            [order.id]
          );

        orders.push({
          ...order,

          /*
          THIS IS THE IMPORTANT PART
          */

          items:
            itemsResult.rows,
        });
      }

      return res.status(200).json({
        success: true,

        orders,
      });
    } catch (error) {
      console.error(
        "GET ORDERS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch orders",

        error:
          error.message,
      });
    }
  }
);

/*
=========================================================
CUSTOMER MY ORDERS
GET /api/orders/my-orders

LOGIN REQUIRED
=========================================================
*/

router.get(
  "/my-orders",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user?.id ||
        req.user?.userId ||
        req.user?.user_id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message:
            "User ID not found in token",
        });
      }

      const ordersResult =
        await pool.query(
          `
          SELECT *
          FROM orders
          WHERE user_id = $1
          ORDER BY created_at DESC
          `,
          [userId]
        );

      const orders = [];

      for (
        const order of ordersResult.rows
      ) {
        const itemsResult =
          await pool.query(
            `
            SELECT
              id,
              order_id,
              product_id,
              product_name,
              image,
              price,
              quantity,
              selected_size,
              created_at
            FROM order_items
            WHERE order_id = $1
            ORDER BY id ASC
            `,
            [order.id]
          );

        orders.push({
          ...order,

          items:
            itemsResult.rows,
        });
      }

      return res.status(200).json({
        success: true,

        orders,
      });
    } catch (error) {
      console.error(
        "GET MY ORDERS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch your orders",

        error:
          error.message,
      });
    }
  }
);

/*
=========================================================
GET SINGLE ORDER
GET /api/orders/:id

Returns order + items + image.
=========================================================
*/

router.get(
  "/:id",
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const result =
        await pool.query(
          `
          SELECT *
          FROM orders
          WHERE id::text = $1
             OR order_number = $1
          LIMIT 1
          `,
          [id]
        );

      if (
        result.rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found",
        });
      }

      const order =
        result.rows[0];

      const itemsResult =
        await pool.query(
          `
          SELECT
            id,
            order_id,
            product_id,
            product_name,
            image,
            price,
            quantity,
            selected_size,
            created_at
          FROM order_items
          WHERE order_id = $1
          ORDER BY id ASC
          `,
          [order.id]
        );

      return res.status(200).json({
        success: true,

        order: {
          ...order,

          items:
            itemsResult.rows,
        },
      });
    } catch (error) {
      console.error(
        "GET SINGLE ORDER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch order",

        error:
          error.message,
      });
    }
  }
);

/*
=========================================================
UPDATE ORDER STATUS
PUT /api/orders/:id/status

Admin:
Confirmed
Order Confirmed
Cancelled
=========================================================
*/

router.put(
  "/:id/status",
  authMiddleware,
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const { status } =
        req.body;

      if (!status) {
        return res.status(400).json({
          success: false,

          message:
            "Status is required",
        });
      }

      /*
      ==============================================
      GET CURRENT ORDER
      ==============================================
      */

      const oldOrderResult =
        await pool.query(
          `
          SELECT *
          FROM orders
          WHERE id::text = $1
             OR order_number = $1
          LIMIT 1
          `,
          [id]
        );

      if (
        oldOrderResult.rows.length === 0
      ) {
        return res.status(404).json({
          success: false,

          message:
            "Order not found",
        });
      }

      const oldOrder =
        oldOrderResult.rows[0];

      /*
      ==============================================
      CHECK STATUS CHANGE
      ==============================================
      */

      const statusChanged =
        oldOrder.status !== status;

      /*
      ==============================================
      UPDATE STATUS
      ==============================================
      */

      const result =
        await pool.query(
          `
          UPDATE orders

          SET
            status = $1,
            updated_at = CURRENT_TIMESTAMP

          WHERE id::text = $2
             OR order_number = $2

          RETURNING *
          `,
          [
            status,
            id,
          ]
        );

      const updatedOrder =
        result.rows[0];

      /*
      ==============================================
      GET ORDER ITEMS
      ==============================================
      */

      const itemsResult =
        await pool.query(
          `
          SELECT
            id,
            order_id,
            product_id,
            product_name,
            image,
            price,
            quantity,
            selected_size,
            created_at
          FROM order_items
          WHERE order_id = $1
          ORDER BY id ASC
          `,
          [updatedOrder.id]
        );

      const items =
        itemsResult.rows;

      let statusEmailSent =
        false;

      /*
      ==============================================
      CONFIRMED EMAIL
      ==============================================
      */

      if (
        statusChanged &&
        (
          status === "Confirmed" ||
          status === "Order Confirmed"
        )
      ) {
        try {
          statusEmailSent =
            await sendOrderStatusEmail(
              updatedOrder,
              items,
              status
            );
        } catch (emailError) {
          console.error(
            "ORDER CONFIRMED EMAIL ERROR:",
            emailError.message
          );
        }
      }

      /*
      ==============================================
      CANCELLED EMAIL
      ==============================================
      */

      if (
        statusChanged &&
        status === "Cancelled"
      ) {
        try {
          statusEmailSent =
            await sendOrderStatusEmail(
              updatedOrder,
              items,
              status
            );
        } catch (emailError) {
          console.error(
            "ORDER CANCELLED EMAIL ERROR:",
            emailError.message
          );
        }
      }

      /*
      ==============================================
      RESPONSE
      ==============================================
      */

      return res.status(200).json({
        success: true,

        message:
          "Order status updated successfully",

        statusEmailSent,

        order:
          updatedOrder,
      });
    } catch (error) {
      console.error(
        "UPDATE ORDER STATUS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to update order status",

        error:
          error.message,
      });
    }
  }
);

/*
=========================================================
EXPORT
=========================================================
*/

module.exports = router;