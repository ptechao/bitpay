# 聚合支付平台

## 專案名稱與簡介

**專案名稱**：聚合支付平台 (Aggregated Payment Platform)

**專案簡介**：本聚合支付平台旨在提供一個全面、高效且安全的支付解決方案，整合多種支付通道，支援多幣種交易，並具備靈活的代理分潤機制。平台採用微服務架構，確保系統的高可用性、可擴展性和易於維護性，旨在為商戶和代理商提供一站式的支付管理服務。

## 核心功能列表

*   **多幣種支付**：支援法幣與加密貨幣交易，具備匯率轉換功能。
*   **多支付通道整合**：無縫介接銀行、信用卡、電子錢包、加密貨幣交易所等。
*   **智能支付路由**：根據多重條件自動選擇最佳支付通道。
*   **API 收銀台與 QR 碼收銀台**：提供多樣化的支付發起方式。
*   **多層級代理管理**：支援無限層級代理，提供多種分潤模式（百分比、固定金額、Mark-up）。
*   **商戶生命週期管理**：包含註冊、審核、配置、交易查詢及結算設定。
*   **靈活結算系統**：支援 D+0 到 T+30 的商戶結算週期，可由上層指定。
*   **全面風控模組**：基於規則引擎、黑白名單、異常行為檢測及風險評分機制，保障交易安全。
*   **多語言支援**：提供繁體中文、簡體中文、英文、日文、韓文、泰文、越南文等介面。
*   **RESTful API 服務**：提供標準化的 API 介面供外部系統整合。

## 技術棧

本平台採用現代化的技術棧，以確保系統的性能、可擴展性和穩定性：

*   **架構風格**：微服務 (Microservices)
*   **容器化**：Docker
*   **容器編排**：Kubernetes
*   **前端框架**：React
*   **後端語言**：Node.js (Express.js / NestJS)
*   **資料庫：Supabase (PostgreSQL), MongoDB (非關聯式資料庫), Redis (快取)
*   **訊息佇列**：Kafka / RabbitMQ
*   **API 閘道**：Nginx / Kong
*   **監控**：Prometheus, Grafana
*   **日誌管理**：ELK Stack (Elasticsearch, Logstash, Kibana)
*   **身份驗證**：OAuth2.0, JWT

## 專案目錄結構說明

```
/project-root
├── docs/                           # 專案文件
│   ├── system-architecture.md      # 系統架構設計文件
│   ├── database-design.md          # 資料庫設計文件
│   ├── system-architecture.png     # 系統架構圖
│   ├── payment-flow.png            # 支付流程圖
│   ├── settlement-flow.png         # 結算流程圖
│   ├── agent-commission-flow.png   # 代理分潤流程圖
│   └── deployment-architecture.png # 部署架構圖
├── database/                       # 資料庫相關
│   └── schema.sql                  # PostgreSQL 建表語句
├── services/                       # 微服務程式碼目錄
│   ├── payment-service/            # 支付服務
│   ├── settlement-service/         # 結算服務
│   ├── agent-service/              # 代理服務
│   ├── merchant-service/           # 商戶服務
│   └── risk-control-service/       # 風控服務
├── gateways/                       # API 閘道服務
├── portals/                        # 前端應用程式目錄
│   ├── merchant-portal/            # 商戶端介面
│   ├── agent-portal/               # 代理管理端介面
│   └── admin-portal/               # 後台管理端介面
├── scripts/                        # 部署、維運腳本
├── configs/                        # 環境配置檔案
├── tests/                          # 測試程式碼
└── README.md                       # 專案總覽說明文件
```

## 快速開始指引 (佔位)

此處將提供詳細的環境設定、依賴安裝、專案建構與啟動步驟。

## 環境變數說明

為了正確運行平台服務，需要配置以下環境變數：

*   `NODE_ENV`: 運行環境 (e.g., `development`, `production`)
*   `PORT`: 服務監聽的端口 (e.g., `3000`)
*   `SUPABASE_URL`: Supabase 專案的 URL，可在 Supabase 專案設定中找到。
*   `SUPABASE_ANON_KEY`: Supabase 專案的公開匿名金鑰，用於前端和需要匿名存取的後端服務。
*   `SUPABASE_SERVICE_ROLE_KEY`: Supabase 專案的服務角色金鑰，擁有完整資料庫權限，**僅限後端服務使用，需嚴格保密**。
*   `JWT_SECRET`: 用於簽署和驗證 JWT 的密鑰 (如果服務有自定義 JWT 需求)
*   `REDIS_URL`: Redis 連線 URL (如果使用 Redis)
*   `MONGODB_URI`: MongoDB 連線 URI (如果使用 MongoDB)

每個微服務在其 `.env.example` 檔案中會列出該服務所需的具體環境變數。請根據實際部署環境配置這些變數。
