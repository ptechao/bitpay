
/**
 * @file database/migrations/sandbox.sql
 * @description 聚合支付平台沙盒服務的資料庫遷移檔案。
 *              定義了沙盒訂單表 (sandbox_orders) 的結構。
 * @author Manus AI
 * @date 2026-02-19
 */

-- 建立 sandbox_orders 表
CREATE TABLE IF NOT EXISTS sandbox_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id VARCHAR(255) NOT NULL,
    amount DECIMAL(18, 4) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    order_ref VARCHAR(255) NOT NULL UNIQUE,
    notify_url TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    payment_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 為 order_ref 欄位建立索引以提高查詢效率
CREATE INDEX IF NOT EXISTS idx_sandbox_orders_order_ref ON sandbox_orders (order_ref);

-- 為 merchant_id 欄位建立索引
CREATE INDEX IF NOT EXISTS idx_sandbox_orders_merchant_id ON sandbox_orders (merchant_id);
