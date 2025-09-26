-- Admin User Management RLS Policy
-- Simplified: Just basic user access, admin functions for management

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;

-- Simple policy: Users can see their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Create admin function to fetch all users (bypasses RLS)
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

-- Create function to change user role (admin only)
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

-- Create function to change user status (admin only)
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