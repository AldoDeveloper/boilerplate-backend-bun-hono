# ---------- process deps (production only) ----------
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock* bun.lockb* ./
RUN bun install --production --frozen-lockfile

# ---------- process build ----------
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock* bun.lockb* ./
RUN bun install --frozen-lockfile
COPY tsconfig.json ./
COPY src ./src
RUN bun run build

# ---------- process final runtime ----------
FROM oven/bun:1 AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000

COPY --from=deps  --chown=bun:bun /app/node_modules ./node_modules
COPY --from=build --chown=bun:bun /app/dist ./dist
COPY --chown=bun:bun package.json ./
COPY --chown=bun:bun cli ./cli
COPY --chown=bun:bun database ./database

USER bun
EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://localhost:' + (process.env.PORT || 3000) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["bun", "run", "start"]