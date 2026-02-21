# Dockerfile
# 聚合支付平台應用程式的多階段 Dockerfile。
# 包含構建 Node.js 後端服務和前端門戶的步驟。

# -----------------------------------------------------------------------------
# 階段 1: 後端服務基礎映像
# -----------------------------------------------------------------------------
FROM node:20-alpine AS backend-base

WORKDIR /app

# 複製共用模組
COPY services/shared/ ./services/shared/
# 安裝 shared 所需的常見套件以避免 run-time 缺少依賴（例如 knex）
RUN npm install knex pg jsonwebtoken --no-save || true

# -----------------------------------------------------------------------------
# 階段 2: Payment Service
# -----------------------------------------------------------------------------
FROM backend-base AS payment-service

WORKDIR /app/services/payment-service
COPY services/payment-service/package*.json ./
RUN npm ci --production || npm install --production || true
COPY services/shared/ ./services/shared/
COPY services/payment-service/ ./

WORKDIR /app
EXPOSE 3001
CMD ["node", "services/payment-service/index.js"]

# -----------------------------------------------------------------------------
# 階段 3: Merchant Service
# -----------------------------------------------------------------------------
FROM backend-base AS merchant-service

WORKDIR /app/services/merchant-service
COPY services/merchant-service/package*.json ./
RUN npm ci --production || npm install --production || true
COPY services/shared/ ./services/shared/
COPY services/merchant-service/ ./

WORKDIR /app
EXPOSE 3002
CMD ["node", "services/merchant-service/index.js"]

# -----------------------------------------------------------------------------
# 階段 4: Agent Service
# -----------------------------------------------------------------------------
FROM backend-base AS agent-service

WORKDIR /app/services/agent-service
COPY services/agent-service/package*.json ./
RUN npm install --production || true
# ensure knex present in case install cache missed
RUN npm install knex pg jsonwebtoken --no-save || true
COPY services/agent-service/ ./

WORKDIR /app
EXPOSE 3003
CMD ["node", "services/agent-service/index.js"]

# -----------------------------------------------------------------------------
# 階段 5: Settlement Service
# -----------------------------------------------------------------------------
FROM backend-base AS settlement-service

WORKDIR /app/services/settlement-service
COPY services/settlement-service/package*.json ./
RUN npm ci --production || npm install --production || true
COPY services/shared/ ./services/shared/
COPY services/settlement-service/ ./

WORKDIR /app
EXPOSE 3004
CMD ["node", "services/settlement-service/index.js"]

# -----------------------------------------------------------------------------
# 階段 6: Risk Control Service
# -----------------------------------------------------------------------------
FROM backend-base AS risk-control-service

WORKDIR /app/services/risk-control-service
COPY services/risk-control-service/package*.json ./
RUN npm ci --production || npm install --production || true
COPY services/shared/ ./services/shared/
COPY services/risk-control-service/ ./

WORKDIR /app
EXPOSE 3005
CMD ["node", "services/risk-control-service/index.js"]

# -----------------------------------------------------------------------------
# 階段 7: Channel Service
# -----------------------------------------------------------------------------
FROM backend-base AS channel-service

WORKDIR /app/services/channel-service
COPY services/channel-service/package*.json ./
RUN npm ci --production || npm install --production || true
COPY services/shared/ ./services/shared/
COPY services/channel-service/ ./

WORKDIR /app
EXPOSE 3006
CMD ["node", "services/channel-service/index.js"]

# -----------------------------------------------------------------------------
# 階段 8: Sandbox Service
# -----------------------------------------------------------------------------
FROM backend-base AS sandbox-service

WORKDIR /app/services/sandbox-service
COPY services/sandbox-service/package*.json ./
RUN npm install --production || true
# ensure uuid present
RUN npm install uuid --no-save || true
COPY services/sandbox-service/ ./

WORKDIR /app
EXPOSE 3007
CMD ["node", "services/sandbox-service/index.js"]

# -----------------------------------------------------------------------------
# 階段 9: Merchant Portal 前端構建
# -----------------------------------------------------------------------------
FROM node:20-alpine AS merchant-portal-build

WORKDIR /app
COPY portals/merchant-portal/package*.json ./
RUN npm install --legacy-peer-deps
COPY portals/merchant-portal/ ./
RUN npm run build

# Merchant Portal 運行映像
FROM node:20-alpine AS merchant-portal
RUN npm install -g serve
WORKDIR /app
COPY --from=merchant-portal-build /app/dist/public ./build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "0.0.0.0:3000"]

# -----------------------------------------------------------------------------
# 階段 10: Agent Portal 前端構建
# -----------------------------------------------------------------------------
FROM node:20-alpine AS agent-portal-build

WORKDIR /app
COPY portals/agent-portal/package*.json ./
RUN npm install --legacy-peer-deps
COPY portals/agent-portal/ ./
RUN npm run build

# Agent Portal 運行映像
FROM node:20-alpine AS agent-portal
RUN npm install -g serve
WORKDIR /app
COPY --from=agent-portal-build /app/dist/public ./build
EXPOSE 3008
CMD ["serve", "-s", "build", "-l", "0.0.0.0:3008"]

# -----------------------------------------------------------------------------
# 階段 11: Admin Portal 前端構建
# -----------------------------------------------------------------------------
FROM node:20-alpine AS admin-portal-build

WORKDIR /app
COPY portals/admin-portal/package*.json ./
RUN npm install --legacy-peer-deps
# ensure ajv is available for react-scripts / terser-webpack-plugin compatibility
RUN npm install ajv@8.12.0 --no-save || true
COPY portals/admin-portal/ ./
RUN npm run build

# Admin Portal 運行映像
FROM node:20-alpine AS admin-portal
RUN npm install -g serve
WORKDIR /app
COPY --from=admin-portal-build /app/build ./build
EXPOSE 3009
CMD ["serve", "-s", "build", "-l", "0.0.0.0:3009"]
