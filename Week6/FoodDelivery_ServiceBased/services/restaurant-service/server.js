const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3002;
const DB_PORT = Number(process.env.DB_PORT || 5432);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: DB_PORT,
  database: process.env.DB_NAME || 'restaurant_db',
  user: process.env.DB_USER || 'restaurant_user',
  password: process.env.DB_PASSWORD || 'restaurant_pass',
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function initDb() {
  const seedRestaurants = [
    ['Pho 24', 'Vietnamese'],
    ['Pizza House', 'Italian'],
    ['Sushi Mura', 'Japanese'],
  ];

  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS restaurants (
          id SERIAL PRIMARY KEY,
          name VARCHAR(120) NOT NULL,
          cuisine VARCHAR(80) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      const countResult = await pool.query('SELECT COUNT(*)::int AS count FROM restaurants');
      if (countResult.rows[0].count === 0) {
        for (const [name, cuisine] of seedRestaurants) {
          await pool.query(
            'INSERT INTO restaurants(name, cuisine) VALUES ($1, $2)',
            [name, cuisine]
          );
        }
      }
      return;
    } catch (error) {
      if (attempt === 10) throw error;
      await delay(1500);
    }
  }
}

app.get('/', (req, res) => {
  res.json({
    service: 'restaurant-service',
    message: 'Use GET /restaurants',
  });
});

app.get('/health', (req, res) => {
  res.json({ service: 'restaurant-service', status: 'ok' });
});

app.get('/restaurants', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, cuisine FROM restaurants ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Cannot fetch restaurants' });
  }
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`restaurant-service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('restaurant-service failed to initialize database', error.message);
    process.exit(1);
  });
