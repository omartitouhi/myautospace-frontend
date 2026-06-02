# ---- build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies first for better layer caching. `npm install` (not `npm ci`)
# so the build is robust to a lockfile generated on a different OS — npm resolves
# the correct platform-specific binaries (rollup/oxc musl builds) inside the image.
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund

# Build the static site (outputs to /app/dist).
COPY . .
RUN npm run build

# ---- serve stage ----
FROM nginx:alpine AS final

# SPA-aware nginx config (history fallback + asset caching).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ship only the built static assets.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
