-- Add allocation type and constraints for service allocations
-- Business rules:
-- 1. Only visit services can have allocations
-- 2. Allocations must be either principal_investigator or sub_investigator
-- 3. Maximum one allocation per type per service

-- Add allocation_type column to service_allocations
ALTER TABLE service_allocations 
ADD COLUMN allocation_type text CHECK (allocation_type IN ('principal_investigator', 'sub_investigator'));

-- Make allocation_type required
ALTER TABLE service_allocations 
ALTER COLUMN allocation_type SET NOT NULL;

-- Note: Cannot use subquery in CHECK constraint
-- Will enforce "allocations only for visit services" at application level
-- This business rule is implemented in the UI and service layer

-- Add unique constraint: Maximum one Principal Investigator per service
-- This allows only 1 PI but unlimited Sub-Investigators per visit service
CREATE UNIQUE INDEX unique_pi_per_service 
ON service_allocations(trial_service_id) 
WHERE allocation_type = 'principal_investigator';

-- Add index for performance on allocation_type queries
CREATE INDEX idx_service_allocations_type ON service_allocations(allocation_type);