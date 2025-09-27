-- Fix the trigger function mismatch for trial_services and service_allocations
-- The existing update_modified_at_column() function updates 'modified_at' field
-- but our new tables use 'updated_at' field

-- Create a new trigger function for updated_at field
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop the existing incorrect triggers
DROP TRIGGER IF EXISTS update_trial_services_updated_at ON trial_services;
DROP TRIGGER IF EXISTS update_service_allocations_updated_at ON service_allocations;

-- Create correct triggers using the new function
CREATE TRIGGER update_trial_services_updated_at 
    BEFORE UPDATE ON trial_services 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_allocations_updated_at 
    BEFORE UPDATE ON service_allocations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();