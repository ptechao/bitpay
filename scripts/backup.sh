
#!/bin/bash

/**
 * @file scripts/backup.sh
 * @description 聚合支付平台資料庫備份腳本。
 *              使用 pg_dump 備份 PostgreSQL 資料庫，並壓縮存儲。
 * @author Manus AI
 * @date 2026-02-19
 */

# 資料庫連線資訊 (建議從環境變數獲取或安全配置)
DB_HOST=${PGHOST:-localhost}
DB_PORT=${PGPORT:-5432}
DB_NAME=${PGDATABASE:-bitpay_db}
DB_USER=${PGUSER:-user}
DB_PASSWORD=${PGPASSWORD:-password}

# 備份目錄
BACKUP_DIR="/var/backups/postgresql"

# 備份檔案名格式
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${DB_NAME}_${TIMESTAMP}.sql"

# 創建備份目錄 (如果不存在)
mkdir -p "${BACKUP_DIR}"

echo "開始備份 PostgreSQL 資料庫: ${DB_NAME} 到 ${BACKUP_DIR}/${BACKUP_FILE}.gz"

# 設置 PGPASSWORD 環境變數，避免 pg_dump 提示輸入密碼
export PGPASSWORD="${DB_PASSWORD}"

# 執行 pg_dump 並壓縮
pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -Fc > "${BACKUP_DIR}/${BACKUP_FILE}"

# 檢查 pg_dump 是否成功
if [ $? -eq 0 ]; then
    echo "資料庫備份成功: ${BACKUP_DIR}/${BACKUP_FILE}"
    gzip "${BACKUP_DIR}/${BACKUP_FILE}"
    echo "備份檔案已壓縮為: ${BACKUP_DIR}/${BACKUP_FILE}.gz"
else
    echo "錯誤: 資料庫備份失敗。"
    rm -f "${BACKUP_DIR}/${BACKUP_FILE}" # 清理失敗的備份檔案
    exit 1
fi

# 清理舊的備份檔案 (例如，保留最近 7 天的備份)
find "${BACKUP_DIR}" -type f -name "*.gz" -mtime +7 -delete
echo "已清理超過 7 天的舊備份檔案。"

# 取消 PGPASSWORD 環境變數
unset PGPASSWORD

echo "備份腳本執行完畢。"
