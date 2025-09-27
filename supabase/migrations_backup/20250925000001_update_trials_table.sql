-- Add missing fields to trials table to match TypeScript interface
ALTER TABLE trials 
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE,
ADD COLUMN medical_specialty TEXT,
ADD COLUMN active BOOLEAN DEFAULT true NOT NULL;

-- Update existing trials to have active = true (since all trials are active by default)
UPDATE trials 
SET active = true 
WHERE active IS NULL;