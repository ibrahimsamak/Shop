# Tol-Shop API

Backend for my e-commerce admin panel. FastAPI + async SQLAlchemy, JWT login with refresh tokens and 3 roles (admin, manager, viewer).

The Angular frontend is in the [`frontend`](https://github.com/ibrahimsamak/Tol-Shop/tree/frontend) branch of this repo.

## Run

Python 3.12+

```bash
python -m venv .venv
source .venv/bin/activate      # windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

It uses SQLite by default, so nothing else to install. On the first start it creates the tables and adds some fake data (60 users, 60 products, 40 orders).

Swagger is at http://localhost:8000/docs

Test accounts:

- admin@shop.io / admin123 - can do everything
- manager@shop.io / manager123 - create and edit, no delete
- viewer@shop.io / viewer123 - read only

Settings come from env vars, see `.env.example`. Change `SECRET_KEY` if you deploy it anywhere.

## Structure

router -> service -> repository -> db. Routers only check auth/roles and call the service, all queries are in the repositories.

```
app/
  core/          config, jwt + password hashing, image storage
  db/            tables, session, seed data
  schemas/       request/response models (camelCase json)
  repositories/
  services/
  routers/       auth, users, products, orders, dashboard
```

## Auth

Login returns an access token (15 min) and a refresh token (7 days). When the access token expires the frontend calls `/api/auth/refresh`. Refresh tokens are saved in the db, so logout actually invalidates them.

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@shop.io","password":"admin123"}'
```

## Endpoints

All under `/api`. Everything except login/refresh/logout/health needs a token.

- `auth`: login, refresh, logout, me
- `users`: list (page, size, q), get, create (admin), update (admin/manager), delete (admin)
- `products`: same as users + `POST /products/{id}/image` for the image upload; create/update for admin/manager
- `orders`: list (filter by status), get with items and status history
- `dashboard/summary`: revenue, counts and revenue per month for the chart

Passwords are hashed with PBKDF2 from hashlib, I didn't want another dependency just for that.
