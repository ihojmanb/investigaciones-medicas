# Supabase RLS Setup Instructions

The error "new row violates row-level security policy" occurs because Supabase has Row Level Security (RLS) enabled but no policies are configured.

## Option 1: Using Supabase Dashboard (Recommended)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project
3. Go to **SQL Editor**
4. Copy and paste the contents of `supabase_rls_setup.sql`
5. Click **Run** to execute the SQL

## Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db reset
```

Or run the SQL file directly:

```bash
supabase db push
```

## Option 3: Manual Setup via Dashboard

### Storage Bucket Setup:
1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket called `expenses`
3. Make it **public**
4. Add the following policies in **Storage > Policies**:
   - Allow uploads to expenses bucket
   - Allow downloads from expenses bucket

### Table Policies:
1. Go to **Authentication > Policies**
2. For each table (`patients`, `trials`, `patient_expenses`, `expense_items`):
   - Enable RLS
   - Add policies that allow public access (or restrict as needed)

## What the SQL Does:

- ✅ Creates the `expenses` storage bucket (public)
- ✅ Sets up storage policies for file upload/download
- ✅ Enables RLS on all tables
- ✅ Creates permissive policies for all tables (allows public access)

After running this SQL, your file upload should work without RLS errors.

## Security Note:

The current policies allow public access. In production, you should restrict these policies based on your authentication requirements.