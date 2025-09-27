-- Create trial_services table for fee schedules
CREATE TABLE trial_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_id UUID REFERENCES trials(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL CHECK (currency IN ('USD', 'CLP')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster trial-based queries
CREATE INDEX idx_trial_services_trial_id ON trial_services(trial_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_trial_services_updated_at 
    BEFORE UPDATE ON trial_services 
    FOR EACH ROW 
    EXECUTE FUNCTION update_modified_at_column();

-- Add RLS policies
ALTER TABLE trial_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on trial_services" 
ON trial_services 
USING (true) 
WITH CHECK (true);