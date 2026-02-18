# 聚合支付平台部署步驟文件

## 前言

本文件旨在提供聚合支付平台的詳細部署指南，涵蓋開發、測試、生產環境的部署流程，並提供 Docker 容器化、Nginx 反向代理、SSL 設定以及監控與日誌的建議。本指南將協助開發者和維運人員高效、安全地部署和管理平台服務。

## 1. 部署環境概述

聚合支付平台採用微服務架構，建議使用容器化技術進行部署，以確保環境一致性和可擴展性。本指南將針對以下常見部署環境提供指導：

*   **開發環境 (Development Environment)**：主要用於開發人員進行功能開發、單元測試和本地調試。
*   **測試環境 (Testing Environment)**：用於整合測試、系統測試、性能測試和使用者驗收測試 (UAT)。
*   **生產環境 (Production Environment)**：對外提供服務的正式運行環境，要求高可用、高穩定和高安全。

## 2. 開發環境部署

開發環境部署通常在開發人員的本地機器上進行，旨在提供快速迭代和調試的能力。

1.  **前置條件**：
    *   已安裝 Node.js (建議 LTS 版本)。
    *   已安裝 pnpm。
    *   已安裝 Git。
    *   已安裝 Docker 和 Docker Compose (推薦)。
    *   已配置 Supabase 專案並匯入資料庫 Schema (參考 `docs/installation-guide.md`)。

2.  **複製專案程式碼**：
    ```bash
    git clone <您的專案 Git 倉庫地址>
    cd <您的專案目錄>
    ```

3.  **配置環境變數**：
    *   進入每個微服務和前端應用的目錄 (例如 `services/payment-service`, `portals/merchant-portal`)。
    *   複製 `.env.example` 到 `.env`：`cp .env.example .env`。
    *   編輯 `.env` 檔案，填寫 Supabase 相關金鑰 (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) 及其他服務特定變數。

4.  **安裝依賴並啟動服務**：
    *   對於每個微服務：
        ```bash
        cd services/<service-name>
        pnpm install
        pnpm start # 或使用 pnpm dev 進行熱重載開發
        ```
    *   對於每個前端應用：
        ```bash
        cd portals/<portal-name>
        pnpm install
        pnpm dev
        ```

5.  **使用 Docker Compose (推薦)**：
    *   專案根目錄可能包含 `docker-compose.dev.yml` 檔案，用於一鍵啟動所有服務。
    *   執行：`docker-compose -f docker-compose.dev.yml up --build`。

## 3. 測試環境部署

測試環境應盡可能模擬生產環境，用於進行全面的測試。

1.  **前置條件**：
    *   一台或多台 Linux 伺服器 (例如 Ubuntu 22.04)。
    *   已安裝 Docker 和 Docker Compose (或 Kubernetes)。
    *   已配置 Supabase 專案並匯入資料庫 Schema。
    *   已安裝 Nginx (用於反向代理和 SSL 終止)。

2.  **自動化部署 (CI/CD)**：
    *   建議設定 CI/CD 流水線 (例如 GitLab CI/CD, GitHub Actions, Jenkins)，當程式碼合併到 `develop` 或 `release` 分支時，自動觸發建構、測試和部署到測試環境。
    *   CI/CD 流程應包括：
        *   程式碼拉取。
        *   依賴安裝。
        *   單元測試、整合測試。
        *   Docker 映像建構並推送到容器註冊中心 (如 Docker Hub, GitLab Container Registry)。
        *   透過 SSH 或 Kubernetes 部署工具 (如 Helm) 將服務部署到測試伺服器。

3.  **手動部署 (範例)**：
    *   在測試伺服器上，拉取最新的 Docker 映像。
    *   建立 `.env` 檔案，配置測試環境的環境變數。
    *   使用 Docker Compose 或 Kubernetes 部署服務。
        ```bash
        # Docker Compose 範例
        docker-compose -f docker-compose.test.yml pull
        docker-compose -f docker-compose.test.yml up -d
        ```

## 4. 生產環境部署

生產環境部署是整個流程中最關鍵的一步，需要嚴格遵循最佳實踐，確保高可用性、安全性和可擴展性。

1.  **前置條件**：
    *   多台高可用 Linux 伺服器或 Kubernetes 集群。
    *   已安裝 Docker 和 Kubernetes (推薦)。
    *   已配置 Supabase 專案並匯入資料庫 Schema。
    *   已安裝 Nginx 或其他負載均衡器 (如 Traefik, HAProxy)。
    *   已申請並配置 SSL 憑證 (例如 Let's Encrypt)。

2.  **自動化部署 (CI/CD)**：
    *   設定嚴格的 CI/CD 流水線，當程式碼合併到 `main` 或 `master` 分支時，自動觸發建構、測試和部署到生產環境。
    *   生產環境的部署應包含灰度發布、藍綠部署或滾動更新策略，以最小化服務中斷時間。

3.  **Docker 容器化建議**：
    *   為每個微服務建立輕量級的 Docker 映像。
    *   使用多階段建構 (Multi-stage builds) 來減小映像大小。
    *   確保 Dockerfile 中不包含敏感資訊。
    *   使用非 root 使用者運行容器。

4.  **Kubernetes 部署 (推薦)**：
    *   使用 Kubernetes (K8s) 進行容器編排，實現服務的自動擴縮、負載均衡、自我修復和零停機部署。
    *   為每個服務定義 Deployment、Service、Ingress 等 K8s 資源。
    *   使用 ConfigMap 和 Secret 管理環境變數和敏感資訊。
    *   實施資源限制和請求，防止單一服務耗盡集群資源。

## 5. Nginx 反向代理配置

Nginx 作為反向代理，可以提供負載均衡、SSL 終止、靜態檔案服務和 API 路由等功能。

1.  **安裝 Nginx**：
    ```bash
    sudo apt update
    sudo apt install nginx
    ```

2.  **配置範例 (`/etc/nginx/sites-available/your_app`)**：
    ```nginx
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl;
        server_name yourdomain.com www.yourdomain.com;

        ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384';
        ssl_prefer_server_ciphers off;

        location /api/payment/ {
            proxy_pass http://payment-service:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/merchant/ {
            proxy_pass http://merchant-service:3001;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # ... 其他微服務的配置

        location / {
            # 前端應用靜態檔案服務
            root /var/www/your_frontend_app;
            index index.html index.htm;
            try_files $uri $uri/ /index.html;
        }
    }
    ```

3.  **啟用配置**：
    ```bash
    sudo ln -s /etc/nginx/sites-available/your_app /etc/nginx/sites-enabled/
    sudo nginx -t # 測試配置語法
    sudo systemctl reload nginx # 重載 Nginx
    ```

## 6. SSL 設定

為確保通訊安全，所有對外服務都應使用 HTTPS。建議使用 Certbot 搭配 Let's Encrypt 自動申請和續訂 SSL 憑證。

1.  **安裝 Certbot**：
    ```bash
    sudo snap install core
    sudo snap refresh core
    sudo snap install --classic certbot
    sudo ln -s /snap/bin/certbot /usr/bin/certbot
    ```

2.  **申請憑證**：
    *   如果 Nginx 已經運行在 80 端口，Certbot 可以自動配置：
        ```bash
        sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
        ```
    *   如果 Nginx 尚未配置，可以只獲取憑證：
        ```bash
        sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
        ```

3.  **自動續訂**：
    *   Certbot 會自動設定一個 cron job 來續訂憑證。您可以測試續訂過程：
        ```bash
        sudo certbot renew --dry-run
        ```

## 7. 監控與日誌

建立完善的監控和日誌系統對於生產環境的穩定運行至關重要。

1.  **監控 (Prometheus & Grafana)**：
    *   **Prometheus**：用於收集各微服務的運行指標 (Metrics)。每個微服務應暴露 `/metrics` 端點，提供標準的 Prometheus 格式指標。
    *   **Grafana**：用於可視化 Prometheus 收集的指標，建立儀表板以實時監控系統健康狀況、性能指標和業務數據。
    *   **Alertmanager**：與 Prometheus 整合，用於發送警報通知 (例如郵件、Slack、Webhook)。

2.  **日誌管理 (ELK Stack)**：
    *   **Elasticsearch**：分散式搜尋和分析引擎，用於儲存和索引所有服務的日誌數據。
    *   **Logstash**：日誌收集、處理和轉發工具，將日誌從各服務收集到 Elasticsearch。
    *   **Kibana**：日誌可視化工具，用於搜尋、分析和展示日誌數據，方便故障排查和業務分析。
    *   **Filebeat/Fluentd**：輕量級日誌收集器，部署在每個服務的宿主機上，將日誌發送到 Logstash 或直接發送到 Elasticsearch。

3.  **日誌規範**：
    *   所有服務應採用結構化日誌 (JSON 格式)，包含時間戳、服務名稱、日誌級別、請求 ID、錯誤訊息等關鍵資訊。
    *   日誌級別應區分 `DEBUG`, `INFO`, `WARN`, `ERROR`, ` `FATAL`。
    *   敏感資訊（如密碼、API 金鑰）絕不能出現在日誌中。
