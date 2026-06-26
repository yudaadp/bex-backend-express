const db = require("../db");
const { verifyToken } = require("../utils/jwt");

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token is required" });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);

    const result = await db.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [payload.sub]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = result.rows[0];
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    return next(error);
  }
}

module.exports = {
  requireAuth
};
