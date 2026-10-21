-- +migrate Up

CREATE INDEX idx_category_sub_category ON sub_categories(category_id);

-- +migrate Down
-- tulis SQL untuk membatalkan perubahan di sini
