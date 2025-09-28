-- Add constraint to ensure unique visit orders per trial
-- This prevents duplicate visit ordering within the same trial

ALTER TABLE trial_services 
ADD CONSTRAINT unique_visit_order_per_trial 
UNIQUE (trial_id, visit_order) 
DEFERRABLE INITIALLY DEFERRED;