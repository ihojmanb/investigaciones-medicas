-- Explicitly disable RLS on patients table
-- This should allow all access regardless of authentication

-- Disable Row Level Security completely
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;

-- Verify RLS status (this will show in logs)
SELECT 
    schemaname,
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'patients';

-- Double-check by granting all permissions again
GRANT ALL PRIVILEGES ON patients TO authenticated;
GRANT ALL PRIVILEGES ON patients TO anon;
GRANT ALL PRIVILEGES ON patients TO public;