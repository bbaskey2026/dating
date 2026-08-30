FROM node:20-alpine AS builder

WORKDIR /app
COPY node/package.json node/package-lock.json* ./
COPY node/packages/ ./packages/
COPY node/services/api-node/ ./services/api-node/

RUN npm install
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app /app

EXPOSE 4000
CMD ["npm", "start"]
