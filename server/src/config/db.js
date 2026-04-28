import { Pool } from "pg";

const pool = new Pool({
  host: process.env.PG_HOST || "localhost",
  user: process.env.PG_USER || "postgres",
  password: process.env.PG_PASSWORD || "password",
  database: process.env.PG_DATABASE || "mern_task",
  port: Number(process.env.PG_PORT) || 5432,
  max: 5,
});

export const connectDatabase = async () => {
  let client;

  try {
    client = await pool.connect();
    console.log("🟢 Connected to PostgreSQL!");

    // test query
    await client.query("SELECT 1");

    // USERS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        refreshtoken TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("🟢 Tables created/verified successfully");
  } catch (err) {
    console.error("🔴 Database error:", err.message);
  } finally {
    if (client) client.release();
  }
};

export default pool;
