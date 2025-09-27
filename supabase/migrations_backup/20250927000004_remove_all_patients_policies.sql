-- Remove all RLS policies from patients table to eliminate conflicts
-- This provides a clean slate for the patients table

-- Drop all existing policies on patients table
DROP POLICY IF EXISTS "Enable insert access for all users" ON patients;
DROP POLICY IF EXISTS "Enable read access for all users" ON patients;
DROP POLICY IF EXISTS "Enable delete access for all users" ON patients;
DROP POLICY IF EXISTS "Enable update access for all users" ON patients;
DROP POLICY IF EXISTS "Users can create patients" ON patients;
DROP POLICY IF EXISTS "Users can read patients" ON patients;
DROP POLICY IF EXISTS "Users can update patients" ON patients;
DROP POLICY IF EXISTS "Admins can delete patients" ON patients;
DROP POLICY IF EXISTS "Allow insert to patients" ON patients;
DROP POLICY IF EXISTS "Allow read access to patients" ON patients;

-- Note: RLS remains enabled on patients table, but with no policies
-- This effectively allows all operations until new policies are added