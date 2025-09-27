-- Debug function to check auth and policy logic
CREATE OR REPLACE FUNCTION debug_patient_policy()
RETURNS TABLE (
    current_auth_uid UUID,
    user_profile_exists BOOLEAN,
    user_profile_data JSONB,
    role_data JSONB,
    policy_check_result BOOLEAN
) 
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        auth.uid() as current_auth_uid,
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.user_id = auth.uid()
        ) as user_profile_exists,
        COALESCE(
            (SELECT to_jsonb(up.*) FROM user_profiles up WHERE up.user_id = auth.uid()),
            '{}'::jsonb
        ) as user_profile_data,
        COALESCE(
            (SELECT to_jsonb(r.*) FROM user_profiles up 
             JOIN roles r ON up.role_id = r.id 
             WHERE up.user_id = auth.uid()),
            '{}'::jsonb
        ) as role_data,
        EXISTS (
            SELECT 1
            FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name IN ('admin', 'operator')
        ) as policy_check_result;
END;
$$ LANGUAGE plpgsql;