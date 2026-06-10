FROM node:24-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json* .
RUN npm install


FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

ARG API_URL
ENV API_URL=$API_URL
RUN npm run build


FROM node:24-alpine AS runner
WORKDIR /app
COPY --from=builder --chown=node:node /app/public ./public
ENV NEXT_TELEMETRY_DISABLED=1

RUN mkdir .next
RUN chown node:node .next
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

CMD ["node", "server.js"]