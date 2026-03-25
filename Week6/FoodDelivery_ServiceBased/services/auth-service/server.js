const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const DB_PORT = Number(process.env.DB_PORT || 5432);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: DB_PORT,
  database: process.env.DB_NAME || 'auth_db',
  user: process.env.DB_USER || 'auth_user',
  password: process.env.DB_PASSWORD || 'auth_pass',
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function initDb() {
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      await pool.query(
        'INSERT INTO users(username) VALUES ($1) ON CONFLICT (username) DO NOTHING',
        ['guest']
      );
      return;
    } catch (error) {
      if (attempt === 10) throw error;
      await delay(1500);
    }
  }
}

app.get('/', (req, res) => {
  res.json({
    service: 'auth-service',
    message: 'Use GET /auth or POST /auth/login',
  });
});

app.get('/health', (req, res) => {
  res.json({ service: 'auth-service', status: 'ok' });
});

app.get('/auth', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, created_at FROM users ORDER BY id');
    res.json({ users: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Cannot fetch users' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { username } = req.body || {};
  const userName = username || 'guest';

  try {
    const upsertResult = await pool.query(
      `
        INSERT INTO users(username)
        VALUES ($1)
        ON CONFLICT (username)
        DO UPDATE SET username = EXCLUDED.username
        RETURNING id, username;
      `,
      [userName]
    );

    const user = upsertResult.rows[0];

    res.json({
      token: `demo-jwt-token-for-${user.username}`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Cannot process login' });
  }
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`auth-service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('auth-service failed to initialize database', error.message);
    process.exit(1);
  });
