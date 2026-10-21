-- +migrate Up
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(100) NOT NULL,
  email          VARCHAR(255) NOT NULL UNIQUE,
  username       VARCHAR(100) NULL DEFAULT NULL,
  password       VARCHAR(255) NOT NULL,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_name ON users (name);

-- +migrate Down
DROP TABLE IF EXISTS users;
