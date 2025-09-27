-- NUCLEAR RESET: Essential Seed Data
-- Clean seed data for testing and initial setup

-- Seed some basic visit types for testing
INSERT INTO trials (name, sponsor, description, medical_specialty, active) VALUES
    ('Trial Alpha', 'MedCorp Inc', 'Study for new cardiovascular treatment', 'Cardiology', true),
    ('Trial Beta', 'PharmaLab', 'Research on diabetes medication', 'Endocrinology', true),
    ('Trial Gamma', 'BioResearch Ltd', 'Cancer treatment trial', 'Oncology', false);

-- Get trial IDs for visit types
DO $$
DECLARE
    trial_alpha_id uuid;
    trial_beta_id uuid;
    trial_gamma_id uuid;
BEGIN
    SELECT id INTO trial_alpha_id FROM trials WHERE name = 'Trial Alpha';
    SELECT id INTO trial_beta_id FROM trials WHERE name = 'Trial Beta';
    SELECT id INTO trial_gamma_id FROM trials WHERE name = 'Trial Gamma';
    
    -- Insert visit types for Trial Alpha
    INSERT INTO visit_types (trial_id, name, order_number) VALUES
        (trial_alpha_id, 'Screening', 1),
        (trial_alpha_id, 'Baseline', 2),
        (trial_alpha_id, 'Week 4', 3),
        (trial_alpha_id, 'Week 8', 4),
        (trial_alpha_id, 'Final Visit', 5);
    
    -- Insert visit types for Trial Beta
    INSERT INTO visit_types (trial_id, name, order_number) VALUES
        (trial_beta_id, 'Screening', 1),
        (trial_beta_id, 'Baseline', 2),
        (trial_beta_id, 'Month 1', 3),
        (trial_beta_id, 'Month 3', 4),
        (trial_beta_id, 'Month 6', 5),
        (trial_beta_id, 'Final Visit', 6);
        
    -- Insert visit types for Trial Gamma
    INSERT INTO visit_types (trial_id, name, order_number) VALUES
        (trial_gamma_id, 'Screening', 1),
        (trial_gamma_id, 'Baseline', 2),
        (trial_gamma_id, 'Week 2', 3),
        (trial_gamma_id, 'Week 6', 4),
        (trial_gamma_id, 'Week 12', 5),
        (trial_gamma_id, 'Final Visit', 6);
END $$;

-- Seed some test patients
INSERT INTO patients (code, first_name, first_surname, status) VALUES
    ('P001', 'Test', 'Patient', 'active'),
    ('P002', 'Sample', 'Subject', 'active'),
    ('P003', 'Demo', 'User', 'inactive');

-- Seed trial services for financial tracking
DO $$
DECLARE
    trial_alpha_id uuid;
    trial_beta_id uuid;
    service_alpha_id uuid;
    service_beta_id uuid;
BEGIN
    SELECT id INTO trial_alpha_id FROM trials WHERE name = 'Trial Alpha';
    SELECT id INTO trial_beta_id FROM trials WHERE name = 'Trial Beta';
    
    -- Insert trial services
    INSERT INTO trial_services (trial_id, name, amount, currency) VALUES
        (trial_alpha_id, 'Patient Travel Reimbursement', 5000.00, 'EUR'),
        (trial_alpha_id, 'Medical Procedures', 15000.00, 'EUR'),
        (trial_beta_id, 'Patient Compensation', 3000.00, 'EUR'),
        (trial_beta_id, 'Laboratory Tests', 8000.00, 'EUR');
    
    -- Get service IDs for allocations
    SELECT id INTO service_alpha_id FROM trial_services WHERE trial_id = trial_alpha_id AND name = 'Patient Travel Reimbursement';
    SELECT id INTO service_beta_id FROM trial_services WHERE trial_id = trial_beta_id AND name = 'Patient Compensation';
    
    -- Insert service allocations
    INSERT INTO service_allocations (trial_service_id, name, amount, currency) VALUES
        (service_alpha_id, 'Transport Costs', 2000.00, 'EUR'),
        (service_alpha_id, 'Accommodation', 2000.00, 'EUR'),
        (service_alpha_id, 'Meals', 1000.00, 'EUR'),
        (service_beta_id, 'Visit Compensation', 2000.00, 'EUR'),
        (service_beta_id, 'Time Compensation', 1000.00, 'EUR');
END $$;