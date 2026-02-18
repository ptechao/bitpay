
/**
 * @file Dockerfile
 * @description 聚合支付平台應用程式的多階段 Dockerfile。
 *              包含構建 Node.js 服務和 React 前端的步驟，以優化映像大小和構建時間。
 * @author Manus AI
 * @date 2026-02-19
 */

# -----------------------------------------------------------------------------
# 階段 1: 構建 Node.js 服務
# -----------------------------------------------------------------------------
FROM node:20-alpine AS backend-builder

WORKDIR /app

COPY package.json package-lock.json ./ 
RUN npm install --production

COPY . .

# -----------------------------------------------------------------------------
# 階段 2: 構建 React 前端 (假設 portals/merchant-portal/client 是其中一個前端)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder

WORKDIR /app/portals/merchant-portal/client

COPY portals/merchant-portal/client/package.json portals/merchant-portal/client/package-lock.json ./ 
RUN npm install

COPY portals/merchant-portal/client/ ./
RUN npm run build

# -----------------------------------------------------------------------------
# 階段 3: 最終運行映像
# -----------------------------------------------------------------------------
FROM node:20-alpine AS final

WORKDIR /app

# 從 backend-builder 階段複製 Node.js 服務的依賴和程式碼
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app ./ 

# 從 frontend-builder 階段複製構建好的前端靜態檔案
COPY --from=frontend-builder /app/portals/merchant-portal/client/build ./portals/merchant-portal/client/build

# 暴露應用程式端口 (根據實際服務端口調整)
EXPOSE 3000
EXPOSE 3001
EXPOSE 3002

CMD ["node", "services/main-service/index.js"] # 假設有一個主服務入口點
