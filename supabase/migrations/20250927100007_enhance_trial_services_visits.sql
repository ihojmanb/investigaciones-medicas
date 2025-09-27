-- Schema Enhancement: Add visit functionality to trial_services
-- This eliminates the need for a separate visit_types table

-- Add visit-related columns to trial_services
ALTER TABLE trial_services ADD COLUMN is_visit boolean DEFAULT false;
ALTER TABLE trial_services ADD COLUMN visit_order integer NULL;

-- Add constraint: if is_visit = true, then visit_order must be provided
ALTER TABLE trial_services ADD CONSTRAINT visit_order_required_when_visit 
    CHECK (NOT is_visit OR visit_order IS NOT NULL);

-- Add index for efficient querying of visit services
CREATE INDEX idx_trial_services_is_visit ON trial_services(trial_id, is_visit, visit_order) 
    WHERE is_visit = true;