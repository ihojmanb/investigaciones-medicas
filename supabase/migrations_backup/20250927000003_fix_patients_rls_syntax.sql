-- Fix patients RLS policies - use exact same logic as debug function that works

-- Drop the current policies
DROP POLICY IF EXISTS "Users can create patients" ON patients;
DROP POLICY IF EXISTS "Users can read patients" ON patients;
DROP POLICY IF EXISTS "Users can update patients" ON patients;
DROP POLICY IF EXISTS "Admins can delete patients" ON patients;

-- Recreate with exact same logic as working debug function
CREATE POLICY "Users can read patients" ON patients
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name IN ('admin', 'operator')
        )
    );

CREATE POLICY "Users can create patients" ON patients
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name IN ('admin', 'operator')
        )
    );

CREATE POLICY "Users can update patients" ON patients
    FOR UPDATE USING (
        EXISTS (
            SELECT 1
            FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name IN ('admin', 'operator')
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1
            FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name IN ('admin', 'operator')
        )
    );

CREATE POLICY "Admins can delete patients" ON patients
    FOR DELETE USING (
        EXISTS (
            SELECT 1
            FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name = 'admin'
        )
    );