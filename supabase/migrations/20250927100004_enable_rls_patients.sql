-- Systematic RLS Implementation: Patients Table
-- Apply proven RBAC pattern from admin system

-- Enable RLS on patients table
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated active users with admin/operator roles can read patients
CREATE POLICY "Authenticated users can read patients" ON patients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name IN ('admin', 'operator')
        )
    );

-- Policy: Authenticated active users with admin/operator roles can create patients
CREATE POLICY "Authenticated users can create patients" ON patients
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name IN ('admin', 'operator')
        )
    );

-- Policy: Authenticated active users with admin/operator roles can update patients
CREATE POLICY "Authenticated users can update patients" ON patients
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

-- Policy: Only admins can delete patients (more restrictive)
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