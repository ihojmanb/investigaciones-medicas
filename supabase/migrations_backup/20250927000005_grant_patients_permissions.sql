-- Grant table-level permissions to authenticated users for patients table
-- This is separate from RLS and required for API access

-- Grant all permissions on patients table to authenticated role
GRANT ALL ON patients TO authenticated;

-- Grant usage on the sequence (for auto-incrementing IDs if any)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Also grant to anon role (for public access if needed)
GRANT SELECT, INSERT, UPDATE, DELETE ON patients TO anon;

-- Grant usage permissions on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;