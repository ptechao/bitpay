
/**
 * @file database/migrations/security.sql
 * @description 聚合支付平台安全性相關的資料庫遷移檔案。
 *              定義了審計日誌表 (audit_logs) 的結構，用於記錄系統中的重要操作。
 * @author Manus AI
 * @date 2026-02-19
 */

-- 建立 audit_logs 表
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL, -- 執行操作的用戶 ID
    action VARCHAR(255) NOT NULL, -- 執行的操作類型 (e.g., LOGIN, ORDER_CREATED, USER_UPDATED)
    details JSONB, -- 操作的詳細資訊，以 JSONB 格式儲存，方便查詢和索引
    ip_address VARCHAR(45), -- 請求的 IP 地址
    user_agent TEXT, -- 用戶代理字串
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 為 user_id 和 action 欄位建立索引以提高查詢效率
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);

-- 考慮為 details 欄位中的常用查詢路徑建立 GIN 索引，例如：
-- CREATE INDEX IF NOT EXISTS idx_audit_logs_details_status ON audit_logs USING GIN (details->'status');
-- CREATE INDEX IF NOT EXISTS idx_audit_logs_details_order_id ON audit_logs USING GIN (details->'orderId');
