-- +migrate Up

ALTER TABLE permissions
ADD CONSTRAINT contraint_permission_key UNIQUE (permission_key),
ADD CONSTRAINT contraint_permission_name UNIQUE (permission_name);

-- +migrate Down
-- tulis SQL untuk membatalkan perubahan di sini
