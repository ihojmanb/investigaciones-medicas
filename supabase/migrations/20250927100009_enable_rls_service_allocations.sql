-- RLS Implementation: Service Allocations Table
-- Admin-only access (financial data)

-- Enable RLS on service_allocations table
ALTER TABLE service_allocations ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can access service_allocations (all operations)
CREATE POLICY "Admins only access service_allocations" ON service_allocations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name = 'admin'
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name = 'admin'
        )
    );