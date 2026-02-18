# 聚合支付平台

## 概述

這是一個基於微服務架構的聚合支付平台，旨在提供高效、安全且可擴展的支付解決方案。平台支援多種支付方式、商戶管理、代理商管理、交易結算和風險控制等功能。

## 技術棧

### 後端
- **語言**: Node.js
- **框架**: Express.js
- **資料庫**: PostgreSQL (自建)
- **資料庫 ORM/Query Builder**: `knex.js`
- **資料庫驅動**: `pg` (node-postgres)
- **認證**: JWT (`jsonwebtoken`, `bcrypt`)
- **快取**: Redis
- **訊息佇列**: RabbitMQ

### 前端
- **框架**: React.js
- **認證**: 自建 JWT 認證模組
- **API 請求**: `axios` 或 `fetch`

## 專案結構

```
. 
├── docs/                       # 專案文件 (系統架構、資料庫設計、安裝部署指南等)
├── database/                   # 資料庫相關檔案 (schema.sql)
├── services/                   # 後端微服務目錄
│   ├── payment/                # 支付服務
│   ├── merchant/               # 商戶服務
│   ├── agent/                  # 代理商服務
│   ├── settlement/             # 結算服務
│   ├── risk-control/           # 風控服務
│   ├── channel/                # 通道服務
│   └── shared/                 # 微服務共用模組
│       ├── middlewares/        # 共用中間件 (如 JWT 認證)
│       └── config/             # 共用配置 (如資料庫配置)
├── src/                        # 核心配置，例如資料庫連線
│   └── config/
├── shared/                     # 前端共用模組
│   ├── auth/                   # 認證相關模組 (AuthProvider, useAuth)
│   └── api/                    # API 串接模組 (client.ts, auth.ts)
├── .env.example                # 環境變數範例檔案
├── package.json                # 專案依賴與腳本
└── README.md                   # 專案說明文件
```

## 環境變數

請複製 `.env.example` 檔案並將其命名為 `.env`，然後根據您的環境配置以下變數：

```ini
# PostgreSQL Configuration
PG_HOST=localhost
PG_PORT=5432
PG_USER=your_username
PG_PASSWORD=your_password
PG_DATABASE=your_database_name

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_very_long_and_complex
JWT_EXPIRES_IN=1h

# 其他服務的環境變數 (例如 Redis, RabbitMQ)
# REDIS_HOST=localhost
# RABBITMQ_URL=amqp://localhost
```

## 安裝與啟動

請參考 `docs/installation-guide.md` 獲取詳細的安裝和啟動步驟。

## 部署

請參考 `docs/deployment-guide.md` 獲取詳細的部署指南。

## 貢獻

歡迎貢獻！請遵循標準的 Git Flow 流程，並提交 Pull Request。

## 許可證

[MIT License](LICENSE)
