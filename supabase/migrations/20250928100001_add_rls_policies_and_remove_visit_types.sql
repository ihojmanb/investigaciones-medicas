-- Add RLS Policies and Remove visit_types Table
-- Following the established RBAC pattern from patients/trials

-- Drop visit_types table and its dependencies
DROP TABLE IF EXISTS visit_types CASCADE;

-- Enable RLS on expense_items table
ALTER TABLE expense_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for expense_items
CREATE POLICY "Authenticated users can read expense_items" ON expense_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name IN ('admin', 'operator')
        )
    );

CREATE POLICY "Authenticated users can create expense_items" ON expense_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name IN ('admin', 'operator')
        )
    );

CREATE POLICY "Authenticated users can update expense_items" ON expense_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name IN ('admin', 'operator')
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name IN ('admin', 'operator')
        )
    );

CREATE POLICY "Admins can delete expense_items" ON expense_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name = 'admin'
        )
    );

-- Enable RLS on patient_expenses table
ALTER TABLE patient_expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patient_expenses
CREATE POLICY "Authenticated users can read patient_expenses" ON patient_expenses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name IN ('admin', 'operator')
        )
    );

CREATE POLICY "Authenticated users can create patient_expenses" ON patient_expenses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name IN ('admin', 'operator')
        )
    );

CREATE POLICY "Authenticated users can update patient_expenses" ON patient_expenses
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name IN ('admin', 'operator')
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name IN ('admin', 'operator')
        )
    );

CREATE POLICY "Admins can delete patient_expenses" ON patient_expenses
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() 
            AND up.is_active = true
            AND r.name = 'admin'
        )
    );