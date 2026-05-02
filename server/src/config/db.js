import { Pool } from "pg";

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: process.env.PG_PORT,
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

    await client.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          sender_id INTEGER NOT NULL,
          receiver_id INTEGER NOT NULL,
          message TEXT,
          attachment TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT fk_sender
            FOREIGN KEY(sender_id) 
            REFERENCES users(id)
            ON DELETE CASCADE,

          CONSTRAINT fk_receiver
            FOREIGN KEY(receiver_id) 
            REFERENCES users(id)
            ON DELETE CASCADE 
  )
`);

    // Add column if it doesn't exist (for existing tables)
    await client.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment TEXT`);
    await client.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_name TEXT`);
    await client.query(`ALTER TABLE messages ALTER COLUMN message DROP NOT NULL`);

    await client.query(`
        CREATE TABLE IF NOT EXISTS conversations (
          id SERIAL PRIMARY KEY,
          participants INTEGER[] NOT NULL,
          messages JSONB DEFAULT '[]',
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
