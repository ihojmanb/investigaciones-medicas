-- RBAC Migration 2: Update RLS Policies for Role-Based Access Control
-- This migration updates existing table policies to work with the RBAC system

-- Helper function to check if user has specific permission
CREATE OR REPLACE FUNCTION user_has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_role_permissions TEXT[];
    user_custom_permissions TEXT[];
    explicit_permission BOOLEAN;
BEGIN
    -- Return false if no authenticated user
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Get role-based permissions
    SELECT r.default_permissions INTO user_role_permissions
    FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = auth.uid() AND up.is_active = true;
    
    -- Get custom permissions
    SELECT up.custom_permissions INTO user_custom_permissions
    FROM user_profiles up
    WHERE up.id = auth.uid();
    
    -- Check for explicit permission grants/revokes
    SELECT granted INTO explicit_permission
    FROM user_permissions
    WHERE user_id = auth.uid() 
      AND permission = permission_name
      AND revoked_at IS NULL
    ORDER BY granted_at DESC
    LIMIT 1;
    
    -- If explicit permission exists, use it
    IF explicit_permission IS NOT NULL THEN
        RETURN explicit_permission;
    END IF;
    
    -- Check role permissions
    IF permission_name = ANY(user_role_permissions) THEN
        RETURN TRUE;
    END IF;
    
    -- Check custom permissions
    IF permission_name = ANY(user_custom_permissions) THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() 
          AND r.name = 'admin' 
          AND up.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- UPDATE PATIENTS TABLE RLS POLICIES
-- ============================================================================

-- Drop existing patients policies
DROP POLICY IF EXISTS "Enable read access for all users" ON patients;
DROP POLICY IF EXISTS "Enable insert access for all users" ON patients;
DROP POLICY IF EXISTS "Enable update access for all users" ON patients;
DROP POLICY IF EXISTS "Enable delete access for all users" ON patients;
DROP POLICY IF EXISTS "Users can view all patients" ON patients;
DROP POLICY IF EXISTS "Users can insert patients" ON patients;
DROP POLICY IF EXISTS "Users can update patients" ON patients;
DROP POLICY IF EXISTS "Service role has full access" ON patients;

-- Create new role-based policies for patients
CREATE POLICY "patients_select_policy" ON patients
    FOR SELECT USING (
        user_has_permission('patients:read')
    );

CREATE POLICY "patients_insert_policy" ON patients
    FOR INSERT WITH CHECK (
        user_has_permission('patients:create')
    );

CREATE POLICY "patients_update_policy" ON patients
    FOR UPDATE USING (
        user_has_permission('patients:update')
    ) WITH CHECK (
        user_has_permission('patients:update')
    );

CREATE POLICY "patients_delete_policy" ON patients
    FOR DELETE USING (
        user_has_permission('patients:delete')
    );

-- ============================================================================
-- UPDATE TRIALS TABLE RLS POLICIES
-- ============================================================================

-- Drop existing trials policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON trials;
DROP POLICY IF EXISTS "Enable insert access for all users" ON trials;
DROP POLICY IF EXISTS "Enable update access for all users" ON trials;
DROP POLICY IF EXISTS "Enable delete access for all users" ON trials;

-- Create role-based policies for trials
CREATE POLICY "trials_select_policy" ON trials
    FOR SELECT USING (
        user_has_permission('trials:read')
    );

CREATE POLICY "trials_insert_policy" ON trials
    FOR INSERT WITH CHECK (
        user_has_permission('trials:create')
    );

CREATE POLICY "trials_update_policy" ON trials
    FOR UPDATE USING (
        user_has_permission('trials:update')
    ) WITH CHECK (
        user_has_permission('trials:update')
    );

CREATE POLICY "trials_delete_policy" ON trials
    FOR DELETE USING (
        user_has_permission('trials:delete')
    );

-- ============================================================================
-- CREATE RLS POLICIES FOR TRIAL SERVICES (SENSITIVE FINANCIAL DATA)
-- ============================================================================

-- Enable RLS on trial_services if not already enabled
ALTER TABLE trial_services ENABLE ROW LEVEL SECURITY;

-- Create policies for trial services (admins only by default)
CREATE POLICY "trial_services_select_policy" ON trial_services
    FOR SELECT USING (
        user_has_permission('trial_services:read')
    );

CREATE POLICY "trial_services_insert_policy" ON trial_services
    FOR INSERT WITH CHECK (
        user_has_permission('trial_services:create')
    );

CREATE POLICY "trial_services_update_policy" ON trial_services
    FOR UPDATE USING (
        user_has_permission('trial_services:update')
    ) WITH CHECK (
        user_has_permission('trial_services:update')
    );

CREATE POLICY "trial_services_delete_policy" ON trial_services
    FOR DELETE USING (
        user_has_permission('trial_services:delete')
    );

-- ============================================================================
-- CREATE RLS POLICIES FOR SERVICE ALLOCATIONS (SENSITIVE FINANCIAL DATA)
-- ============================================================================

-- Enable RLS on service_allocations if not already enabled
ALTER TABLE service_allocations ENABLE ROW LEVEL SECURITY;

-- Create policies for service allocations (admins only by default)
CREATE POLICY "service_allocations_select_policy" ON service_allocations
    FOR SELECT USING (
        user_has_permission('service_allocations:read')
    );

CREATE POLICY "service_allocations_insert_policy" ON service_allocations
    FOR INSERT WITH CHECK (
        user_has_permission('service_allocations:create')
    );

CREATE POLICY "service_allocations_update_policy" ON service_allocations
    FOR UPDATE USING (
        user_has_permission('service_allocations:update')
    ) WITH CHECK (
        user_has_permission('service_allocations:update')
    );

CREATE POLICY "service_allocations_delete_policy" ON service_allocations
    FOR DELETE USING (
        user_has_permission('service_allocations:delete')
    );

-- ============================================================================
-- CREATE RLS POLICIES FOR EXPENSES
-- ============================================================================

-- Check if patient_expenses table exists and enable RLS
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_expenses') THEN
        ALTER TABLE patient_expenses ENABLE ROW LEVEL SECURITY;
        
        -- Create policies for patient expenses
        CREATE POLICY "patient_expenses_select_policy" ON patient_expenses
            FOR SELECT USING (
                user_has_permission('expenses:read')
            );

        CREATE POLICY "patient_expenses_insert_policy" ON patient_expenses
            FOR INSERT WITH CHECK (
                user_has_permission('expenses:create')
            );

        CREATE POLICY "patient_expenses_update_policy" ON patient_expenses
            FOR UPDATE USING (
                user_has_permission('expenses:update')
            ) WITH CHECK (
                user_has_permission('expenses:update')
            );

        CREATE POLICY "patient_expenses_delete_policy" ON patient_expenses
            FOR DELETE USING (
                user_has_permission('expenses:delete')
            );
    END IF;
END $$;

-- Check if expense_items table exists and enable RLS
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'expense_items') THEN
        ALTER TABLE expense_items ENABLE ROW LEVEL SECURITY;
        
        -- Create policies for expense items
        CREATE POLICY "expense_items_select_policy" ON expense_items
            FOR SELECT USING (
                user_has_permission('expenses:read')
            );

        CREATE POLICY "expense_items_insert_policy" ON expense_items
            FOR INSERT WITH CHECK (
                user_has_permission('expenses:create')
            );

        CREATE POLICY "expense_items_update_policy" ON expense_items
            FOR UPDATE USING (
                user_has_permission('expenses:update')
            ) WITH CHECK (
                user_has_permission('expenses:update')
            );

        CREATE POLICY "expense_items_delete_policy" ON expense_items
            FOR DELETE USING (
                user_has_permission('expenses:delete')
            );
    END IF;
END $$;

-- ============================================================================
-- SERVICE ROLE BYPASS (for system operations)
-- ============================================================================

-- Create service role bypass policies for all tables
CREATE POLICY "service_role_bypass_patients" ON patients
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_bypass_trials" ON trials
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_bypass_trial_services" ON trial_services
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_bypass_service_allocations" ON service_allocations
    FOR ALL USING (auth.role() = 'service_role');

-- Service role bypass for expense tables if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_expenses') THEN
        CREATE POLICY "service_role_bypass_patient_expenses" ON patient_expenses
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'expense_items') THEN
        CREATE POLICY "service_role_bypass_expense_items" ON expense_items
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- ============================================================================
-- GRANT UPDATED PERMISSIONS
-- ============================================================================

-- Revoke previous broad permissions
REVOKE ALL ON patients FROM anon;
REVOKE ALL ON trials FROM anon;

-- Grant select permissions to authenticated users (policies will control access)
GRANT SELECT, INSERT, UPDATE, DELETE ON patients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON trials TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON trial_services TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON service_allocations TO authenticated;

-- Grant permissions for expense tables if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_expenses') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON patient_expenses TO authenticated;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'expense_items') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON expense_items TO authenticated;
    END IF;
END $$;

-- Create function to log permission checks (for debugging)
CREATE OR REPLACE FUNCTION log_permission_check(
    user_id UUID,
    permission_name TEXT,
    granted BOOLEAN,
    table_name TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Only log if we're in development/debug mode
    -- You can add a setting table to control this
    -- For now, we'll skip logging to avoid spam
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;