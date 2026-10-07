const jwt = require("jsonwebtoken");

/* =====================================================
   JWT SECRET
===================================================== */

const JWT_SECRET =
  process.env.JWT_SECRET || "shopnest-secret-key";


/* =====================================================
   AUTH MIDDLEWARE
===================================================== */

const authMiddleware = (req, res, next) => {

  try {

    /* =================================================
       GET AUTHORIZATION HEADER
    ================================================= */

    const authHeader = req.headers.authorization;

    console.log(
      "AUTH HEADER:",
      authHeader ? "FOUND" : "NOT FOUND"
    );


    /* =================================================
       CHECK BEARER TOKEN
    ================================================= */

    if (
      !authHeader ||
      typeof authHeader !== "string" ||
      !authHeader.startsWith("Bearer ")
    ) {

      return res.status(401).json({
        success: false,
        message: "Authentication token is required."
      });

    }


    /* =================================================
       EXTRACT TOKEN
    ================================================= */

    const token = authHeader
      .substring(7)
      .trim();


    if (!token) {

      return res.status(401).json({
        success: false,
        message: "Authentication token is required."
      });

    }


    /* =================================================
       BASIC JWT FORMAT CHECK
       JWT = HEADER.PAYLOAD.SIGNATURE
    ================================================= */

    const tokenParts = token.split(".");

    if (tokenParts.length !== 3) {

      console.error(
        "AUTH ERROR: Malformed JWT token"
      );

      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token. Please login again."
      });

    }


    /* =================================================
       VERIFY JWT
    ================================================= */

    let decoded;

    try {

      decoded = jwt.verify(
        token,
        JWT_SECRET
      );

    } catch (jwtError) {

      console.error(
        "JWT VERIFY ERROR:",
        jwtError.name,
        jwtError.message
      );


      /* ===============================================
         EXPIRED TOKEN
      =============================================== */

      if (
        jwtError.name ===
        "TokenExpiredError"
      ) {

        return res.status(401).json({
          success: false,
          message:
            "Authentication token has expired. Please login again."
        });

      }


      /* ===============================================
         INVALID TOKEN
      =============================================== */

      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token. Please login again."
      });

    }


    /* =================================================
       CHECK DECODED USER
    ================================================= */

    if (
      !decoded ||
      typeof decoded !== "object"
    ) {

      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token."
      });

    }


    /* =================================================
       SAVE USER DATA
    ================================================= */

    req.user = decoded;


    /* =================================================
       AUTH SUCCESS LOG
    ================================================= */

    console.log(
      "================================="
    );

    console.log(
      "AUTH SUCCESS"
    );

    console.log(
      "USER ID:",
      decoded.id
    );

    console.log(
      "EMAIL:",
      decoded.email
    );

    console.log(
      "ROLE:",
      decoded.role
    );

    console.log(
      "================================="
    );


    /* =================================================
       CONTINUE REQUEST
    ================================================= */

    next();

  } catch (error) {

    console.error(
      "AUTH MIDDLEWARE ERROR:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired authentication token."
    });

  }

};


module.exports = authMiddleware;