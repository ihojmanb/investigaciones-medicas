-- Add modified_at column to patient_expenses table
ALTER TABLE patient_expenses 
ADD COLUMN modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Set modified_at to created_at for existing records
UPDATE patient_expenses 
SET modified_at = created_at 
WHERE modified_at IS NULL;

-- Create a trigger to automatically update modified_at when a record is updated
CREATE OR REPLACE FUNCTION update_modified_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for patient_expenses
CREATE TRIGGER update_patient_expenses_modified_at 
    BEFORE UPDATE ON patient_expenses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_modified_at_column();

-- Also add modified_at to expense_items table since items can be updated independently
ALTER TABLE expense_items 
ADD COLUMN modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Set modified_at to created_at for existing expense_items records
UPDATE expense_items 
SET modified_at = created_at 
WHERE modified_at IS NULL;

-- Create trigger for expense_items
CREATE TRIGGER update_expense_items_modified_at 
    BEFORE UPDATE ON expense_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_modified_at_column();