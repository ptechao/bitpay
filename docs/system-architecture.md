# 系統架構設計

## 概述

本文件描述了聚合支付平台的系統架構，旨在提供一個高可用、可擴展且安全的支付解決方案。系統採用微服務架構，將不同的業務功能劃分為獨立的服務，便於開發、部署和維護。

## 技術棧

- **後端**: Node.js (Express.js)
- **資料庫**: PostgreSQL
- **快取**: Redis
- **訊息佇列**: RabbitMQ
- **認證**: JWT

## 微服務列表

- **Payment Service**: 處理支付交易的核心邏輯。
- **Merchant Service**: 管理商戶資訊、帳戶和配置。
- **Agent Service**: 管理代理商資訊和佣金結算。
- **Settlement Service**: 負責交易結算和資金清算。
- **Risk Control Service**: 實時監控交易，防範欺詐和風險。
- **Channel Service**: 管理支付通道配置和路由。

## 架構圖

```mermaid
graph TD
    A[用戶/商戶] -->|發起交易/查詢| B(API Gateway)
    B -->|認證/路由| C{認證服務}
    C -->|JWT 驗證| D[微服務群]
    D -->|調用| E[Payment Service]
    D -->|調用| F[Merchant Service]
    D -->|調用| G[Agent Service]
    D -->|調用| H[Settlement Service]
    D -->|調用| I[Risk Control Service]
    D -->|調用| J[Channel Service]
    E -->|讀寫| K(PostgreSQL)
    F -->|讀寫| K
    G -->|讀寫| K
    H -->|讀寫| K
    I -->|讀寫| K
    J -->|讀寫| K
    D -->|發送事件| L[訊息佇列 (RabbitMQ)]
    L -->|消費事件| D
    D -->|讀寫| M[快取 (Redis)]
```

## 資料庫設計

採用 PostgreSQL 作為主要資料庫，每個微服務負責管理其相關的資料表。資料庫層不包含 Supabase RLS，權限控制將在應用層實現。

## 認證與授權

系統採用 JWT (JSON Web Token) 進行用戶認證和授權。用戶登入後，認證服務會簽發一個 JWT，後續請求將攜帶此 Token 進行驗證。

## 部署考量

微服務將部署在容器化環境中 (例如 Docker, Kubernetes)，便於擴展和管理。每個服務可以獨立部署和擴展。

## 參考資料

[1] [Node.js](https://nodejs.org/)
[2] [Express.js](https://expressjs.com/)
[3] [PostgreSQL](https://www.postgresql.org/)
[4] [Redis](https://redis.io/)
[5] [RabbitMQ](https://www.rabbitmq.com/)
[6] [JWT](https://jwt.io/)
