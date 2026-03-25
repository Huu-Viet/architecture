const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL || 'http://restaurant-service:3002';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order-service:3003';

app.get('/', (req, res) => {
  res.json({
    service: 'api-gateway',
    endpoints: ['/health', '/services-health', '/auth', '/auth/login', '/restaurants', '/orders'],
  });
});

app.get('/health', (req, res) => {
  res.json({ service: 'api-gateway', status: 'ok' });
});

app.get('/services-health', async (req, res) => {
  const checks = await Promise.allSettled([
    axios.get(`${AUTH_SERVICE_URL}/health`),
    axios.get(`${RESTAURANT_SERVICE_URL}/health`),
    axios.get(`${ORDER_SERVICE_URL}/health`),
  ]);

  const mapResult = (result) =>
    result.status === 'fulfilled' ? result.value.data : { status: 'down' };

  res.json({
    auth: mapResult(checks[0]),
    restaurant: mapResult(checks[1]),
    order: mapResult(checks[2]),
  });
});

app.post('/auth/login', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/auth/login`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: 'Auth service unavailable' });
  }
});

app.get('/auth', async (req, res) => {
  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/auth`);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: 'Auth service unavailable' });
  }
});

app.get('/restaurants', async (req, res) => {
  try {
    const response = await axios.get(`${RESTAURANT_SERVICE_URL}/restaurants`);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: 'Restaurant service unavailable' });
  }
});

app.post('/orders', async (req, res) => {
  try {
    const response = await axios.post(`${ORDER_SERVICE_URL}/orders`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: 'Order service unavailable' });
  }
});

app.get('/orders', async (req, res) => {
  try {
    const response = await axios.get(`${ORDER_SERVICE_URL}/orders`);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: 'Order service unavailable' });
  }
});

app.listen(PORT, () => {
  console.log(`api-gateway running on port ${PORT}`);
});
