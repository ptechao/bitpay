-- Migration: seed admin user, roles, permissions and demo channel
-- Generated: 2026-02-21
-- NOTE: This script is idempotent (uses WHERE NOT EXISTS / ON CONFLICT DO NOTHING)

-- 1) Create admin user if not exists (password: Qazwer123789) using pgcrypto crypt()
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin') THEN
        -- create admin user with bcrypt-hashed password
        INSERT INTO users (email, password_hash, role)
        VALUES ('admin', crypt('Qazwer123789', gen_salt('bf')), 'super_admin');
    END IF;
END
$$;

-- 2) Ensure admin and super-admin roles exist
INSERT INTO roles (name, description)
SELECT 'admin','Administrator role'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name='admin');

INSERT INTO roles (name, description)
SELECT 'super-admin','Super administrator with all privileges'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name='super-admin');

-- 3) Create common permissions if missing
INSERT INTO permissions (name, description)
SELECT 'payment_config.manage','Manage payment configurations' WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name='payment_config.manage');

INSERT INTO permissions (name, description)
SELECT 'cashier.manage','Manage cashier operations' WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name='cashier.manage');

INSERT INTO permissions (name, description)
SELECT 'settings.manage','Manage global settings' WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name='settings.manage');

INSERT INTO permissions (name, description)
SELECT 'users.manage','Manage users' WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name='users.manage');

INSERT INTO permissions (name, description)
SELECT 'merchants.manage','Manage merchants' WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name='merchants.manage');

INSERT INTO permissions (name, description)
SELECT 'channels.manage','Manage payment channels' WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name='channels.manage');

INSERT INTO permissions (name, description)
SELECT 'super.admin','Has all permissions' WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name='super.admin');

-- 4) Grant all permissions to super-admin role
WITH r AS (
    SELECT id FROM roles WHERE name='super-admin'
), p AS (
    SELECT id FROM permissions
)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM r CROSS JOIN p
ON CONFLICT DO NOTHING;

-- 5) Ensure admin user is assigned to super-admin role and admin role
WITH uid AS (SELECT id FROM users WHERE email='admin'),
     rid AS (SELECT id FROM roles WHERE name IN ('super-admin','admin'))
INSERT INTO user_roles (user_id, role_id)
SELECT uid.id, rid.id FROM uid, rid
ON CONFLICT DO NOTHING;

-- 6) Seed a demo payment channel if none exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM channels WHERE code = 'demo_channel') THEN
        INSERT INTO channels (name, code, config, status, priority)
        VALUES ('Demo Channel','demo_channel', to_jsonb('{"type":"mock","apiKey":"demo"}'::text), 'active', 100);
    END IF;
END
$$;

-- End of migration
