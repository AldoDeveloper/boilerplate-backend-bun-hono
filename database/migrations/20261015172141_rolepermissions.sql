-- +migrate Up
CREATE TABLE IF NOT EXISTS role_permissions(
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_roles FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_permissions FOREIGN KEY(permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- +migrate Down
DROP TABLE IF EXISTS role_permissions;
