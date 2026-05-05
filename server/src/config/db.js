import pg from "pg";

pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, (stringValue) => {
  return new Date(stringValue + "Z");
});

const pool = new pg.Pool({
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

    await client.query("SELECT 1");

    // =========================
    // USERS
    // =========================
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

    // =========================
    // CONVERSATIONS
    // =========================
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        participants INTEGER[] NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // =========================
    // MESSAGES
    // =========================
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        conversation_id INTEGER NOT NULL,
        message TEXT,
        attachment TEXT,
        file_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_sender
          FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,

        CONSTRAINT fk_receiver
          FOREIGN KEY(receiver_id) REFERENCES users(id) ON DELETE CASCADE,

        CONSTRAINT fk_conversation
          FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_conversation_id 
      ON messages(conversation_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sender_id 
      ON messages(sender_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_receiver_id 
      ON messages(receiver_id)
    `);

    console.log("🟢 Database schema locked & ready");
  } catch (err) {
    console.error("🔴 DB Error:", err.message);
  } finally {
    if (client) client.release();
  }
};

export default pool;
