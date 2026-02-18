# 安裝指南

## 概述

本文件提供聚合支付平台在本地開發環境中的安裝步驟。請按照以下說明配置您的環境並啟動應用程式。

## 前提條件

在開始安裝之前，請確保您的系統已安裝以下軟體：

- **Node.js**: v18.x 或更高版本
- **npm** 或 **yarn**: 用於管理 Node.js 套件
- **PostgreSQL**: v12.x 或更高版本
- **Git**: 用於克隆專案程式碼

## PostgreSQL 安裝步驟

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo -i -u postgres
createuser --interactive
createdb your_database_name
psql
ALTER USER your_username WITH ENCRYPTED PASSWORD 'your_password';
\q
exit
```

### macOS (使用 Homebrew)

```bash
brew update
brew install postgresql
brew services start postgresql
createuser --interactive
createdb your_database_name
psql
ALTER USER your_username WITH ENCRYPTED PASSWORD 'your_password';
\q
```

### Windows

請從 [PostgreSQL 官方網站](https://www.postgresql.org/download/windows/) 下載並安裝最新版本的 PostgreSQL。在安裝過程中，請記住您設定的超級用戶密碼。

安裝完成後，您可以使用 `pgAdmin` 或命令列工具 `psql` 來創建資料庫和用戶。

## 專案安裝

1.  **克隆專案程式碼**

    ```bash
    git clone https://github.com/your-repo/your-project.git
    cd your-project
    ```

2.  **配置環境變數**

    複製 `.env.example` 檔案並將其命名為 `.env`。然後根據您的本地 PostgreSQL 配置更新 `.env` 檔案中的資料庫連線資訊。

    ```bash
    cp .env.example .env
    ```

    `.env` 檔案範例：

    ```
    # PostgreSQL Configuration
    PG_HOST=localhost
    PG_PORT=5432
    PG_USER=your_username
    PG_PASSWORD=your_password
    PG_DATABASE=your_database_name

    # JWT Configuration
    JWT_SECRET=your_jwt_secret_key
    JWT_EXPIRES_IN=1h
    ```

3.  **安裝依賴**

    ```bash
    npm install
    # 或者
    yarn install
    ```

4.  **初始化資料庫**

    執行 `database/schema.sql` 檔案來創建資料庫表結構。

    ```bash
    psql -h localhost -p 5432 -U your_username -d your_database_name -f database/schema.sql
    ```

5.  **啟動後端服務**

    進入每個微服務目錄並啟動服務：

    ```bash
    cd services/payment
    npm start
    # 或者
    yarn start
    ```

    對 `merchant`, `agent`, `settlement`, `risk-control`, `channel` 等微服務重複此步驟。

6.  **啟動前端應用**

    ```bash
    cd frontend
    npm start
    # 或者
    yarn start
    ```

    （假設前端應用在 `frontend` 目錄，如果不在，請根據實際情況調整路徑）

## 參考資料

[1] [Node.js 官方網站](https://nodejs.org/)
[2] [PostgreSQL 官方網站](https://www.postgresql.org/)
[3] [Git 官方網站](https://git-scm.com/)
