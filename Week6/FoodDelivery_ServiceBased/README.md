# Food Delivery Service-Based (Migration Demo)

This folder is a separate migration demo from the existing monolith.

## Services

- api-gateway: Entry point for clients
- auth-service: Authentication domain
- restaurant-service: Restaurant catalog domain
- order-service: Order domain

## Databases

- auth-service -> auth-db (PostgreSQL, port 54331)
- restaurant-service -> restaurant-db (PostgreSQL, port 54332)
- order-service -> order-db (PostgreSQL, port 54333)

## Run

1. Open terminal in this folder
2. Run: docker compose up -d --build
3. Test:
   - Gateway health: http://localhost:4000/health
   - Service health map: http://localhost:4000/services-health
   - Auth users via gateway: http://localhost:4000/auth
   - Orders via gateway: http://localhost:4000/orders
   - Restaurants via gateway: http://localhost:4000/restaurants

## Stop

- docker compose down
