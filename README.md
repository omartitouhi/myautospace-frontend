# MyAutoSpace — Frontend

React 19 + Vite SPA for the MyAutoSpace vehicle marketplace (Tunisian market,
FR default / EN toggle, light & dark themes). A public marketing landing page
plus a full authenticated app backed by the MyAutoSpace microservices through
the YARP API gateway.

## What's inside

- **Landing** (`/`) — marketing page, public.
- **Auth** (`/login`, `/register`) — register with a role (Buyer / Seller /
  ServiceProvider), JWT session with automatic refresh-token renewal.
- **Onboarding** (`/app/welcome`) — creates the UserService profile after
  first sign-in.
- **Browse** (`/app`) — live listings from VehicleService with filters and
  sorting; the search box uses SearchService autocomplete and full-text search,
  falling back to local matching when search is unavailable.
- **Vehicle detail** (`/app/vehicles/:id`) — specs, description, and owner
  management actions (publish / unpublish / mark sold / delete).
- **My garage** (`/app/garage`) + **Sell** (`/app/sell`, `/app/sell/:id`) —
  seller listing management, create & edit forms.
- **Profile** (`/app/profile`) — profile edit, trust score (with recalculate),
  preferences, recent activity.
- **Notifications** (`/app/notifications`) — delivery history with per-attempt
  details.

## Development

```powershell
npm install
npm run dev       # Vite dev server with HMR (http://localhost:5173)
npm run build     # production build
npm run lint      # ESLint
npm run preview   # serve the production build
```

API calls go to `/api/*` and are proxied by the Vite dev server to the YARP
gateway. The default target is `http://localhost:5256` (gateway run with
`dotnet run`). When the backend runs via docker compose, the gateway is
published on `5050`:

```powershell
$env:VITE_API_PROXY = 'http://localhost:5050'; npm run dev
```

## Docker

```powershell
docker compose up --build   # http://localhost:8080
```

Multi-stage build (Node build → nginx serve). nginx serves the SPA with a
history fallback and reverse-proxies `/api/*` to the gateway; the upstream is
set with the `API_UPSTREAM` env var (default
`http://host.docker.internal:5050`, matching the backend compose mapping).

## Structure

```
src/
  App.jsx            route table
  main.jsx           providers: Router > UI (lang/theme) > Auth
  index.css          the whole design system (liquid-glass tokens + app styles)
  lib/
    api.js           gateway client: bearer token, single-flight refresh, endpoints
    auth.js / ui.js  context hooks (component-free for react-refresh)
    i18n.js          all visible copy, fr + en
    format.js        price/date/relative-time formatting
    hooks.js         motion hooks
    Icon.jsx         inline single-stroke icon set
  components/        landing sections + AuthProvider/UIProvider
  components/app/    app shell (AppNav), shared UI primitives, VehicleCard
  pages/             Landing, auth/, app/
```
