-- ===================================================
-- CREATE VISIT TYPES TABLE AND CONSTRAINTS
-- ===================================================

-- Create visit_types table
CREATE TABLE visit_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trial_id UUID NOT NULL REFERENCES trials(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    order_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraints
ALTER TABLE visit_types ADD CONSTRAINT unique_trial_visit_name 
    UNIQUE (trial_id, name);

ALTER TABLE visit_types ADD CONSTRAINT unique_trial_visit_order 
    UNIQUE (trial_id, order_number);

-- Create index for performance
CREATE INDEX idx_visit_types_trial_id ON visit_types(trial_id);
CREATE INDEX idx_visit_types_order ON visit_types(trial_id, order_number);

-- Add constraint to ensure order_number is positive
ALTER TABLE visit_types ADD CONSTRAINT positive_order_number 
    CHECK (order_number > 0);

-- Enable RLS
ALTER TABLE visit_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow read access to visit_types"
ON visit_types
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow insert to visit_types"
ON visit_types
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow update to visit_types"
ON visit_types
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete to visit_types"
ON visit_types
FOR DELETE
TO public
USING (true);