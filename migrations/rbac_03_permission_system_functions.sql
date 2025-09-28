-- RBAC Migration 3: Permission System Functions and Utilities
-- This migration creates utility functions for permission management and audit logging

-- ============================================================================
-- PERMISSION MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to grant permission to a user
CREATE OR REPLACE FUNCTION grant_user_permission(
    target_user_id UUID,
    permission_name TEXT,
    granted_by_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
DECLARE
    granter_is_admin BOOLEAN;
    result BOOLEAN := FALSE;
BEGIN
    -- Check if granter is admin
    SELECT user_is_admin() INTO granter_is_admin WHERE auth.uid() = granted_by_user_id;
    
    IF NOT granter_is_admin THEN
        RAISE EXCEPTION 'Only administrators can grant permissions';
    END IF;
    
    -- Insert or update permission
    INSERT INTO user_permissions (user_id, permission, granted, granted_by, granted_at)
    VALUES (target_user_id, permission_name, true, granted_by_user_id, NOW())
    ON CONFLICT (user_id, permission) 
    DO UPDATE SET 
        granted = true,
        granted_by = granted_by_user_id,
        granted_at = NOW(),
        revoked_at = NULL;
    
    -- Log the action
    INSERT INTO permission_audit_log (
        user_id, action, permission, new_value, performed_by, performed_at
    ) VALUES (
        target_user_id, 'grant', permission_name, 'true', granted_by_user_id, NOW()
    );
    
    result := TRUE;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke permission from a user
CREATE OR REPLACE FUNCTION revoke_user_permission(
    target_user_id UUID,
    permission_name TEXT,
    revoked_by_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
DECLARE
    revoker_is_admin BOOLEAN;
    result BOOLEAN := FALSE;
BEGIN
    -- Check if revoker is admin
    SELECT user_is_admin() INTO revoker_is_admin WHERE auth.uid() = revoked_by_user_id;
    
    IF NOT revoker_is_admin THEN
        RAISE EXCEPTION 'Only administrators can revoke permissions';
    END IF;
    
    -- Update permission to revoked
    INSERT INTO user_permissions (user_id, permission, granted, granted_by, granted_at)
    VALUES (target_user_id, permission_name, false, revoked_by_user_id, NOW())
    ON CONFLICT (user_id, permission) 
    DO UPDATE SET 
        granted = false,
        granted_by = revoked_by_user_id,
        granted_at = NOW(),
        revoked_at = NOW();
    
    -- Log the action
    INSERT INTO permission_audit_log (
        user_id, action, permission, new_value, performed_by, performed_at
    ) VALUES (
        target_user_id, 'revoke', permission_name, 'false', revoked_by_user_id, NOW()
    );
    
    result := TRUE;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to change user role
CREATE OR REPLACE FUNCTION change_user_role(
    target_user_id UUID,
    new_role_name TEXT,
    changed_by_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
DECLARE
    changer_is_admin BOOLEAN;
    new_role_id UUID;
    old_role_name TEXT;
    result BOOLEAN := FALSE;
BEGIN
    -- Check if changer is admin
    SELECT user_is_admin() INTO changer_is_admin WHERE auth.uid() = changed_by_user_id;
    
    IF NOT changer_is_admin THEN
        RAISE EXCEPTION 'Only administrators can change user roles';
    END IF;
    
    -- Get new role ID
    SELECT id INTO new_role_id FROM roles WHERE name = new_role_name;
    
    IF new_role_id IS NULL THEN
        RAISE EXCEPTION 'Role % does not exist', new_role_name;
    END IF;
    
    -- Get current role name for logging
    SELECT r.name INTO old_role_name 
    FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = target_user_id;
    
    -- Update user role
    UPDATE user_profiles 
    SET role_id = new_role_id, modified_at = NOW()
    WHERE id = target_user_id;
    
    -- Log the action
    INSERT INTO permission_audit_log (
        user_id, action, old_value, new_value, performed_by, performed_at
    ) VALUES (
        target_user_id, 'role_change', old_role_name, new_role_name, changed_by_user_id, NOW()
    );
    
    result := TRUE;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user permissions (for UI display)
CREATE OR REPLACE FUNCTION get_user_permissions(target_user_id UUID)
RETURNS TABLE (
    permission TEXT,
    source TEXT, -- 'role' or 'custom' or 'explicit'
    granted BOOLEAN,
    granted_at TIMESTAMPTZ,
    granted_by_email TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH role_permissions AS (
        SELECT 
            unnest(r.default_permissions) as permission,
            'role'::TEXT as source,
            true as granted,
            up.created_at as granted_at,
            'system'::TEXT as granted_by_email
        FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE up.id = target_user_id
    ),
    custom_permissions AS (
        SELECT 
            unnest(up.custom_permissions) as permission,
            'custom'::TEXT as source,
            true as granted,
            up.modified_at as granted_at,
            'system'::TEXT as granted_by_email
        FROM user_profiles up
        WHERE up.id = target_user_id AND up.custom_permissions IS NOT NULL
    ),
    explicit_permissions AS (
        SELECT 
            uperm.permission,
            'explicit'::TEXT as source,
            uperm.granted,
            uperm.granted_at,
            COALESCE(granter.email, 'system') as granted_by_email
        FROM user_permissions uperm
        LEFT JOIN user_profiles granter ON uperm.granted_by = granter.id
        WHERE uperm.user_id = target_user_id AND uperm.revoked_at IS NULL
    )
    SELECT * FROM role_permissions
    UNION ALL
    SELECT * FROM custom_permissions  
    UNION ALL
    SELECT * FROM explicit_permissions
    ORDER BY permission, source;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can impersonate (admins only)
CREATE OR REPLACE FUNCTION can_impersonate()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN user_has_permission('impersonation:use');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log impersonation events
CREATE OR REPLACE FUNCTION log_impersonation(
    target_role_name TEXT,
    action TEXT DEFAULT 'start' -- 'start' or 'end'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO permission_audit_log (
        user_id, action, new_value, performed_by, performed_at
    ) VALUES (
        auth.uid(), 'impersonate', action || ':' || target_role_name, auth.uid(), NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- UTILITY VIEWS FOR EASIER QUERYING
-- ============================================================================

-- View to get user details with role information
CREATE OR REPLACE VIEW user_details AS
SELECT 
    up.id,
    up.email,
    up.full_name,
    up.is_active,
    up.last_login_at,
    up.created_at,
    up.modified_at,
    r.name as role_name,
    r.description as role_description,
    r.default_permissions as role_permissions,
    up.custom_permissions,
    -- Calculate effective permissions (role + custom + explicit)
    (
        SELECT array_agg(DISTINCT perm)
        FROM (
            SELECT unnest(r.default_permissions) as perm
            UNION
            SELECT unnest(COALESCE(up.custom_permissions, '{}')) as perm
            UNION  
            SELECT uperm.permission as perm
            FROM user_permissions uperm 
            WHERE uperm.user_id = up.id 
              AND uperm.granted = true 
              AND uperm.revoked_at IS NULL
        ) all_perms
    ) as effective_permissions
FROM user_profiles up
LEFT JOIN roles r ON up.role_id = r.id;

-- View for audit log with user details
CREATE OR REPLACE VIEW permission_audit_details AS
SELECT 
    pal.*,
    up.email as user_email,
    up.full_name as user_name,
    performer.email as performed_by_email,
    performer.full_name as performed_by_name
FROM permission_audit_log pal
LEFT JOIN user_profiles up ON pal.user_id = up.id
LEFT JOIN user_profiles performer ON pal.performed_by = performer.id
ORDER BY pal.performed_at DESC;

-- ============================================================================
-- PREDEFINED PERMISSION CONSTANTS (for reference)
-- ============================================================================

-- Create a table to store available permissions (for UI dropdowns)
CREATE TABLE IF NOT EXISTS available_permissions (
    permission VARCHAR(255) PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    is_admin_only BOOLEAN DEFAULT false
);

-- Insert predefined permissions
INSERT INTO available_permissions (permission, category, description, is_admin_only) VALUES
-- Patient permissions
('patients:create', 'Patients', 'Create new patients', false),
('patients:read', 'Patients', 'View patient information', false),
('patients:update', 'Patients', 'Edit existing patients', false),
('patients:delete', 'Patients', 'Delete patients', false),

-- Expense permissions  
('expenses:create', 'Expenses', 'Submit new expense reports', false),
('expenses:read', 'Expenses', 'View expense reports', false),
('expenses:update', 'Expenses', 'Edit expense reports', false),
('expenses:delete', 'Expenses', 'Delete expense reports', false),

-- Trial permissions
('trials:create', 'Trials', 'Create new clinical trials', false),
('trials:read', 'Trials', 'View trial information', false),
('trials:update', 'Trials', 'Edit trial details', false),
('trials:delete', 'Trials', 'Delete trials', false),

-- Financial data permissions (admin only)
('trial_services:read', 'Financial', 'View trial service fees', true),
('trial_services:create', 'Financial', 'Create trial services', true),
('trial_services:update', 'Financial', 'Edit trial services', true),
('trial_services:delete', 'Financial', 'Delete trial services', true),
('service_allocations:read', 'Financial', 'View service cost allocations', true),
('service_allocations:create', 'Financial', 'Create service allocations', true),
('service_allocations:update', 'Financial', 'Edit service allocations', true),
('service_allocations:delete', 'Financial', 'Delete service allocations', true),

-- Reports permissions (admin only)
('reports:read', 'Reports', 'View analytics and reports', true),
('reports:export', 'Reports', 'Export reports and data', true),

-- User management permissions (admin only)
('users:read', 'Administration', 'View user accounts', true),
('users:create', 'Administration', 'Create new users', true),
('users:update', 'Administration', 'Edit user accounts', true),
('users:delete', 'Administration', 'Delete user accounts', true),
('permissions:read', 'Administration', 'View user permissions', true),
('permissions:grant', 'Administration', 'Grant permissions to users', true),
('permissions:revoke', 'Administration', 'Revoke permissions from users', true),

-- System permissions (admin only)
('audit:read', 'Administration', 'View audit logs', true),
('impersonation:use', 'Administration', 'Impersonate other user roles', true)

ON CONFLICT (permission) DO NOTHING;

-- Create RLS policy for available_permissions
ALTER TABLE available_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_users_can_view_permissions" ON available_permissions
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

GRANT SELECT ON available_permissions TO authenticated;