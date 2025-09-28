-- Simple Migration: Add new patient fields (no name parsing - for development/dummy data)
-- This migration assumes you're using Supabase/PostgreSQL

-- Step 1: Add new columns
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS second_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS first_surname VARCHAR(255),
ADD COLUMN IF NOT EXISTS second_surname VARCHAR(255),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS modified_at TIMESTAMPTZ DEFAULT NOW();

-- Step 2: Set default values for existing dummy data (optional - you can skip this)
UPDATE patients 
SET first_name = 'John',
    first_surname = 'Doe',
    status = 'active'
WHERE first_name IS NULL;

-- Step 3: Add constraints (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'patients_status_check'
    ) THEN
        ALTER TABLE patients 
        ADD CONSTRAINT patients_status_check 
        CHECK (status IN ('active', 'inactive'));
    END IF;
END $$;

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_name_search 
ON patients (first_surname, first_name, second_surname, second_name);

CREATE INDEX IF NOT EXISTS idx_patients_status 
ON patients (status);

-- Step 5: Create trigger to auto-update modified_at on record changes
CREATE OR REPLACE FUNCTION update_modified_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_patients_modified_at'
    ) THEN
        CREATE TRIGGER update_patients_modified_at 
            BEFORE UPDATE ON patients 
            FOR EACH ROW 
            EXECUTE FUNCTION update_modified_at_column();
    END IF;
END $$;

-- Note: If you still have the old 'name' column, you can drop it:
-- ALTER TABLE patients DROP COLUMN name;