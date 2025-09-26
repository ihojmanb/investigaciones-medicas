-- RBAC Rollback Migration: Complete System Removal
-- This migration removes all RBAC components and restores the original simple access control
-- WARNING: This will permanently delete all user roles, permissions, and audit logs

-- Step 1: Drop all RLS policies created by RBAC system
DROP POLICY IF EXISTS "patients_select_policy" ON patients;
DROP POLICY IF EXISTS "patients_insert_policy" ON patients;
DROP POLICY IF EXISTS "patients_update_policy" ON patients;
DROP POLICY IF EXISTS "patients_delete_policy" ON patients;

DROP POLICY IF EXISTS "trials_select_policy" ON trials;
DROP POLICY IF EXISTS "trials_insert_policy" ON trials;
DROP POLICY IF EXISTS "trials_update_policy" ON trials;
DROP POLICY IF EXISTS "trials_delete_policy" ON trials;

DROP POLICY IF EXISTS "trial_services_select_policy" ON trial_services;
DROP POLICY IF EXISTS "trial_services_insert_policy" ON trial_services;
DROP POLICY IF EXISTS "trial_services_update_policy" ON trial_services;
DROP POLICY IF EXISTS "trial_services_delete_policy" ON trial_services;

DROP POLICY IF EXISTS "service_allocations_select_policy" ON service_allocations;
DROP POLICY IF EXISTS "service_allocations_insert_policy" ON service_allocations;
DROP POLICY IF EXISTS "service_allocations_update_policy" ON service_allocations;
DROP POLICY IF EXISTS "service_allocations_delete_policy" ON service_allocations;

-- Drop expense policies if they exist
DROP POLICY IF EXISTS "patient_expenses_select_policy" ON patient_expenses;
DROP POLICY IF EXISTS "patient_expenses_insert_policy" ON patient_expenses;
DROP POLICY IF EXISTS "patient_expenses_update_policy" ON patient_expenses;
DROP POLICY IF EXISTS "patient_expenses_delete_policy" ON patient_expenses;

DROP POLICY IF EXISTS "expense_items_select_policy" ON expense_items;
DROP POLICY IF EXISTS "expense_items_insert_policy" ON expense_items;
DROP POLICY IF EXISTS "expense_items_update_policy" ON expense_items;
DROP POLICY IF EXISTS "expense_items_delete_policy" ON expense_items;

-- Drop service role bypass policies
DROP POLICY IF EXISTS "service_role_bypass_patients" ON patients;
DROP POLICY IF EXISTS "service_role_bypass_trials" ON trials;
DROP POLICY IF EXISTS "service_role_bypass_trial_services" ON trial_services;
DROP POLICY IF EXISTS "service_role_bypass_service_allocations" ON service_allocations;
DROP POLICY IF EXISTS "service_role_bypass_patient_expenses" ON patient_expenses;
DROP POLICY IF EXISTS "service_role_bypass_expense_items" ON expense_items;

-- Step 2: Drop RBAC-specific functions
DROP FUNCTION IF EXISTS user_has_permission(TEXT);
DROP FUNCTION IF EXISTS user_is_admin();
DROP FUNCTION IF EXISTS grant_user_permission(UUID, TEXT, UUID);
DROP FUNCTION IF EXISTS revoke_user_permission(UUID, TEXT, UUID);
DROP FUNCTION IF EXISTS change_user_role(UUID, TEXT, UUID);
DROP FUNCTION IF EXISTS get_user_permissions(UUID);
DROP FUNCTION IF EXISTS can_impersonate();
DROP FUNCTION IF EXISTS log_impersonation(TEXT, TEXT);
DROP FUNCTION IF EXISTS log_permission_check(UUID, TEXT, BOOLEAN, TEXT);

-- Step 3: Drop views
DROP VIEW IF EXISTS user_details;
DROP VIEW IF EXISTS permission_audit_details;

-- Step 4: Drop triggers and trigger functions
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
DROP FUNCTION IF EXISTS create_user_profile();

-- Step 5: Drop RBAC tables (in correct order to avoid foreign key constraints)
DROP TABLE IF EXISTS permission_audit_log;
DROP TABLE IF EXISTS user_permissions;
DROP TABLE IF EXISTS available_permissions;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS roles;

-- Step 6: Restore original simple RLS policies

-- Restore simple "allow all authenticated users" policies for patients
CREATE POLICY "Enable read access for all users" ON patients
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON patients
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON patients
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON patients
    FOR DELETE USING (true);

-- Restore simple policies for trials
CREATE POLICY "Enable read access for all users" ON trials
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON trials
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON trials
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON trials
    FOR DELETE USING (true);

-- Disable RLS on financial tables (make them accessible to all authenticated users)
ALTER TABLE trial_services DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_allocations DISABLE ROW LEVEL SECURITY;

-- Disable RLS on expense tables if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_expenses') THEN
        ALTER TABLE patient_expenses DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'expense_items') THEN
        ALTER TABLE expense_items DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Step 7: Grant broad permissions (restore original access model)
GRANT ALL ON patients TO authenticated, anon;
GRANT ALL ON trials TO authenticated, anon;
GRANT ALL ON trial_services TO authenticated, anon;
GRANT ALL ON service_allocations TO authenticated, anon;

-- Grant permissions for expense tables if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_expenses') THEN
        GRANT ALL ON patient_expenses TO authenticated, anon;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'expense_items') THEN
        GRANT ALL ON expense_items TO authenticated, anon;
    END IF;
END $$;

-- Step 8: Clean up any remaining RBAC-related sequences
DO $$
DECLARE
    seq_name TEXT;
BEGIN
    -- Look for and drop any sequences that might be left over
    FOR seq_name IN 
        SELECT schemaname||'.'||sequencename 
        FROM pg_sequences 
        WHERE schemaname = 'public' 
        AND (sequencename LIKE '%role%' 
             OR sequencename LIKE '%permission%' 
             OR sequencename LIKE '%audit%'
             OR sequencename LIKE '%user_profile%')
    LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || seq_name || ' CASCADE';
    END LOOP;
END $$;

-- Step 9: Remove any remaining RBAC-related indexes
DO $$
DECLARE
    index_name TEXT;
BEGIN
    FOR index_name IN 
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND (indexname LIKE '%role%' 
             OR indexname LIKE '%permission%' 
             OR indexname LIKE '%audit%'
             OR indexname LIKE '%user_profile%')
    LOOP
        EXECUTE 'DROP INDEX IF EXISTS ' || index_name;
    END LOOP;
END $$;

-- Step 10: Verification queries (informational)
-- These will show the state after rollback

-- Show remaining tables
SELECT 'Remaining tables:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Show remaining functions
SELECT 'Remaining functions:' as info;
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Show remaining policies
SELECT 'Remaining RLS policies:' as info;
SELECT schemaname, tablename, policyname
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Success message
SELECT 'RBAC system has been completely removed. Original simple access control restored.' as rollback_status;