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

# SPA-aware nginx config (history fallback + asset caching + /api proxy).
# Placed in /etc/nginx/templates so the entrypoint substitutes ${API_UPSTREAM}
# at startup — point it at the YARP gateway for the target environment.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
ENV API_UPSTREAM=http://host.docker.internal:5050

# Ship only the built static assets.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
