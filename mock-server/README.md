# 聚合支付平台 Mock API Server

## 前言
本 Mock Server 使用 Express.js 建立，旨在為前端開發提供穩定的 API 模擬環境。支援 CORS、模擬延遲及各種錯誤場景，確保前端邏輯在對接真實 API 前已得到充分測試。

## 快速開始

### 1. 安裝依賴
```bash
cd mock-server
npm install
```

### 2. 啟動伺服器
```bash
npm start
```
伺服器預設運行於 `http://localhost:3001`。

## 功能特性
- **模擬延遲**：預設延遲 500ms，可透過環境變數 `MOCK_DELAY` 調整。
- **CORS 支援**：允許跨域請求。
- **異步回調模擬**：建立支付訂單後，伺服器會在 5 秒後自動模擬發送支付成功回調。
- **隨機狀態**：查詢訂單詳情時，會隨機返回不同的支付狀態（SUCCESS, FAILED, PENDING, TIMEOUT）。

## API 端點概覽

| 模組 | 路徑 | 描述 |
| :--- | :--- | :--- |
| 認證 | `/api/auth/login` | 模擬登入 |
| 支付 | `/api/payments` | 建立支付訂單 |
| 支付 | `/api/payments/:orderId` | 查詢訂單詳情 |
| 商戶 | `/api/merchants` | 獲取商戶列表 |
| 代理 | `/api/agents` | 獲取代理列表 |
| 結算 | `/api/settlements` | 獲取結算單列表 |
| 通道 | `/api/channels` | 獲取通道列表 |
| 風控 | `/api/risk/rules` | 獲取風控規則 |

## 模擬回調測試
您可以手動觸發回調模擬：
```bash
curl -X POST http://localhost:3001/api/payments/simulate-callback \
  -H "Content-Type: application/json" \
  -d '{"platform_order_id": "PAY_123456", "status": "SUCCESS"}'
```
