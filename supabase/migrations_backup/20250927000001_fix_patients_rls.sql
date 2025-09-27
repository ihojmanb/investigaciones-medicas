-- Fix patients RLS policies to work with user_profiles RBAC system

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow insert to patients" ON patients;
DROP POLICY IF EXISTS "Allow read access to patients" ON patients; 
DROP POLICY IF EXISTS "Enable delete access for all users" ON patients;
DROP POLICY IF EXISTS "Enable update access for all users" ON patients;

-- Create new policies that work with our user_profiles system
-- Users with active profiles can read patients if they have permission
CREATE POLICY "Users can read patients" ON patients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name IN ('admin', 'operator')
        )
    );

-- Users with active profiles can create patients if they have permission
CREATE POLICY "Users can create patients" ON patients
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name IN ('admin', 'operator')
        )
    );

-- Users with active profiles can update patients if they have permission
CREATE POLICY "Users can update patients" ON patients
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name IN ('admin', 'operator')
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name IN ('admin', 'operator')
        )
    );

-- Only admins can delete patients
CREATE POLICY "Admins can delete patients" ON patients
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name = 'admin'
        )
    );