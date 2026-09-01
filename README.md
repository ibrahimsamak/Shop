# Tol-Shop Admin

Angular 21 admin panel for my shop: users, products, orders and a small dashboard. The backend (FastAPI) is on the [`master`](https://github.com/ibrahimsamak/Tol-Shop/tree/master) branch.

## Features

- Login with access + refresh tokens. The access token is only kept in memory. On a 401 the interceptor refreshes once and retries, and if several requests fail at the same time they all wait for the same refresh.
- 3 roles (admin, manager, viewer). Route guards for the pages and a `*appHasRole` directive to hide buttons.
- Lists with search and paging. The big lists use virtual scroll.
- Product image upload with preview.
- Dashboard with KPI cards and a revenue chart. The chart is plain SVG, no chart library, and it's loaded with `@defer`.

Tech: standalone components, signals for state (no NgRx), zoneless with OnPush, lazy loaded routes, Angular Material 3, SSR.

Each feature has a component, a facade that holds the signals (data, loading, error) and an api service for the http calls.

## Run

Node 20+, and the backend running on port 8000.

```bash
npm install
npm start
```

Open http://localhost:4200 and log in with admin@shop.io / admin123 (also manager@shop.io / manager123 and viewer@shop.io / viewer123, the menu changes with the role).

`/api` and `/static` are proxied to localhost:8000 in dev (`proxy.conf.json`), so there are no CORS issues.

Other scripts: `npm run build`, `npm test`, `npm run serve:ssr:ecommerce`.

## Deploy

Deployed on ECS Fargate next to the api. The Docker image builds the app and serves `dist/ecommerce/browser` with a small node static server (`static-server.mjs`). I tried nginx and SSR first, but nginx wasn't reachable on Fargate and SSR rendering kept hanging, so for now it's served as a plain SPA. `/api` is routed to the backend service.
