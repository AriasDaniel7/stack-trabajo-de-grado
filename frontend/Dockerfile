FROM node:22-alpine AS base
WORKDIR /usr/src/app

FROM base AS install
COPY package*.json ./
RUN npm ci && npm cache clean --force

FROM base AS build
COPY --from=install /usr/src/app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS production
COPY --from=build /usr/src/app/dist ./dist
COPY --from=install /usr/src/app/node_modules ./node_modules

USER node

CMD ["node", "dist/frontend/server/server.mjs"]
