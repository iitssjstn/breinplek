# Debian-based (glibc) i.p.v. Alpine (musl): Next.js' SWC-compiler heeft
# platform-specifieke binaries, en die matchen niet altijd betrouwbaar met
# een lockfile dat op een glibc-systeem is gegenereerd. Debian-slim voorkomt
# die hele klasse build-fouten.

# --- deps: install dependencies ---
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# --- builder: build the Next.js app ---
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- runner: minimal production image ---
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Content lives outside the build output so it can be mounted as a volume
# and edited without rebuilding the image.
COPY --from=builder --chown=nextjs:nodejs /app/content ./content

# Writable data dir for the one-time admin setup (password hash + session
# secret). Created here so it exists (and is owned by nextjs) even before a
# volume is mounted over it.
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
