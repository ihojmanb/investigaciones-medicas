-- Rename updated_at column to modified_at to match existing trigger function
-- This fixes the "record new has no field modified_at" error

ALTER TABLE trial_services RENAME COLUMN updated_at TO modified_at;