-- +migrate Up

DROP VIEW IF EXISTS view_user_roles;

CREATE OR REPLACE VIEW view_user_roles AS 
    SELECT
        u.id AS id,
        u.name AS name,
        u.email AS email,
        u.username AS username,
        u.is_active AS is_active,
        COALESCE(
            jsonb_agg(role_permissions) FILTER (WHERE role_permissions.role_id IS NOT NULL), '[]'::jsonb
        ) as role_permissions

    FROM users u
    LEFT JOIN LATERAL(
        SELECT
        ur.role_id AS role_id,
        vrp.role_key AS role_key,
        vrp.role_name AS role_name,
        vrp.permissions::json AS permissions
        FROM user_roles ur
        LEFT JOIN view_role_permissions vrp ON vrp.role_id = ur.role_id
        
    ) role_permissions ON TRUE

    GROUP BY u.id;

-- +migrate Down
-- tulis SQL untuk membatalkan perubahan di sini
