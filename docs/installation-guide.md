# 聚合支付平台系統建置安裝指南

## 前言

本文件旨在提供聚合支付平台的詳細建置與安裝指南，涵蓋環境需求、Supabase 專案設定、資料庫 schema 匯入、各後端服務與前端應用程式的安裝與啟動步驟，以及環境變數配置說明。本指南將協助開發者和維運人員快速搭建開發、測試或生產環境。

## 1. 環境需求

在開始安裝之前，請確保您的系統滿足以下環境要求：

*   **Node.js**: 建議使用 LTS 版本，例如 `Node.js 18.x` 或更高版本。
*   **pnpm**: 作為套件管理器，請確保已安裝 `pnpm`。如果尚未安裝，可透過 npm 安裝：`npm install -g pnpm`。
*   **Supabase 帳號**: 需要一個 Supabase 帳號以建立和管理專案。請前往 [Supabase 官方網站](https://supabase.com/) 註冊並登入。
*   **Git**: 版本控制工具。
*   **Docker & Docker Compose**: (建議) 用於容器化部署和本地開發環境搭建。

## 2. Supabase 專案建立與設定

1.  **建立新專案**：
    *   登入 Supabase Dashboard。
    *   點擊 "New project"，選擇一個組織 (Organization) 或建立一個新組織。
    *   輸入專案名稱、資料庫密碼，選擇最近的區域 (Region)。
    *   點擊 "Create new project"。

2.  **獲取 API 金鑰**：
    *   專案建立完成後，進入專案設定頁面 (Project Settings) -> "API"。
    *   記錄下 `Project URL` (即 `SUPABASE_URL`)、`anon public` 金鑰 (即 `SUPABASE_ANON_KEY`) 和 `service_role` 金鑰 (即 `SUPABASE_SERVICE_ROLE_KEY`)。這些金鑰將用於配置後端服務的環境變數。

3.  **啟用 Row Level Security (RLS)**：
    *   在 Supabase Dashboard 中，導航到 "Authentication" -> "Policies"。
    *   對於需要實施精細權限控制的表，請確保已啟用 RLS。RLS 策略將在資料庫 schema 匯入步驟中定義。

## 3. 資料庫 Schema 匯入步驟

1.  **準備 Schema 檔案**：
    *   確保您擁有最新的 `database/schema.sql` 檔案，其中包含了所有表結構、索引、約束以及 RLS 策略定義。

2.  **透過 Supabase SQL Editor 匯入**：
    *   登入 Supabase Dashboard，進入您的專案。
    *   導航到 "SQL Editor"。
    *   點擊 "New query"。
    *   將 `schema.sql` 檔案的內容複製並貼上到 SQL Editor 中。
    *   點擊 "Run" 執行 SQL 語句。這將建立所有必要的資料庫表和 RLS 策略。

3.  **驗證 Schema**：
    *   導航到 "Table Editor"，檢查所有表是否已成功建立。
    *   導航到 "Authentication" -> "Policies"，檢查 RLS 策略是否已正確應用。

## 4. 各後端服務安裝與啟動步驟

聚合支付平台由多個微服務組成。每個服務的安裝和啟動步驟類似。

1.  **複製專案程式碼**：
    ```bash
    git clone <您的專案 Git 倉庫地址>
    cd <您的專案目錄>
    ```

2.  **安裝依賴**：
    *   進入每個服務的目錄 (例如 `services/payment-service`)。
    *   安裝 Node.js 依賴：
        ```bash
        pnpm install
        ```

3.  **配置環境變數**：
    *   在每個服務的根目錄下，複製 `.env.example` 檔案並命名為 `.env`：
        ```bash
        cp .env.example .env
        ```
    *   編輯 `.env` 檔案，填入從 Supabase Dashboard 獲取的 `SUPABASE_URL`、`SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`，以及其他服務特定的環境變數。

4.  **啟動服務**：
    *   在每個服務的目錄下，執行啟動命令：
        ```bash
        pnpm start
        ```
    *   服務將在指定的端口上啟動。您可以根據需要使用 `pm2` 或 Docker 進行進程管理和部署。

**服務列表**：
*   `payment-service`
*   `merchant-service`
*   `agent-service`
*   `settlement-service`
*   `risk-control-service`
*   `channel-service`

請對每個服務重複上述步驟。

## 5. 各前端應用安裝與啟動步驟

聚合支付平台包含多個前端應用程式。每個前端應用的安裝和啟動步驟類似。

1.  **安裝依賴**：
    *   進入每個前端應用的目錄 (例如 `portals/merchant-portal`)。
    *   安裝 Node.js 依賴：
        ```bash
        pnpm install
        ```

2.  **配置環境變數**：
    *   在每個前端應用的根目錄下，複製 `.env.example` 檔案並命名為 `.env`。
    *   編輯 `.env` 檔案，填入 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`，以及其他前端應用特定的環境變數。

3.  **啟動應用**：
    *   在每個前端應用的目錄下，執行啟動命令：
        ```bash
        pnpm dev
        ```
    *   應用將在指定的端口上啟動，並可在瀏覽器中訪問。

**前端應用列表**：
*   `merchant-portal`
*   `agent-portal`
*   `admin-portal`

請對每個前端應用重複上述步驟。

## 6. 環境變數配置說明

以下是平台中常用的環境變數及其說明：

*   `NODE_ENV`: 運行環境，例如 `development`, `production`, `test`。
*   `PORT`: 服務監聽的端口號。
*   `SUPABASE_URL`: 您的 Supabase 專案 URL，格式為 `https://<project-ref>.supabase.co`。
*   `SUPABASE_ANON_KEY`: 您的 Supabase 專案公開匿名金鑰，用於前端和需要匿名存取的後端服務。
*   `SUPABASE_SERVICE_ROLE_KEY`: 您的 Supabase 專案服務角色金鑰，擁有完整資料庫權限，**僅限後端服務使用，需嚴格保密**。
*   `JWT_SECRET`: (可選) 如果您的服務有自定義 JWT 簽署需求，則需要此密鑰。
*   `REDIS_URL`: (可選) Redis 伺服器的連線 URL，例如 `redis://localhost:6379`。
*   `MONGODB_URI`: (可選) MongoDB 伺服器的連線 URI，例如 `mongodb://localhost:27017/mydatabase`。

請確保在部署到不同環境時，正確配置這些環境變數。

## 7. 常見問題排除

*   **Supabase 連線問題**：
    *   檢查 `.env` 檔案中的 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`/`SUPABASE_SERVICE_ROLE_KEY` 是否正確。
    *   確保您的網路環境允許連線到 Supabase 服務。
    *   檢查 Supabase 專案的 API 設定中是否有 IP 白名單限制。
*   **RLS 權限問題**：
    *   如果您遇到資料庫存取被拒絕的問題，請檢查相關表的 RLS 策略是否正確配置。
    *   確保 JWT 中包含正確的 `role` 和 `uid` 資訊，並且 RLS 策略與之匹配。
    *   在開發環境中，可以暫時禁用 RLS 進行測試，但生產環境務必啟用。
*   **服務啟動失敗**：
    *   檢查服務的日誌輸出，通常會提供詳細的錯誤資訊。
    *   確保所有依賴都已透過 `pnpm install` 安裝。
    *   檢查環境變數是否都已配置且值正確。
*   **前端應用無法載入**：
    *   檢查瀏覽器的開發者工具控制台，查看是否有錯誤訊息。
    *   確保後端服務已成功啟動並可訪問。
    *   檢查前端應用的環境變數（尤其是 Supabase 相關的）是否正確配置。

如果問題依然存在，請查閱 Supabase 官方文件或尋求技術支援。
