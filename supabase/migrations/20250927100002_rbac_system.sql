-- NUCLEAR RESET: RBAC System
-- Clean implementation of working roles and user profiles system

-- Create roles table
CREATE TABLE roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Insert basic roles
INSERT INTO roles (name, description) VALUES 
    ('operator', 'Default operator role with basic access'),
    ('admin', 'Administrator with full access');

-- Create user_profiles table
CREATE TABLE user_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email text NOT NULL,
    full_name text,
    role_id uuid REFERENCES roles(id) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Auto user profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    operator_role_id uuid;
BEGIN
    -- Get the operator role id (explicitly reference public schema)
    SELECT id INTO operator_role_id FROM public.roles WHERE name = 'operator';
    
    -- If no operator role found, raise exception
    IF operator_role_id IS NULL THEN
        RAISE EXCEPTION 'Operator role not found in roles table';
    END IF;
    
    -- Create user profile with operator role
    INSERT INTO public.user_profiles (user_id, email, role_id)
    VALUES (NEW.id, NEW.email, operator_role_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto user profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable RLS on user_profiles (proven working)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy - users can see their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Admin functions for user management (bypasses RLS)
CREATE OR REPLACE FUNCTION get_all_users_for_admin()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    email TEXT,
    full_name TEXT,
    role_id UUID,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    role_name TEXT
) 
SECURITY DEFINER
AS $$
BEGIN
    -- Check if current user is admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE up.user_id = auth.uid() 
        AND r.name = 'admin' 
        AND up.is_active = true
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;
    
    -- Return all users with role names
    RETURN QUERY
    SELECT 
        up.id,
        up.user_id,
        up.email,
        up.full_name,
        up.role_id,
        up.is_active,
        up.created_at,
        up.updated_at,
        r.name as role_name
    FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    ORDER BY up.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Admin function to change user role
CREATE OR REPLACE FUNCTION change_user_role(
    target_user_id UUID,
    new_role_name TEXT
)
RETURNS VOID
SECURITY DEFINER
AS $$
DECLARE
    new_role_id UUID;
BEGIN
    -- Check if current user is admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE up.user_id = auth.uid() 
        AND r.name = 'admin' 
        AND up.is_active = true
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;
    
    -- Get the new role ID
    SELECT id INTO new_role_id FROM roles WHERE name = new_role_name;
    
    IF new_role_id IS NULL THEN
        RAISE EXCEPTION 'Invalid role name: %', new_role_name;
    END IF;
    
    -- Update the user's role
    UPDATE user_profiles 
    SET role_id = new_role_id, updated_at = NOW()
    WHERE user_id = target_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found: %', target_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Admin function to change user status
CREATE OR REPLACE FUNCTION change_user_status(
    target_user_id UUID,
    new_status BOOLEAN
)
RETURNS VOID
SECURITY DEFINER
AS $$
BEGIN
    -- Check if current user is admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE up.user_id = auth.uid() 
        AND r.name = 'admin' 
        AND up.is_active = true
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;
    
    -- Update the user's status
    UPDATE user_profiles 
    SET is_active = new_status, updated_at = NOW()
    WHERE user_id = target_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found: %', target_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_role_id ON user_profiles(role_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_roles_name ON roles(name);