-- RBAC Migration 1: Create User Profiles and Roles
-- This migration sets up the foundation for role-based access control

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create roles table with predefined system roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    default_permissions TEXT[] DEFAULT '{}',
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    modified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_profiles table linked to Supabase auth.users
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role_id UUID REFERENCES roles(id),
    custom_permissions TEXT[] DEFAULT '{}', -- Override/additional permissions
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    modified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_permissions table for granular permission overrides
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    permission VARCHAR(255) NOT NULL,
    granted BOOLEAN NOT NULL DEFAULT true,
    granted_by UUID REFERENCES user_profiles(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, permission)
);

-- Create audit log for tracking permission changes
CREATE TABLE IF NOT EXISTS permission_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id),
    action VARCHAR(50) NOT NULL, -- 'grant', 'revoke', 'role_change', 'impersonate'
    permission VARCHAR(255),
    old_value TEXT,
    new_value TEXT,
    performed_by UUID REFERENCES user_profiles(id),
    performed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Insert predefined roles
INSERT INTO roles (name, description, default_permissions, is_system_role) VALUES
('admin', 'Full system access with user management capabilities', ARRAY[
    'patients:create', 'patients:read', 'patients:update', 'patients:delete',
    'expenses:create', 'expenses:read', 'expenses:update', 'expenses:delete',
    'trials:create', 'trials:read', 'trials:update', 'trials:delete',
    'trial_services:read', 'trial_services:create', 'trial_services:update', 'trial_services:delete',
    'service_allocations:read', 'service_allocations:create', 'service_allocations:update', 'service_allocations:delete',
    'reports:read', 'reports:export',
    'users:read', 'users:create', 'users:update', 'users:delete',
    'permissions:read', 'permissions:grant', 'permissions:revoke',
    'audit:read', 'impersonation:use'
], true),
('operator', 'Limited operational access - no financial data or admin functions', ARRAY[]::TEXT[], true);

-- Create function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
    default_role_id UUID;
BEGIN
    -- Get the default operator role
    SELECT id INTO default_role_id FROM roles WHERE name = 'operator' LIMIT 1;
    
    -- Create user profile
    INSERT INTO user_profiles (id, email, full_name, role_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        default_role_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic user profile creation
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- Create function to update modified_at timestamp
CREATE OR REPLACE FUNCTION update_modified_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for modified_at updates
CREATE TRIGGER update_roles_modified_at 
    BEFORE UPDATE ON roles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_modified_at_column();

CREATE TRIGGER update_user_profiles_modified_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_modified_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_id ON user_profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission ON user_permissions(permission);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON permission_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_performed_at ON permission_audit_log(performed_at);

-- Enable RLS on new tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_audit_log ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (will be refined in next migration)
-- For now, allow authenticated users to read their own profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view roles" ON roles
    FOR SELECT USING (true);

-- Admin-only policies for user management
CREATE POLICY "Admins can manage all user profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN roles r ON up.role_id = r.id 
            WHERE up.id = auth.uid() AND r.name = 'admin'
        )
    );

CREATE POLICY "Admins can manage user permissions" ON user_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN roles r ON up.role_id = r.id 
            WHERE up.id = auth.uid() AND r.name = 'admin'
        )
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON roles TO authenticated, anon;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_permissions TO authenticated;
GRANT ALL ON permission_audit_log TO authenticated;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;