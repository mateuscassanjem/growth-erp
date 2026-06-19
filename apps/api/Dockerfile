FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --filter @growth/api... --frozen-lockfile=false

FROM deps AS build
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter @growth/shared build
RUN pnpm --filter @growth/api prisma:generate
RUN pnpm --filter @growth/api build

FROM base AS runner
ENV NODE_ENV=production
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/api ./apps/api
WORKDIR /app/apps/api
EXPOSE 3333
CMD ["sh", "-c", "pnpm prisma:migrate && pnpm start"]
