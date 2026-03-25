CREATE TABLE IF NOT EXISTS restaurants (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cuisine VARCHAR(100) NOT NULL,
  is_open BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  restaurant_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  items JSONB NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO restaurants (id, name, cuisine, is_open)
VALUES
  ('res-001', 'Pho 24h', 'Vietnamese', TRUE),
  ('res-002', 'Burger Station', 'Fast Food', TRUE)
ON CONFLICT (id) DO NOTHING;
