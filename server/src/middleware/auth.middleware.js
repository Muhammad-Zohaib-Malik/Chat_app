import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

export const verifyAccessToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ message: "No access token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      "SELECT id, username, email, role FROM users WHERE id = $1",
      [decoded.id],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = result.rows[0];

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
};
