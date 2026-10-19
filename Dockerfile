FROM node:20-bookworm-slim AS builder

WORKDIR /app

RUN corepack enable

COPY backend/package.json backend/pnpm-lock.yaml backend/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY backend/ .
RUN pnpm run build


FROM node:20-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable

COPY backend/package.json backend/pnpm-lock.yaml backend/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

EXPOSE 4000

CMD ["node", "dist/main.js"]
