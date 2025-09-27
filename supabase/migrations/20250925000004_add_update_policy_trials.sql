-- Add missing UPDATE policy for trials table
-- This allows users to update trial records, which was previously blocked by RLS
CREATE POLICY "Allow update to trials" 
ON "public"."trials" 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- Ensure existing trials have proper defaults for new fields
-- Set active = true for any existing trials that might have NULL values
UPDATE trials 
SET active = COALESCE(active, true)
WHERE active IS NULL;

-- Optional: Set a default medical specialty for existing trials if desired
-- UPDATE trials 
-- SET medical_specialty = 'General Medicine'
-- WHERE medical_specialty IS NULL OR medical_specialty = '';

-- Note: start_date and end_date can remain NULL for existing trials
-- Users can update them through the edit form as needed