const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3003;
const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL || 'http://restaurant-service:3002';
const DB_PORT = Number(process.env.DB_PORT || 5432);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: DB_PORT,
  database: process.env.DB_NAME || 'order_db',
  user: process.env.DB_USER || 'order_user',
  password: process.env.DB_PASSWORD || 'order_pass',
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function initDb() {
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id BIGSERIAL PRIMARY KEY,
          restaurant_id INT NOT NULL,
          restaurant_name VARCHAR(120) NOT NULL,
          items JSONB NOT NULL,
          status VARCHAR(30) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      return;
    } catch (error) {
      if (attempt === 10) throw error;
      await delay(1500);
    }
  }
}

app.get('/', (req, res) => {
  res.json({
    service: 'order-service',
    message: 'Use GET /orders or POST /orders',
  });
});

app.get('/health', (req, res) => {
  res.json({ service: 'order-service', status: 'ok' });
});

app.get('/orders', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, restaurant_id AS "restaurantId", restaurant_name AS "restaurantName", items, status, created_at AS "createdAt" FROM orders ORDER BY id DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Cannot fetch orders' });
  }
});

app.post('/orders', async (req, res) => {
  const { restaurantId, items } = req.body || {};

  if (!restaurantId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'restaurantId and items are required' });
  }

  try {
    const restaurantResponse = await axios.get(`${RESTAURANT_SERVICE_URL}/restaurants`);
    const target = restaurantResponse.data.find((r) => r.id === restaurantId);

    if (!target) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const insertResult = await pool.query(
      `
        INSERT INTO orders(restaurant_id, restaurant_name, items, status)
        VALUES ($1, $2, $3::jsonb, $4)
        RETURNING id, restaurant_id AS "restaurantId", restaurant_name AS "restaurantName", items, status, created_at AS "createdAt";
      `,
      [restaurantId, target.name, JSON.stringify(items), 'PENDING']
    );

    return res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    return res.status(503).json({ message: 'Restaurant service unavailable' });
  }
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`order-service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('order-service failed to initialize database', error.message);
    process.exit(1);
  });
