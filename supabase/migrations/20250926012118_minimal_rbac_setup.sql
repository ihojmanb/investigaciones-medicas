-- Minimal RBAC Setup
-- Step 1: Create roles table and user_profiles table
-- Step 2: Set up auto user profile creation
-- Step 3: Default role assignment (operator)

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Insert basic roles
INSERT INTO roles (name, description) VALUES 
    ('operator', 'Default operator role with basic access'),
    ('admin', 'Administrator with full access')
ON CONFLICT (name) DO NOTHING;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email text NOT NULL,
    full_name text,
    role_id uuid REFERENCES roles(id) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    operator_role_id uuid;
BEGIN
    -- Get the operator role id (explicitly reference public schema)
    SELECT id INTO operator_role_id FROM public.roles WHERE name = 'operator';
    
    -- Create user profile with operator role
    INSERT INTO public.user_profiles (user_id, email, role_id)
    VALUES (NEW.id, NEW.email, operator_role_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy - users can see their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_id ON user_profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);