-- 前言：此檔案定義了聚合支付平台在 PostgreSQL 資料庫中的所有表結構、索引和約束。
-- 移除了所有 Supabase 特有的語法和 RLS (Row Level Security) 相關配置，
-- 保持純 PostgreSQL 語法，以便於自建資料庫環境的部署和管理。
-- 權限控制將完全在應用層實現。

-- 創建 uuid-ossp 擴展，用於生成 UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 用戶表 (users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'admin', 'merchant', 'agent', 'user'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 商戶表 (merchants)
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'inactive'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 商戶帳戶表 (merchant_accounts)
CREATE TABLE IF NOT EXISTS merchant_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID UNIQUE REFERENCES merchants(id) ON DELETE CASCADE,
    balance NUMERIC(18, 4) DEFAULT 0.0000,
    frozen_amount NUMERIC(18, 4) DEFAULT 0.0000,
    currency VARCHAR(10) NOT NULL DEFAULT 'CNY',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. 代理商表 (agents)
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    commission_rate NUMERIC(5, 4) DEFAULT 0.0000, -- 佣金比例
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. 交易表 (transactions)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    amount NUMERIC(18, 4) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'CNY',
    type VARCHAR(50) NOT NULL, -- 'payment', 'refund', 'withdrawal'
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed', 'refunded'
    channel_id UUID, -- 支付通道ID，待定義 channel 表後添加外鍵
    transaction_ref VARCHAR(255) UNIQUE NOT NULL, -- 外部交易參考號
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. 支付表 (payments)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID UNIQUE REFERENCES transactions(id) ON DELETE CASCADE,
    method VARCHAR(50) NOT NULL, -- 'wechatpay', 'alipay', 'bankcard'
    channel_transaction_id VARCHAR(255), -- 支付通道返回的交易ID
    amount NUMERIC(18, 4) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'CNY',
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed'
    paid_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. 結算表 (settlements)
CREATE TABLE IF NOT EXISTS settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    settlement_batch_id VARCHAR(255) UNIQUE NOT NULL,
    total_amount NUMERIC(18, 4) NOT NULL,
    fee_amount NUMERIC(18, 4) DEFAULT 0.0000,
    net_amount NUMERIC(18, 4) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'CNY',
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    settlement_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. 結算詳情表 (settlement_details)
CREATE TABLE IF NOT EXISTS settlement_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    settlement_id UUID REFERENCES settlements(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    amount NUMERIC(18, 4) NOT NULL,
    fee NUMERIC(18, 4) DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. 風控規則表 (risk_rules)
CREATE TABLE IF NOT EXISTS risk_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    rule_json JSONB NOT NULL, -- 儲存風控規則的 JSON 配置
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. 風控日誌表 (risk_logs)
CREATE TABLE IF NOT EXISTS risk_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    rule_id UUID REFERENCES risk_rules(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'block', 'review', 'alert'
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. 支付通道表 (channels)
CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    config JSONB NOT NULL, -- 儲存通道配置，如 API Key, Secret 等
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    priority INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 為常用查詢欄位建立索引以提高性能
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_merchants_user_id ON merchants(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_id ON transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_agent_id ON transactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_ref ON transactions(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_settlements_merchant_id ON settlements(merchant_id);
CREATE INDEX IF NOT EXISTS idx_settlements_agent_id ON settlements(agent_id);
CREATE INDEX IF NOT EXISTS idx_settlements_settlement_date ON settlements(settlement_date);
CREATE INDEX IF NOT EXISTS idx_settlement_details_settlement_id ON settlement_details(settlement_id);
CREATE INDEX IF NOT EXISTS idx_settlement_details_transaction_id ON settlement_details(transaction_id);
CREATE INDEX IF NOT EXISTS idx_risk_logs_transaction_id ON risk_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_channels_code ON channels(code);

-- 更新 updated_at 欄位的觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為所有需要自動更新 updated_at 的表添加觸發器
DO $$
DECLARE
    t record;
BEGIN
    FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('users', 'merchants', 'merchant_accounts', 'agents', 'transactions', 'payments', 'settlements', 'risk_rules', 'channels')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I;', t.tablename);
        EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FROM EACH ROW EXECUTE FUNCTION update_updated_at_column();', t.tablename);
    END LOOP;
END;
$$ LANGUAGE plpgsql;
