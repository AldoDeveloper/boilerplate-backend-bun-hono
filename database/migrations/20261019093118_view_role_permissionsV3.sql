-- +migrate Up

DROP VIEW view_role_permissions CASCADE;

CREATE OR REPLACE VIEW view_role_permissions AS
     SELECT
        r.id AS role_id,
        r.role_key AS role_key,
        r.role_name AS role_name,
        COALESCE(
          jsonb_agg(permissions) FILTER (WHERE permissions.role_id IS NOT NULL), '[]'::jsonb
        ) AS permissions

      FROM roles r

      LEFT JOIN LATERAL (
        SELECT 
          rp.role_id AS role_id,
          perm.permission_key AS permission_key,
          perm.permission_name AS permission_name,
          perm.action AS action
        FROM role_permissions rp
        LEFT JOIN permissions perm ON perm.id = rp.permission_id
        WHERE rp.role_id = r.id

      ) permissions ON TRUE

       GROUP BY r.id;

-- +migrate Down
-- tulis SQL untuk membatalkan perubahan di sini
