const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const router = express.Router();

/*
==================================================
CHECK RAZORPAY ENVIRONMENT VARIABLES
==================================================
*/

const RAZORPAY_KEY_ID =
  process.env.RAZORPAY_KEY_ID;

const RAZORPAY_KEY_SECRET =
  process.env.RAZORPAY_KEY_SECRET;

console.log(
  "RAZORPAY KEY ID:",
  RAZORPAY_KEY_ID
    ? `${RAZORPAY_KEY_ID.substring(0, 12)}...`
    : "MISSING"
);

console.log(
  "RAZORPAY SECRET:",
  RAZORPAY_KEY_SECRET
    ? "LOADED"
    : "MISSING"
);

/*
==================================================
RAZORPAY INSTANCE
==================================================
*/

let razorpay = null;

if (
  RAZORPAY_KEY_ID &&
  RAZORPAY_KEY_SECRET
) {
  razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });

  console.log(
    "Razorpay initialized successfully"
  );
} else {
  console.error(
    "Razorpay initialization failed: keys are missing."
  );
}

/*
==================================================
CREATE RAZORPAY ORDER
POST /api/payment/create-order
==================================================
*/

router.post(
  "/create-order",
  async (req, res) => {
    try {
      /*
      Check keys
      */

      if (!razorpay) {
        return res.status(500).json({
          success: false,
          message:
            "Razorpay is not configured. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env",
        });
      }

      /*
      Get amount
      */

      const { amount } = req.body;

      const numericAmount =
        Number(amount);

      if (
        !Number.isFinite(
          numericAmount
        ) ||
        numericAmount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid amount is required",
        });
      }

      /*
      Convert rupees to paise
      */

      const amountInPaise =
        Math.round(
          numericAmount * 100
        );

      /*
      Razorpay order options
      */

      const options = {
        amount: amountInPaise,
        currency: "INR",
        receipt: `shoe_${Date.now()}`,
      };

      console.log(
        "Creating Razorpay order:",
        options
      );

      /*
      Create Razorpay order
      */

      const order =
        await razorpay.orders.create(
          options
        );

      console.log(
        "Razorpay order created:",
        order.id
      );

      /*
      Send response
      */

      return res.status(200).json({
        success: true,
        order: {
          id: order.id,
          entity: order.entity,
          amount: order.amount,
          amount_paid:
            order.amount_paid,
          amount_due:
            order.amount_due,
          currency: order.currency,
          receipt: order.receipt,
          status: order.status,
        },
      });
    } catch (error) {
      console.error(
        "RAZORPAY CREATE ORDER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error?.error?.description ||
          error?.description ||
          error?.message ||
          "Failed to create Razorpay order",
      });
    }
  }
);

/*
==================================================
VERIFY RAZORPAY PAYMENT
POST /api/payment/verify
==================================================
*/

router.post(
  "/verify",
  async (req, res) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = req.body;

      /*
      Check payment data
      */

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Payment details are missing",
        });
      }

      /*
      Check secret
      */

      if (!RAZORPAY_KEY_SECRET) {
        return res.status(500).json({
          success: false,
          message:
            "Razorpay secret key is missing on backend.",
        });
      }

      /*
      Generate signature
      */

      const generatedSignature =
        crypto
          .createHmac(
            "sha256",
            RAZORPAY_KEY_SECRET
          )
          .update(
            `${razorpay_order_id}|${razorpay_payment_id}`
          )
          .digest("hex");

      console.log(
        "Razorpay signature verification started"
      );

      /*
      Compare signatures
      */

      if (
        generatedSignature !==
        razorpay_signature
      ) {
        console.error(
          "Invalid Razorpay signature"
        );

        return res.status(400).json({
          success: false,
          message:
            "Invalid payment signature",
        });
      }

      console.log(
        "Razorpay payment verified:",
        razorpay_payment_id
      );

      /*
      Success
      */

      return res.status(200).json({
        success: true,
        message:
          "Payment verified successfully",

        paymentId:
          razorpay_payment_id,

        orderId:
          razorpay_order_id,
      });
    } catch (error) {
      console.error(
        "RAZORPAY VERIFY ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Payment verification failed",
      });
    }
  }
);

module.exports = router;