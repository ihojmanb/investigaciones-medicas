-- ===================================================
-- SEED VISIT TYPES FOR EXISTING TRIALS
-- ===================================================

-- Insert mock visit types for each trial
-- These are common visit types in clinical trials

-- Get all existing trials and create standard visit types for each
INSERT INTO visit_types (trial_id, name, order_number)
SELECT 
    t.id as trial_id,
    visit_data.name,
    visit_data.order_number
FROM trials t
CROSS JOIN (
    VALUES 
        ('Baseline', 1),
        ('Week 2', 2), 
        ('Week 4', 3),
        ('Week 8', 4),
        ('Week 12', 5),
        ('End of Study', 6)
) AS visit_data(name, order_number)
WHERE NOT EXISTS (
    -- Only insert if visit doesn't already exist for this trial
    SELECT 1 FROM visit_types vt 
    WHERE vt.trial_id = t.id 
    AND vt.name = visit_data.name
);