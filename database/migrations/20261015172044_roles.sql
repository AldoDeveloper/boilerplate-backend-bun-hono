-- +migrate Up
CREATE TABLE IF NOT EXISTS roles(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_key VARCHAR(100) NOT NULL UNIQUE,
    role_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS role_key_idx ON roles(role_key);

-- +migrate Down
DROP TABLE IF EXISTS roles CASCADE;
