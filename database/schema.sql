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
    settlement_cycle_type VARCHAR(10) NOT NULL DEFAULT 'D', -- 'D' (自然日), 'T' (交易日)
    settlement_cycle_value INTEGER NOT NULL DEFAULT 0,
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
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    parent_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    commission_rate_type VARCHAR(50) NOT NULL DEFAULT 'percentage', -- 'percentage', 'fixed', 'markup'
    base_commission_rate NUMERIC(5, 4) DEFAULT 0.0000,
    markup_rate NUMERIC(5, 4) DEFAULT 0.0000,
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
    settlement_id UUID REFERENCES settlements(id) ON DELETE SET NULL,
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
    FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('users', 'merchants', 'merchant_accounts', 'agents', 'transactions', 'payments', 'settlements', 'risk_rules', 'channels', 'agent_accounts', 'commission_records', 'roles', 'permissions')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I;', t.tablename);
        EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FROM EACH ROW EXECUTE FUNCTION update_updated_at_column();', t.tablename);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 12. 訂單狀態日誌表 (order_status_logs)
CREATE TABLE IF NOT EXISTS order_status_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    old_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_status_logs_order_id ON order_status_logs(order_id);

-- 13. 代理商帳戶表 (agent_accounts)
CREATE TABLE IF NOT EXISTS agent_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID UNIQUE REFERENCES agents(id) ON DELETE CASCADE,
    balance NUMERIC(18, 4) DEFAULT 0.0000,
    frozen_amount NUMERIC(18, 4) DEFAULT 0.0000,
    currency VARCHAR(10) NOT NULL DEFAULT 'CNY',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_accounts_agent_id ON agent_accounts(agent_id);

-- 14. 分潤記錄表 (commission_records)
CREATE TABLE IF NOT EXISTS commission_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    commission_amount NUMERIC(18, 4) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'CNY',
    commission_type VARCHAR(50) NOT NULL, -- 'percentage', 'fixed', 'markup'
    commission_rate NUMERIC(5, 4) DEFAULT 0.0000,
    markup_rate NUMERIC(5, 4) DEFAULT 0.0000,
    level INTEGER NOT NULL, -- 代理層級
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'settled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_commission_records_agent_id ON commission_records(agent_id);
CREATE INDEX IF NOT EXISTS idx_commission_records_transaction_id ON commission_records(transaction_id);

-- 15. 操作日誌表 (audit_logs)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID, -- 操作者 ID (可以是 user_id, merchant_id, agent_id)
    operator_role VARCHAR(50) NOT NULL, -- 操作者角色 (e.g., admin, merchant, agent)
    action_type VARCHAR(50) NOT NULL, -- 操作類型 (e.g., CREATE, UPDATE, DELETE, READ)
    target_entity VARCHAR(100) NOT NULL, -- 操作目標實體 (e.g., order, merchant, agent, channel)
    target_id UUID, -- 操作目標實體 ID
    request_params JSONB, -- 請求參數
    ip_address INET, -- IP 位址
    action_result VARCHAR(20) NOT NULL, -- 操作結果 (e.g., success, failed)
    error_message TEXT, -- 錯誤訊息 (如果操作失敗)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_operator_id ON audit_logs(operator_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_entity ON audit_logs(target_entity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 16. 角色表 (roles)
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL, -- 角色名稱 (e.g., Super Admin, Merchant Admin, Agent Manager)
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. 權限表 (permissions)
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL, -- 權限名稱 (e.g., order.view, settlement.withdraw)
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. 角色-權限關聯表 (role_permissions)
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. 使用者-角色關聯表 (user_roles)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 為常用查詢欄位建立索引以提高性能
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
