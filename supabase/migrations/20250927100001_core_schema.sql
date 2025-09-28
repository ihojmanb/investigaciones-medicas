-- NUCLEAR RESET: Core Schema
-- Clean consolidated schema with all tables, no RLS, no policies

-- Core business tables
CREATE TABLE patients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL,
    first_name text NOT NULL,
    second_name text,
    first_surname text NOT NULL,
    second_surname text,
    status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at timestamptz DEFAULT now(),
    modified_at timestamptz DEFAULT now()
);

CREATE TABLE trials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    sponsor text,
    description text,
    start_date date,
    end_date date,
    medical_specialty text,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE visit_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    trial_id uuid REFERENCES trials(id) ON DELETE CASCADE,
    name text NOT NULL,
    order_number integer NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE patient_expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid REFERENCES patients(id) NOT NULL,
    trial_id uuid REFERENCES trials(id) NOT NULL,
    visit_type text NOT NULL,
    visit_date date NOT NULL,
    created_at timestamptz DEFAULT now(),
    modified_at timestamptz DEFAULT now()
);

CREATE TABLE expense_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_expense_id uuid REFERENCES patient_expenses(id) ON DELETE CASCADE,
    type text NOT NULL,
    receipt_url text,
    cost numeric,
    created_at timestamptz DEFAULT now(),
    modified_at timestamptz DEFAULT now()
);

-- Financial tracking tables
CREATE TABLE trial_services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    trial_id uuid REFERENCES trials(id) ON DELETE CASCADE,
    name text NOT NULL,
    amount numeric NOT NULL,
    currency text DEFAULT 'EUR',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE service_allocations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    trial_service_id uuid REFERENCES trial_services(id) ON DELETE CASCADE,
    name text NOT NULL,
    amount numeric NOT NULL,
    currency text DEFAULT 'EUR',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_patients_code ON patients(code);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_trials_active ON trials(active);
CREATE INDEX idx_visit_types_trial_id ON visit_types(trial_id);
CREATE INDEX idx_patient_expenses_patient_id ON patient_expenses(patient_id);
CREATE INDEX idx_patient_expenses_trial_id ON patient_expenses(trial_id);
CREATE INDEX idx_expense_items_patient_expense_id ON expense_items(patient_expense_id);
CREATE INDEX idx_trial_services_trial_id ON trial_services(trial_id);
CREATE INDEX idx_service_allocations_trial_service_id ON service_allocations(trial_service_id);

-- Update triggers for modified_at
CREATE OR REPLACE FUNCTION update_modified_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patients_update_modified_at
    BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_modified_at();

CREATE TRIGGER patient_expenses_update_modified_at
    BEFORE UPDATE ON patient_expenses
    FOR EACH ROW EXECUTE FUNCTION update_modified_at();

CREATE TRIGGER expense_items_update_modified_at
    BEFORE UPDATE ON expense_items
    FOR EACH ROW EXECUTE FUNCTION update_modified_at();

CREATE TRIGGER trial_services_update_modified_at
    BEFORE UPDATE ON trial_services
    FOR EACH ROW EXECUTE FUNCTION update_modified_at();

CREATE TRIGGER service_allocations_update_modified_at
    BEFORE UPDATE ON service_allocations
    FOR EACH ROW EXECUTE FUNCTION update_modified_at();