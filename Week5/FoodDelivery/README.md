# Food Delivery Monolith (Phase 1)

Monolith skeleton for the system "Online Food Delivery" built with NestJS and Docker.

## Included In This Phase

- Frontend web app (React + Nginx)
- Monolith API service (NestJS)
- Infrastructure via Docker Compose:
  - PostgreSQL
  - Redis
  - RabbitMQ (management UI)
- Proof endpoints:
  - `GET /health`
  - `GET /restaurants`
  - `POST /orders`

## Project Structure

- `frontend`: React UI container source code
- `apps/api`: API monolith source code
- `infra/init.sql`: PostgreSQL initialization script
- `docker-compose.yml`: full stack orchestration
- `Dockerfile`: API image build definition

## Quick Start

1. Open terminal in this folder.
2. Build and run:

```powershell
docker compose up -d --build
```

3. Verify containers:

```powershell
docker compose ps
```

4. Open frontend dashboard:

- URL: `http://localhost:5173`

5. Check API health:

```powershell
curl.exe http://localhost:3000/health
```

6. Check sample restaurants:

```powershell
curl.exe http://localhost:3000/restaurants
```

7. Create sample order:

```powershell
curl.exe -X POST http://localhost:3000/orders -H "Content-Type: application/json" -d "{\"restaurantId\":\"res-001\",\"userId\":\"user-001\",\"items\":[\"pho-bo\",\"tra-da\"],\"totalAmount\":125000}"
```

8. Open RabbitMQ management:

- URL: `http://localhost:15672`
- Username: `admin`
- Password: `admin123`

## Evidence Checklist (For Screenshot)

1. `docker compose ps` showing all services are `Up`.
2. Frontend at `http://localhost:5173` shows health and restaurant data.
3. `GET /health` returns status and service checks.
4. `GET /restaurants` returns seeded demo list.
5. `POST /orders` returns a generated order with `PENDING` status.

## Shutdown

```powershell
docker compose down
```

If you also want to remove volumes:

```powershell
docker compose down -v
```

## Next Phase (Not Included Yet)

Monolith to microservices migration will split modules in this order:

1. Orders service
2. Payments service
3. Notifications service
