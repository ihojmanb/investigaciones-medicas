-- Row Level Security (RLS) Policies for Patients Table
-- This assumes you're using Supabase with authentication

-- Step 1: Enable RLS on patients table
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Step 2: Create policies based on your auth requirements

-- Policy 1: Allow authenticated users to view all patients
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'patients' AND policyname = 'Users can view all patients'
    ) THEN
        CREATE POLICY "Users can view all patients" ON patients
            FOR SELECT 
            USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Policy 2: Allow authenticated users to insert patients
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'patients' AND policyname = 'Users can insert patients'
    ) THEN
        CREATE POLICY "Users can insert patients" ON patients
            FOR INSERT 
            WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;

-- Policy 3: Allow authenticated users to update patients
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'patients' AND policyname = 'Users can update patients'
    ) THEN
        CREATE POLICY "Users can update patients" ON patients
            FOR UPDATE 
            USING (auth.role() = 'authenticated')
            WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;

-- Policy 4: Restrict delete operations (optional - uncomment if needed)
-- CREATE POLICY "Users can delete patients" ON patients
--     FOR DELETE 
--     USING (auth.role() = 'authenticated');

-- Alternative: More restrictive policies based on user roles
-- If you have specific roles like 'admin', 'doctor', 'researcher', etc.

-- Policy for admin-only operations (uncomment and modify if needed)
-- CREATE POLICY "Only admins can delete patients" ON patients
--     FOR DELETE 
--     USING (auth.jwt() ->> 'role' = 'admin');

-- Policy for specific user permissions (example)
-- CREATE POLICY "Users can only view patients they created" ON patients
--     FOR SELECT 
--     USING (auth.uid() = created_by);

-- Step 3: Grant necessary permissions to authenticated role
GRANT ALL ON patients TO authenticated;

-- Grant sequence permissions (handle different possible sequence names)
DO $$
DECLARE
    seq_name text;
BEGIN
    -- Find the sequence name for the patients table id column
    SELECT pg_get_serial_sequence('patients', 'id') INTO seq_name;
    
    IF seq_name IS NOT NULL THEN
        EXECUTE format('GRANT USAGE ON SEQUENCE %s TO authenticated', seq_name);
    END IF;
END $$;

-- Step 4: Create index on commonly filtered columns for RLS performance
CREATE INDEX IF NOT EXISTS idx_patients_auth_performance 
ON patients (id, created_at, modified_at);

-- Optional: Create a policy for service role (for admin operations)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'patients' AND policyname = 'Service role has full access'
    ) THEN
        CREATE POLICY "Service role has full access" ON patients
            FOR ALL 
            USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Note: Adjust these policies based on your specific authentication and authorization requirements
-- Common scenarios:
-- 1. All authenticated users can CRUD all patients (current setup)
-- 2. Role-based access (admin, doctor, researcher, etc.)  
-- 3. Organization/clinic-based access (users can only see patients from their clinic)
-- 4. Created-by access (users can only see patients they created)