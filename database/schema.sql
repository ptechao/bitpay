-- PostgreSQL Schema for Aggregated Payment Platform

-- 1. 系統基礎表

-- 1.1 languages (語言配置表)
CREATE TABLE languages (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL, -- 語言代碼 (e.g., zh-TW, en-US)
    name VARCHAR(50) NOT NULL,       -- 語言名稱 (e.g., 繁體中文, English)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.2 translations (多語言翻譯表)
CREATE TABLE translations (
    id SERIAL PRIMARY KEY,
    language_id INTEGER NOT NULL REFERENCES languages(id),
    resource_type VARCHAR(50) NOT NULL, -- 資源類型 (e.g., 'channel', 'risk_rule')
    resource_id INTEGER NOT NULL,       -- 資源ID，關聯到具體業務表的主鍵
    field_name VARCHAR(100) NOT NULL,   -- 需要翻譯的欄位名稱 (e.g., 'name', 'description')
    translated_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (language_id, resource_type, resource_id, field_name)
);
CREATE INDEX idx_translations_resource ON translations (resource_type, resource_id);

-- 1.3 users (使用者/帳戶表)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    user_type VARCHAR(20) NOT NULL, -- (admin, merchant, agent)
    status VARCHAR(20) DEFAULT 'active', -- (active, inactive, suspended)
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.4 roles (角色表)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.5 permissions (權限表)
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.6 user_roles (使用者角色關聯表)
CREATE TABLE user_roles (
    user_id INTEGER NOT NULL REFERENCES users(id),
    role_id INTEGER NOT NULL REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

-- 1.7 role_permissions (角色權限關聯表)
CREATE TABLE role_permissions (
    role_id INTEGER NOT NULL REFERENCES roles(id),
    permission_id INTEGER NOT NULL REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);

-- 2. 商戶與代理管理

-- 2.1 merchants (商戶表)
CREATE TABLE merchants (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    name VARCHAR(255) NOT NULL, -- 需多語言支援，實際顯示時透過 translations 表獲取
    legal_name VARCHAR(255),
    contact_person VARCHAR(100),
    contact_email VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    address TEXT,
    website VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending', -- (pending, active, suspended)
    parent_agent_id INTEGER REFERENCES agents(id), -- 上級代理ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_merchants_status ON merchants (status);
CREATE INDEX idx_merchants_parent_agent_id ON merchants (parent_agent_id);

-- 2.2 agents (代理表)
CREATE TABLE agents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    name VARCHAR(255) NOT NULL, -- 需多語言支援，實際顯示時透過 translations 表獲取
    contact_person VARCHAR(100),
    contact_email VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending', -- (pending, active, suspended)
    parent_agent_id INTEGER REFERENCES agents(id), -- 上級代理ID (自引用)
    commission_rate_type VARCHAR(50) NOT NULL, -- (percentage, fixed, markup)
    base_commission_rate NUMERIC(5,4) DEFAULT 0.0000,
    markup_rate NUMERIC(5,4) DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_agents_status ON agents (status);
CREATE INDEX idx_agents_parent_agent_id ON agents (parent_agent_id);

-- 2.3 agent_hierarchy (代理層級關係表)
CREATE TABLE agent_hierarchy (
    ancestor_id INTEGER NOT NULL REFERENCES agents(id),
    descendant_id INTEGER NOT NULL REFERENCES agents(id),
    depth INTEGER NOT NULL, -- 深度，表示從祖先到後代的層級數 (0 表示自身)
    PRIMARY KEY (ancestor_id, descendant_id)
);
CREATE INDEX idx_agent_hierarchy_descendant_id ON agent_hierarchy (descendant_id);

-- 3. 支付通道管理

-- 3.1 payment_channels (支付通道表)
CREATE TABLE payment_channels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL, -- 需多語言支援
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT, -- 需多語言支援
    type VARCHAR(50) NOT NULL, -- (fiat, crypto)
    status VARCHAR(20) DEFAULT 'active', -- (active, inactive, maintenance)
    config_json JSONB, -- 通道配置參數 (e.g., API keys, endpoints)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_payment_channels_status ON payment_channels (status);
CREATE INDEX idx_payment_channels_type ON payment_channels (type);
CREATE INDEX idx_payment_channels_config_json ON payment_channels USING GIN (config_json);

-- 3.2 channel_currencies (通道幣種配置表)
CREATE TABLE channel_currencies (
    id SERIAL PRIMARY KEY,
    channel_id INTEGER NOT NULL REFERENCES payment_channels(id),
    currency_code VARCHAR(10) NOT NULL,
    currency_type VARCHAR(20) NOT NULL, -- (fiat, crypto)
    min_amount NUMERIC(18,8) DEFAULT 0.00,
    max_amount NUMERIC(18,8) DEFAULT 999999999.99,
    fee_rate NUMERIC(5,4) DEFAULT 0.00,
    fixed_fee NUMERIC(18,8) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active', -- (active, inactive)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (channel_id, currency_code)
);
CREATE INDEX idx_channel_currencies_currency_code ON channel_currencies (currency_code);
CREATE INDEX idx_channel_currencies_status ON channel_currencies (status);

-- 3.3 merchant_channel_configs (商戶通道配置表)
CREATE TABLE merchant_channel_configs (
    id SERIAL PRIMARY KEY,
    merchant_id INTEGER NOT NULL REFERENCES merchants(id),
    channel_id INTEGER NOT NULL REFERENCES payment_channels(id),
    currency_code VARCHAR(10) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    fee_rate NUMERIC(5,4),
    fixed_fee NUMERIC(18,8),
    min_amount NUMERIC(18,8),
    max_amount NUMERIC(18,8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (merchant_id, channel_id, currency_code)
);
CREATE INDEX idx_merchant_channel_configs_merchant_id ON merchant_channel_configs (merchant_id);
CREATE INDEX idx_merchant_channel_configs_channel_id ON merchant_channel_configs (channel_id);
CREATE INDEX idx_merchant_channel_configs_currency_code ON merchant_channel_configs (currency_code);

-- 4. 支付與結算

-- 4.1 payment_orders (支付訂單表)
CREATE TABLE payment_orders (
    id SERIAL PRIMARY KEY,
    order_sn VARCHAR(64) UNIQUE NOT NULL,
    merchant_id INTEGER NOT NULL REFERENCES merchants(id),
    merchant_order_id VARCHAR(64) NOT NULL,
    channel_id INTEGER NOT NULL REFERENCES payment_channels(id),
    currency_code VARCHAR(10) NOT NULL,
    amount NUMERIC(18,8) NOT NULL,
    actual_amount NUMERIC(18,8),
    fee NUMERIC(18,8) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'pending', -- (pending, success, failed, refunded)
    payment_method VARCHAR(50),
    channel_transaction_id VARCHAR(100),
    callback_url TEXT,
    notify_status VARCHAR(20) DEFAULT 'pending', -- (pending, success, failed)
    risk_score INTEGER DEFAULT 0,
    risk_decision VARCHAR(50) DEFAULT 'pass', -- (pass, review, reject)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_payment_orders_merchant_id ON payment_orders (merchant_id);
CREATE INDEX idx_payment_orders_channel_id ON payment_orders (channel_id);
CREATE INDEX idx_payment_orders_status ON payment_orders (status);
CREATE INDEX idx_payment_orders_created_at ON payment_orders (created_at);

-- 4.2 settlements (結算表)
CREATE TABLE settlements (
    id SERIAL PRIMARY KEY,
    settlement_sn VARCHAR(64) UNIQUE NOT NULL,
    entity_type VARCHAR(20) NOT NULL, -- (merchant, agent)
    entity_id INTEGER NOT NULL, -- (merchant_id 或 agent_id)
    currency_code VARCHAR(10) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_income NUMERIC(18,8) DEFAULT 0.00,
    total_fee NUMERIC(18,8) DEFAULT 0.00,
    total_refund NUMERIC(18,8) DEFAULT 0.00,
    net_amount NUMERIC(18,8) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'pending', -- (pending, processing, completed, failed)
    settled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_settlements_entity_type_id ON settlements (entity_type, entity_id);
CREATE INDEX idx_settlements_currency_code ON settlements (currency_code);
CREATE INDEX idx_settlements_status ON settlements (status);
CREATE INDEX idx_settlements_date_range ON settlements (start_date, end_date);

-- 4.3 agent_commission_records (代理分潤記錄表)
CREATE TABLE agent_commission_records (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES payment_orders(id),
    agent_id INTEGER NOT NULL REFERENCES agents(id),
    merchant_id INTEGER NOT NULL REFERENCES merchants(id),
    currency_code VARCHAR(10) NOT NULL,
    commission_amount NUMERIC(18,8) NOT NULL,
    commission_rate NUMERIC(5,4),
    commission_type VARCHAR(50) NOT NULL, -- (percentage, fixed, markup)
    status VARCHAR(20) DEFAULT 'pending', -- (pending, settled)
    settlement_id INTEGER REFERENCES settlements(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_agent_commission_records_order_id ON agent_commission_records (order_id);
CREATE INDEX idx_agent_commission_records_agent_id ON agent_commission_records (agent_id);
CREATE INDEX idx_agent_commission_records_merchant_id ON agent_commission_records (merchant_id);
CREATE INDEX idx_agent_commission_records_status ON agent_commission_records (status);
CREATE INDEX idx_agent_commission_records_created_at ON agent_commission_records (created_at);

-- 4.4 withdrawals (提現記錄表)
CREATE TABLE withdrawals (
    id SERIAL PRIMARY KEY,
    withdrawal_sn VARCHAR(64) UNIQUE NOT NULL,
    entity_type VARCHAR(20) NOT NULL, -- (merchant, agent)
    entity_id INTEGER NOT NULL, -- (merchant_id 或 agent_id)
    currency_code VARCHAR(10) NOT NULL,
    amount NUMERIC(18,8) NOT NULL,
    fee NUMERIC(18,8) DEFAULT 0.00,
    actual_amount NUMERIC(18,8) NOT NULL,
    bank_name VARCHAR(100),
    account_name VARCHAR(100),
    account_number VARCHAR(100),
    crypto_wallet_address VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending', -- (pending, processing, success, failed)
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_withdrawals_entity_type_id ON withdrawals (entity_type, entity_id);
CREATE INDEX idx_withdrawals_currency_code ON withdrawals (currency_code);
CREATE INDEX idx_withdrawals_status ON withdrawals (status);
CREATE INDEX idx_withdrawals_created_at ON withdrawals (created_at);

-- 5. 風控管理

-- 5.1 risk_rules (風控規則表)
CREATE TABLE risk_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL, -- 需多語言支援
    description TEXT, -- 需多語言支援
    rule_type VARCHAR(50) NOT NULL,
    rule_config JSONB,
    priority INTEGER DEFAULT 0,
    action VARCHAR(50) NOT NULL, -- (pass, review, reject)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_risk_rules_is_active ON risk_rules (is_active);
CREATE INDEX idx_risk_rules_rule_type ON risk_rules (rule_type);
CREATE INDEX idx_risk_rules_rule_config ON risk_rules USING GIN (rule_config);

-- 5.2 black_white_lists (黑白名單表)
CREATE TABLE black_white_lists (
    id SERIAL PRIMARY KEY,
    list_type VARCHAR(10) NOT NULL, -- (black, white)
    entry_type VARCHAR(50) NOT NULL, -- (ip, user_id, email, card_number)
    entry_value VARCHAR(255) NOT NULL,
    reason TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (list_type, entry_type, entry_value)
);
CREATE INDEX idx_black_white_lists_entry_value ON black_white_lists (entry_value);
CREATE INDEX idx_black_white_lists_expires_at ON black_white_lists (expires_at);

-- 6. 操作日誌

-- 6.1 operation_logs (操作日誌表)
CREATE TABLE operation_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    user_type VARCHAR(20),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_operation_logs_user_id ON operation_logs (user_id);
CREATE INDEX idx_operation_logs_action ON operation_logs (action);
CREATE INDEX idx_operation_logs_resource ON operation_logs (resource_type, resource_id);
CREATE INDEX idx_operation_logs_created_at ON operation_logs (created_at);
