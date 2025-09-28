-- Systematic RLS Implementation: Trials Table
-- Apply proven RBAC pattern from admin system

-- Enable RLS on trials table
ALTER TABLE trials ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated active users with admin/operator roles can read trials
CREATE POLICY "Authenticated users can read trials" ON trials
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name IN ('admin', 'operator')
        )
    );

-- Policy: Authenticated active users with admin/operator roles can create trials
CREATE POLICY "Authenticated users can create trials" ON trials
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name IN ('admin', 'operator')
        )
    );

-- Policy: Authenticated active users with admin/operator roles can update trials
CREATE POLICY "Authenticated users can update trials" ON trials
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

-- Policy: Only admins can delete trials (more restrictive)
CREATE POLICY "Admins can delete trials" ON trials
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name = 'admin'
        )
    );