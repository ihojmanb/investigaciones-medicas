-- Create service_allocations table for service sub-allocations
CREATE TABLE service_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_service_id UUID REFERENCES trial_services(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL CHECK (currency IN ('USD', 'CLP')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster service-based queries
CREATE INDEX idx_service_allocations_trial_service_id ON service_allocations(trial_service_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_service_allocations_updated_at 
    BEFORE UPDATE ON service_allocations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_modified_at_column();

-- Add constraint to ensure maximum 2 allocations per service
CREATE OR REPLACE FUNCTION check_max_allocations_per_service()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM service_allocations WHERE trial_service_id = NEW.trial_service_id) >= 2 THEN
        RAISE EXCEPTION 'Maximum of 2 service allocations allowed per service';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_allocations_per_service
    BEFORE INSERT ON service_allocations
    FOR EACH ROW
    EXECUTE FUNCTION check_max_allocations_per_service();

-- Add RLS policies
ALTER TABLE service_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on service_allocations" 
ON service_allocations 
USING (true) 
WITH CHECK (true);

-- Add grants for the new tables
GRANT ALL ON TABLE trial_services TO anon;
GRANT ALL ON TABLE trial_services TO authenticated;
GRANT ALL ON TABLE trial_services TO service_role;

GRANT ALL ON TABLE service_allocations TO anon;
GRANT ALL ON TABLE service_allocations TO authenticated;
GRANT ALL ON TABLE service_allocations TO service_role;