-- ===================================================
-- STORAGE BUCKET AND RLS SETUP FOR EXPENSE RECEIPTS
-- ===================================================

-- 1. Create the expenses storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('expenses', 'expenses', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on storage objects (usually enabled by default)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create storage policies for the expenses bucket

-- Policy: Allow anyone to INSERT (upload) files to expenses bucket
CREATE POLICY "Allow uploads to expenses bucket"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'expenses');

-- Policy: Allow anyone to SELECT (view/download) files from expenses bucket
CREATE POLICY "Allow downloads from expenses bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'expenses');

-- Policy: Allow anyone to UPDATE files in expenses bucket
CREATE POLICY "Allow updates to expenses bucket"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'expenses')
WITH CHECK (bucket_id = 'expenses');

-- Policy: Allow anyone to DELETE files from expenses bucket
CREATE POLICY "Allow deletes from expenses bucket"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'expenses');

-- ===================================================
-- TABLE RLS POLICIES FOR APPLICATION DATA
-- ===================================================

-- Enable RLS on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_items ENABLE ROW LEVEL SECURITY;

-- Patients table policies
CREATE POLICY "Allow read access to patients"
ON patients
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow insert to patients"
ON patients
FOR INSERT
TO public
WITH CHECK (true);

-- Trials table policies
CREATE POLICY "Allow read access to trials"
ON trials
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow insert to trials"
ON trials
FOR INSERT
TO public
WITH CHECK (true);

-- Patient expenses table policies
CREATE POLICY "Allow all operations on patient_expenses"
ON patient_expenses
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Expense items table policies
CREATE POLICY "Allow all operations on expense_items"
ON expense_items
FOR ALL
TO public
USING (true)
WITH CHECK (true);