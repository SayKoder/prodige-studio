# ─── Étape 1 : dépendances ───────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ─── Étape 2 : build ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── Étape 3 : runner ────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Prisma client + CLI (pour migrate deploy au démarrage)
COPY --from=builder /app/node_modules/.prisma        ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/prisma         ./node_modules/prisma
COPY prisma ./prisma

# Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public

# Dossier uploads (monté en volume en prod)
RUN mkdir -p public/uploads && chown nextjs:nodejs public/uploads

# Script de démarrage
COPY scripts/entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh && chown nextjs:nodejs entrypoint.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENTRYPOINT ["./entrypoint.sh"]
