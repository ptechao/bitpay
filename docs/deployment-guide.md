# 部署指南

## 概述

本文件提供聚合支付平台在生產環境中的部署指南。平台採用微服務架構，每個服務可以獨立部署和擴展。本指南將涵蓋 PostgreSQL 資料庫的部署配置以及微服務的部署策略。

## 前提條件

- 熟悉 Docker 和 Docker Compose (或 Kubernetes)
- 熟悉 Linux 作業系統
- 已安裝 Git

## PostgreSQL 部署配置

### 1. 安裝 PostgreSQL

建議在專用伺服器或雲端資料庫服務上部署 PostgreSQL。以下為在 Ubuntu 系統上安裝的基本步驟：

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### 2. 安全配置

- **防火牆**: 配置防火牆 (如 `ufw`) 僅允許應用伺服器或特定 IP 訪問 PostgreSQL 預設埠 `5432`。
  ```bash
  sudo ufw allow from <your_app_server_ip> to any port 5432
  sudo ufw enable
  ```
- **使用者與權限**: 創建專用資料庫使用者，並賦予其最小必要權限，避免使用預設的 `postgres` 超級使用者。
  ```bash
  sudo -i -u postgres
  createuser --pwprompt your_app_user
  createdb your_database_name -O your_app_user
  psql -d your_database_name -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;"
  psql -d your_database_name -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;"
  \q
  exit
  ```
- **遠端連線**: 修改 `postgresql.conf` 和 `pg_hba.conf` 允許遠端連線。通常 `postgresql.conf` 中的 `listen_addresses = '*'` 和 `pg_hba.conf` 中添加允許應用伺服器 IP 訪問的規則。

### 3. 資料庫備份與恢復

實施定期資料庫備份策略，例如使用 `pg_dump` 或雲服務商提供的備份解決方案。確保備份資料的異地存儲和可恢復性測試。

## 微服務部署策略

### 1. 環境變數配置

在生產環境中，應使用安全的方式管理環境變數，例如：

- **Docker Secrets**: 對於 Docker 容器部署。
- **Kubernetes Secrets**: 對於 Kubernetes 部署。
- **環境變數管理服務**: 例如 AWS Secrets Manager, Azure Key Vault, HashiCorp Vault。

確保以下 PostgreSQL 相關環境變數已正確配置：

```
PG_HOST=your_postgresql_host
PG_PORT=5432
PG_USER=your_app_user
PG_PASSWORD=your_app_password
PG_DATABASE=your_database_name

JWT_SECRET=your_strong_jwt_secret_key
JWT_EXPIRES_IN=1h
```

### 2. Docker 化部署

每個微服務都應具備 `Dockerfile`，以便於容器化部署。以下是一個範例 `Dockerfile` 結構：

```dockerfile
# Dockerfile for a Node.js microservice
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
CMD ["npm", "start"]
```

### 3. 容器編排 (Docker Compose / Kubernetes)

- **Docker Compose**: 適用於小型部署或開發環境。

  ```yaml
  version: '3.8'
  services:
    payment-service:
      build: ./services/payment
      environment:
        - PG_HOST=${PG_HOST}
        - PG_PORT=${PG_PORT}
        - PG_USER=${PG_USER}
        - PG_PASSWORD=${PG_PASSWORD}
        - PG_DATABASE=${PG_DATABASE}
        - JWT_SECRET=${JWT_SECRET}
      ports:
        - "3001:3000"
    # ... 其他微服務
    # ... PostgreSQL 服務 (如果部署在同一環境)
  ```

- **Kubernetes**: 適用於大規模、高可用和可擴展的生產環境。使用 Deployment、Service、Ingress 等資源來管理微服務。

### 4. 日誌與監控

- **日誌**: 配置微服務將日誌輸出到標準輸出 (stdout/stderr)，並使用集中式日誌系統 (如 ELK Stack, Grafana Loki) 進行收集、儲存和分析。
- **監控**: 使用 Prometheus, Grafana 等工具監控微服務的性能指標、資源使用情況和錯誤率。

### 5. 持續整合/持續部署 (CI/CD)

建立 CI/CD 流水線，自動化程式碼測試、建構 Docker 映像、部署到測試和生產環境的過程，確保快速、可靠的發布。

## 參考資料

[1] [Docker 官方網站](https://www.docker.com/)
[2] [Kubernetes 官方網站](https://kubernetes.io/)
[3] [PostgreSQL 官方文件](https://www.postgresql.org/docs/)
[4] [UFW (Uncomplicated Firewall) 文件](https://help.ubuntu.com/community/UFW)
