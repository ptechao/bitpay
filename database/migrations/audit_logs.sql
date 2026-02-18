/**
 * @file database/migrations/audit_logs.sql
 * @description 操作日誌表 (audit_logs) 的建表語句。
 * @author Manus AI
 * @date 2026-02-19
 */

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
