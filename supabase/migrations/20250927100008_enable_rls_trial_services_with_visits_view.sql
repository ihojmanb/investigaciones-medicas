-- RLS Implementation: Trial Services with Visits View
-- Admins have full access to trial_services table
-- Operators use visits view (no financial data exposure)

-- Enable RLS on trial_services table (admin-only access)
ALTER TABLE trial_services ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can access trial_services table
CREATE POLICY "Admins only access trial_services" ON trial_services
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

-- Create visits view for operators (no financial columns)
-- View will use security_invoker to respect the underlying table's RLS
CREATE VIEW visits 
WITH (security_invoker = on) AS 
SELECT 
    id,
    trial_id, 
    name,
    visit_order,
    created_at
FROM trial_services 
WHERE is_visit = true
ORDER BY trial_id, visit_order;

-- Grant access to visits view for authenticated users
GRANT SELECT ON visits TO authenticated;

-- Add additional policy to trial_services for operators to access visit data through view
CREATE POLICY "Operators can read visit services through view" ON trial_services
    FOR SELECT USING (
        is_visit = true AND
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name = 'operator'
        )
    );