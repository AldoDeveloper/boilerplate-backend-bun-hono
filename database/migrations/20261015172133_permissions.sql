-- +migrate Up
--
CREATE TYPE permission_action AS ENUM('CREATE', 'READ', 'UPDATE', 'DELETE');

CREATE TABLE IF NOT EXISTS permissions(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_key VARCHAR(100) NOT NULL,
    permission_name VARCHAR(100) NOT NULL,
    action permission_action NOT NULL,
    description TEXT NULL DEFAULT NULL,
    deleted_at TIMESTAMPTZ NULL DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS permissions_idx_key ON permissions(permission_key);

-- +migrate Down
-- Langkah 1: Hapus tabel terlebih dahulu agar ikatan ENUM terlepas
DROP TABLE IF EXISTS permissions CASCADE;

-- Langkah 2: Sekarang aman untuk menghapus tipe ENUM
DROP TYPE IF EXISTS permission_action;
