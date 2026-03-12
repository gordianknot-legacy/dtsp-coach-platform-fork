-- =============================================================================
-- DTSP Coach Platform — Seed Data (mini-set)
-- =============================================================================
-- Run AFTER supabase/seed.ts has created auth users.
-- Uses the same pre-defined UUIDs for profile references.
-- =============================================================================

-- Clean existing seed data (reverse dependency order)
DELETE FROM vba_student_results;
DELETE FROM vba_sessions;
DELETE FROM cm_commitments;
DELETE FROM escalations;
DELETE FROM movement_plans;
DELETE FROM teacher_ryg;
DELETE FROM reschedules;
DELETE FROM action_steps;
DELETE FROM session_notes;
DELETE FROM sessions;
DELETE FROM assignments;
DELETE FROM teachers;
DELETE FROM session_templates;
DELETE FROM program_standards;
DELETE FROM profiles;
DELETE FROM org_units;

-- =============================================================================
-- ORG HIERARCHY
-- State → District → Cohort
-- =============================================================================

INSERT INTO org_units (id, name, type, parent_id) VALUES
  -- State
  ('a0000000-0000-0000-0000-000000000001', 'Uttar Pradesh', 'state', NULL),
  -- Districts
  ('a0000000-0000-0000-0000-000000000010', 'Lucknow', 'district', 'a0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000011', 'Prayagraj', 'district', 'a0000000-0000-0000-0000-000000000001'),
  -- Cohorts
  ('c0000000-0000-0000-0000-000000000001', 'Lucknow Cohort A', 'cohort', 'a0000000-0000-0000-0000-000000000010'),
  ('c0000000-0000-0000-0000-000000000002', 'Lucknow Cohort B', 'cohort', 'a0000000-0000-0000-0000-000000000010'),
  ('c0000000-0000-0000-0000-000000000003', 'Prayagraj Cohort A', 'cohort', 'a0000000-0000-0000-0000-000000000011');

-- =============================================================================
-- PROFILES (must match auth.users created by seed.ts)
-- =============================================================================

INSERT INTO profiles (id, role, cohort_id, name, phone) VALUES
  -- Admin
  ('b0000000-0000-0000-0000-000000000001', 'admin', 'c0000000-0000-0000-0000-000000000001', 'Aarav Sharma', '+919876500001'),
  -- Observer
  ('b0000000-0000-0000-0000-000000000002', 'observer', NULL, 'Neha Gupta', '+919876500002'),
  -- CMs
  ('b0000000-0000-0000-0000-000000000010', 'cm', 'c0000000-0000-0000-0000-000000000001', 'Priya Singh', '+919876500010'),
  ('b0000000-0000-0000-0000-000000000011', 'cm', 'c0000000-0000-0000-0000-000000000003', 'Ravi Verma', '+919876500011'),
  -- Coaches (Lucknow Cohort A)
  ('b0000000-0000-0000-0000-000000000101', 'coach', 'c0000000-0000-0000-0000-000000000001', 'Sunita Devi', '+919876500101'),
  ('b0000000-0000-0000-0000-000000000102', 'coach', 'c0000000-0000-0000-0000-000000000001', 'Manoj Kumar', '+919876500102'),
  -- Coach (Lucknow Cohort B)
  ('b0000000-0000-0000-0000-000000000103', 'coach', 'c0000000-0000-0000-0000-000000000002', 'Kavita Yadav', '+919876500103'),
  -- Coaches (Prayagraj Cohort A)
  ('b0000000-0000-0000-0000-000000000104', 'coach', 'c0000000-0000-0000-0000-000000000003', 'Deepak Tiwari', '+919876500104'),
  ('b0000000-0000-0000-0000-000000000105', 'coach', 'c0000000-0000-0000-0000-000000000003', 'Anjali Mishra', '+919876500105');

-- =============================================================================
-- PROGRAM STANDARDS (per cohort)
-- =============================================================================

INSERT INTO program_standards (cohort_id, key, value) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'reschedule_escalation_threshold', '3'),
  ('c0000000-0000-0000-0000-000000000001', 'sessions_per_teacher_per_month', '2'),
  ('c0000000-0000-0000-0000-000000000001', 'vba_frequency_weeks', '6'),
  ('c0000000-0000-0000-0000-000000000002', 'reschedule_escalation_threshold', '3'),
  ('c0000000-0000-0000-0000-000000000002', 'sessions_per_teacher_per_month', '2'),
  ('c0000000-0000-0000-0000-000000000003', 'reschedule_escalation_threshold', '3'),
  ('c0000000-0000-0000-0000-000000000003', 'sessions_per_teacher_per_month', '2');

-- =============================================================================
-- SESSION TEMPLATES (per cohort)
-- =============================================================================

INSERT INTO session_templates (id, cohort_id, focus_categories, required_fields, vba_checklist, rubric_json) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001',
    '["Literacy", "Numeracy", "Classroom Management", "Relationship Building"]',
    '["what_discussed", "focus_tag"]',
    '[{"id":"vc1","label":"Student seating arranged","order":1},{"id":"vc2","label":"Materials ready","order":2},{"id":"vc3","label":"Assessment sheets distributed","order":3}]',
    '[{"id":"r1","label":"Lesson Preparation","scale_min":1,"scale_max":4,"anchors":{"1":"No preparation","2":"Partial","3":"Adequate","4":"Exemplary"},"order":1},{"id":"r2","label":"Student Engagement","scale_min":1,"scale_max":4,"anchors":{"1":"Passive","2":"Some participation","3":"Active","4":"Highly engaged"},"order":2}]'
  ),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002',
    '["Literacy", "Numeracy", "Classroom Management"]',
    '["what_discussed", "focus_tag"]',
    '[]', '[]'
  ),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003',
    '["Literacy", "Numeracy", "Relationship Building", "Off-script"]',
    '["what_discussed", "focus_tag"]',
    '[{"id":"vc1","label":"Student seating arranged","order":1},{"id":"vc2","label":"Materials ready","order":2}]',
    '[{"id":"r1","label":"Lesson Preparation","scale_min":1,"scale_max":4,"anchors":{"1":"No preparation","2":"Partial","3":"Adequate","4":"Exemplary"},"order":1}]'
  );

-- =============================================================================
-- TEACHERS (15 total, spread across cohorts)
-- =============================================================================

INSERT INTO teachers (id, name, phone, school_name, udise_code, block_tag, designation, hm_name, hm_phone, cohort_id, status) VALUES
  -- Lucknow Cohort A (6 teachers)
  ('e0000000-0000-0000-0000-000000000001', 'Rekha Maurya',     '+919800100001', 'PS Amausi',              '09220100101', 'Sarojini Nagar', 'Assistant Teacher', 'Ramesh Pal',      '+919800200001', 'c0000000-0000-0000-0000-000000000001', 'active'),
  ('e0000000-0000-0000-0000-000000000002', 'Poonam Yadav',     '+919800100002', 'PS Gudamba',             '09220100102', 'Sarojini Nagar', 'Assistant Teacher', 'Suman Gupta',     '+919800200002', 'c0000000-0000-0000-0000-000000000001', 'active'),
  ('e0000000-0000-0000-0000-000000000003', 'Vinod Kushwaha',   '+919800100003', 'PS Chinhat',             '09220100103', 'Chinhat',         'Assistant Teacher', 'Dinesh Singh',    '+919800200003', 'c0000000-0000-0000-0000-000000000001', 'active'),
  ('e0000000-0000-0000-0000-000000000004', 'Meena Tripathi',   '+919800100004', 'PS Kakori',              '09220100104', 'Kakori',         'Assistant Teacher', 'Geeta Devi',      '+919800200004', 'c0000000-0000-0000-0000-000000000001', 'active'),
  ('e0000000-0000-0000-0000-000000000005', 'Anil Verma',       '+919800100005', 'PS Mohanlalganj',        '09220100105', 'Mohanlalganj',   'Assistant Teacher', 'Renu Singh',      '+919800200005', 'c0000000-0000-0000-0000-000000000001', 'active'),
  ('e0000000-0000-0000-0000-000000000006', 'Savitri Devi',     '+919800100006', 'PS Itaunja',             '09220100106', 'Itaunja',        'Assistant Teacher', 'Pradeep Mishra',  '+919800200006', 'c0000000-0000-0000-0000-000000000001', 'active'),
  -- Lucknow Cohort B (4 teachers)
  ('e0000000-0000-0000-0000-000000000007', 'Raj Kumar Singh',  '+919800100007', 'PS Malihabad',           '09220100201', 'Malihabad',      'Assistant Teacher', 'Shanti Devi',     '+919800200007', 'c0000000-0000-0000-0000-000000000002', 'active'),
  ('e0000000-0000-0000-0000-000000000008', 'Geeta Pandey',     '+919800100008', 'PS Bakshi Ka Talab',     '09220100202', 'BKT',            'Assistant Teacher', 'Arun Kumar',      '+919800200008', 'c0000000-0000-0000-0000-000000000002', 'active'),
  ('e0000000-0000-0000-0000-000000000009', 'Shiv Prasad',      '+919800100009', 'PS Gosainganj',          '09220100203', 'Gosainganj',     'Assistant Teacher', 'Maya Rani',       '+919800200009', 'c0000000-0000-0000-0000-000000000002', 'active'),
  ('e0000000-0000-0000-0000-000000000010', 'Pushpa Rawat',     '+919800100010', 'PS Nagram',              '09220100204', 'Nagram',         'Assistant Teacher', 'Hari Om',         '+919800200010', 'c0000000-0000-0000-0000-000000000002', 'active'),
  -- Prayagraj Cohort A (5 teachers)
  ('e0000000-0000-0000-0000-000000000011', 'Ramesh Chandra',   '+919800100011', 'PS Phulpur',             '09300100301', 'Phulpur',        'Assistant Teacher', 'Kamla Devi',      '+919800200011', 'c0000000-0000-0000-0000-000000000003', 'active'),
  ('e0000000-0000-0000-0000-000000000012', 'Asha Kumari',      '+919800100012', 'PS Soraon',              '09300100302', 'Soraon',         'Assistant Teacher', 'Vijay Shankar',   '+919800200012', 'c0000000-0000-0000-0000-000000000003', 'active'),
  ('e0000000-0000-0000-0000-000000000013', 'Bhagwan Das',      '+919800100013', 'PS Handia',              '09300100303', 'Handia',         'Assistant Teacher', 'Sundar Lal',      '+919800200013', 'c0000000-0000-0000-0000-000000000003', 'active'),
  ('e0000000-0000-0000-0000-000000000014', 'Sushila Sharma',   '+919800100014', 'PS Meja',                '09300100304', 'Meja',           'Assistant Teacher', 'Brijesh Kumar',   '+919800200014', 'c0000000-0000-0000-0000-000000000003', 'active'),
  ('e0000000-0000-0000-0000-000000000015', 'Om Prakash',       '+919800100015', 'PS Karchhana',           '09300100305', 'Karchhana',      'Assistant Teacher', 'Saroj Bala',      '+919800200015', 'c0000000-0000-0000-0000-000000000003', 'inactive');

-- =============================================================================
-- ASSIGNMENTS (coach → teacher)
-- =============================================================================

INSERT INTO assignments (teacher_id, coach_id, is_active) VALUES
  -- Sunita Devi (coach, Lucknow A) → 3 teachers
  ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000101', true),
  ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000101', true),
  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000101', true),
  -- Manoj Kumar (coach, Lucknow A) → 3 teachers
  ('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000102', true),
  ('e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000102', true),
  ('e0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000102', true),
  -- Kavita Yadav (coach, Lucknow B) → 4 teachers
  ('e0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000103', true),
  ('e0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000103', true),
  ('e0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000103', true),
  ('e0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000103', true),
  -- Deepak Tiwari (coach, Prayagraj A) → 3 teachers
  ('e0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000104', true),
  ('e0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000104', true),
  ('e0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000104', true),
  -- Anjali Mishra (coach, Prayagraj A) → 2 teachers (Om Prakash inactive, still assigned)
  ('e0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000105', true),
  ('e0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000105', true);

-- =============================================================================
-- SESSIONS (spread of statuses, last 4 weeks + upcoming)
-- Dates relative to 2026-03-12
-- =============================================================================

INSERT INTO sessions (id, teacher_id, coach_id, session_type, scheduled_at, status, focus_tag, channel, meet_link, duration_mins, confirmation_status, summary_sent_at, tech_issue_flag) VALUES
  -- === Sunita Devi's sessions ===
  -- Completed sessions (past weeks)
  ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000101', 'coaching_call', '2026-02-16 10:00+05:30', 'completed', 'Literacy', 'google_meet', 'https://meet.google.com/abc-defg-hij', 35, 'confirmed', '2026-02-16 11:00+05:30', false),
  ('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000101', 'coaching_call', '2026-02-18 11:00+05:30', 'completed', 'Numeracy', 'google_meet', 'https://meet.google.com/abc-defg-hik', 40, 'confirmed', '2026-02-18 12:00+05:30', false),
  ('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000101', 'coaching_call', '2026-02-23 10:00+05:30', 'completed', 'Classroom Management', 'phone', NULL, 25, 'confirmed', NULL, false),
  ('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000101', 'coaching_call', '2026-03-02 10:00+05:30', 'completed', 'Literacy', 'google_meet', 'https://meet.google.com/abc-defg-hil', 30, 'confirmed', '2026-03-02 11:00+05:30', false),
  -- No-show
  ('f0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000101', 'coaching_call', '2026-03-04 11:00+05:30', 'no_show', 'Numeracy', 'google_meet', 'https://meet.google.com/abc-defg-him', NULL, 'no_response', NULL, false),
  -- Rescheduled
  ('f0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000101', 'coaching_call', '2026-03-09 10:00+05:30', 'rescheduled', 'Literacy', 'google_meet', NULL, NULL, 'pending', NULL, false),
  -- Scheduled upcoming
  ('f0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000101', 'coaching_call', '2026-03-16 10:00+05:30', 'scheduled', 'Numeracy', 'google_meet', 'https://meet.google.com/abc-defg-hin', NULL, 'pending', NULL, false),
  ('f0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000101', 'coaching_call', '2026-03-18 11:00+05:30', 'scheduled', 'Literacy', 'google_meet', 'https://meet.google.com/abc-defg-hio', NULL, 'confirmed', NULL, false),
  -- Confirmed for today-ish
  ('f0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000101', 'coaching_call', '2026-03-13 10:00+05:30', 'confirmed', 'Classroom Management', 'google_meet', 'https://meet.google.com/abc-defg-hip', NULL, 'confirmed', NULL, false),

  -- === Manoj Kumar's sessions ===
  ('f0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000102', 'coaching_call', '2026-02-17 09:00+05:30', 'completed', 'Literacy', 'google_meet', 'https://meet.google.com/mnk-aaaa-001', 45, 'confirmed', '2026-02-17 10:00+05:30', false),
  ('f0000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000102', 'coaching_call', '2026-02-19 14:00+05:30', 'completed', 'Numeracy', 'phone', NULL, 30, 'confirmed', NULL, false),
  ('f0000000-0000-0000-0000-000000000012', 'e0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000102', 'coaching_call', '2026-03-03 09:00+05:30', 'completed', 'Relationship Building', 'google_meet', 'https://meet.google.com/mnk-aaaa-002', 40, 'confirmed', '2026-03-03 10:00+05:30', false),
  ('f0000000-0000-0000-0000-000000000013', 'e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000102', 'coaching_call', '2026-03-10 09:00+05:30', 'in_progress', 'Literacy', 'google_meet', 'https://meet.google.com/mnk-aaaa-003', NULL, 'confirmed', NULL, false),
  -- Tech issue session
  ('f0000000-0000-0000-0000-000000000014', 'e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000102', 'coaching_call', '2026-03-05 14:00+05:30', 'cancelled', 'Numeracy', 'google_meet', 'https://meet.google.com/mnk-aaaa-004', NULL, 'confirmed', NULL, true),
  ('f0000000-0000-0000-0000-000000000015', 'e0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000102', 'coaching_call', '2026-03-17 09:00+05:30', 'scheduled', 'Literacy', 'google_meet', 'https://meet.google.com/mnk-aaaa-005', NULL, 'pending', NULL, false),

  -- === Kavita Yadav's sessions ===
  ('f0000000-0000-0000-0000-000000000016', 'e0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000103', 'coaching_call', '2026-02-20 10:00+05:30', 'completed', 'Literacy', 'google_meet', 'https://meet.google.com/kvy-bbbb-001', 35, 'confirmed', '2026-02-20 11:00+05:30', false),
  ('f0000000-0000-0000-0000-000000000017', 'e0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000103', 'coaching_call', '2026-03-06 11:00+05:30', 'completed', 'Numeracy', 'phone', NULL, 25, 'confirmed', NULL, false),
  ('f0000000-0000-0000-0000-000000000018', 'e0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000103', 'coaching_call', '2026-03-11 10:00+05:30', 'no_show', 'Literacy', 'google_meet', 'https://meet.google.com/kvy-bbbb-002', NULL, 'no_response', NULL, false),
  ('f0000000-0000-0000-0000-000000000019', 'e0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000103', 'coaching_call', '2026-03-14 10:00+05:30', 'scheduled', 'Classroom Management', 'google_meet', 'https://meet.google.com/kvy-bbbb-003', NULL, 'pending', NULL, false),

  -- === Deepak Tiwari's sessions ===
  ('f0000000-0000-0000-0000-000000000020', 'e0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000104', 'coaching_call', '2026-02-21 09:00+05:30', 'completed', 'Numeracy', 'google_meet', 'https://meet.google.com/dkt-cccc-001', 40, 'confirmed', '2026-02-21 10:00+05:30', false),
  ('f0000000-0000-0000-0000-000000000021', 'e0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000104', 'coaching_call', '2026-03-07 10:00+05:30', 'completed', 'Literacy', 'in_person', NULL, 50, 'confirmed', '2026-03-07 11:00+05:30', false),
  ('f0000000-0000-0000-0000-000000000022', 'e0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000104', 'coaching_call', '2026-03-12 09:00+05:30', 'confirmed', 'Numeracy', 'google_meet', 'https://meet.google.com/dkt-cccc-002', NULL, 'confirmed', NULL, false),
  ('f0000000-0000-0000-0000-000000000023', 'e0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000104', 'coaching_call', '2026-03-19 09:00+05:30', 'scheduled', 'Literacy', 'google_meet', 'https://meet.google.com/dkt-cccc-003', NULL, 'pending', NULL, false),

  -- === Anjali Mishra's sessions ===
  ('f0000000-0000-0000-0000-000000000024', 'e0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000105', 'coaching_call', '2026-02-24 11:00+05:30', 'completed', 'Relationship Building', 'google_meet', 'https://meet.google.com/anm-dddd-001', 35, 'confirmed', '2026-02-24 12:00+05:30', false),
  ('f0000000-0000-0000-0000-000000000025', 'e0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000105', 'coaching_call', '2026-03-08 11:00+05:30', 'completed', 'Literacy', 'phone', NULL, 30, 'confirmed', NULL, false),
  ('f0000000-0000-0000-0000-000000000026', 'e0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000105', 'coaching_call', '2026-03-01 11:00+05:30', 'rescheduled', 'Numeracy', 'google_meet', NULL, NULL, 'pending', NULL, false),
  ('f0000000-0000-0000-0000-000000000027', 'e0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000105', 'coaching_call', '2026-03-15 11:00+05:30', 'scheduled', 'Off-script', 'google_meet', 'https://meet.google.com/anm-dddd-002', NULL, 'pending', NULL, false);

-- =============================================================================
-- SESSION NOTES (for completed sessions)
-- =============================================================================

INSERT INTO session_notes (id, session_id, what_discussed, what_decided, teacher_practice_markers, qualitative_comments, collateral_refs, ai_draft_used, ai_draft_text) VALUES
  ('70000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001',
    'Discussed phonics teaching approach for Class 2. Rekha is using letter cards but students struggle with blending.',
    'Will try syllable-based approach next week. Rekha to prepare new cards.',
    '{"lesson_prep": 3, "student_engagement": 2}',
    'Rekha is motivated but needs more structured materials. Good rapport with students.',
    '[{"label":"Phonics guide PDF","url":"https://drive.google.com/example1"}]',
    true, 'रेखा जी के साथ कक्षा 2 के लिए फोनिक्स शिक्षण पर चर्चा हुई। अक्षर कार्ड का उपयोग हो रहा है लेकिन छात्रों को मिलाने में कठिनाई हो रही है।'),

  ('70000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002',
    'Reviewed number sense activities for Class 1. Poonam using concrete materials effectively.',
    'Continue with current approach. Add peer learning component.',
    '{"lesson_prep": 3, "student_engagement": 3}',
    'Strong progress since last session. Students are more confident with single-digit operations.',
    '[]', false, NULL),

  ('70000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000003',
    'Discussed classroom management challenges. Vinod has 45 students in one room.',
    'Try group rotation strategy. Will share seating arrangement ideas via WhatsApp.',
    '{"lesson_prep": 2, "student_engagement": 2}',
    'Difficult conditions but Vinod is trying. Need to follow up on group strategy.',
    '[]', false, NULL),

  ('70000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000004',
    'Follow-up on syllable approach. Rekha reports improvement in blending.',
    'Scale to full class next week. Prepare assessment for end of month.',
    '{"lesson_prep": 3, "student_engagement": 3}',
    'Good progress. Syllable cards working well. Rekha gaining confidence.',
    '[]', true, 'रेखा जी ने बताया कि शब्दांश दृष्टिकोण से छात्रों की मिश्रण क्षमता में सुधार हुआ है।'),

  ('70000000-0000-0000-0000-000000000010', 'f0000000-0000-0000-0000-000000000010',
    'First session with Meena. Discussed her current literacy teaching methods.',
    'Meena to observe a model lesson video. Discuss observations next call.',
    '{"lesson_prep": 2, "student_engagement": 2}',
    'Meena is experienced but using traditional rote methods. Open to new ideas.',
    '[]', false, NULL),

  ('70000000-0000-0000-0000-000000000011', 'f0000000-0000-0000-0000-000000000011',
    'Anil struggling with number line concept for Class 3. Discussed visual aids.',
    'Will send number line printables via WhatsApp. Practice with small groups first.',
    '{"lesson_prep": 2, "student_engagement": 2}',
    'Anil needs more support. Consider pairing with a stronger teacher for peer learning.',
    '[]', false, NULL),

  ('70000000-0000-0000-0000-000000000012', 'f0000000-0000-0000-0000-000000000012',
    'Savitri implementing relationship building strategies. Morning circle time going well.',
    'Continue morning circles. Add student-of-the-week recognition.',
    '{"lesson_prep": 3, "student_engagement": 4}',
    'Excellent engagement. Savitri is a natural at building classroom community.',
    '[]', false, NULL),

  ('70000000-0000-0000-0000-000000000016', 'f0000000-0000-0000-0000-000000000016',
    'Raj Kumar reviewed story reading techniques. Using local folk tales.',
    'Good approach with local context. Add comprehension questions after reading.',
    '{"lesson_prep": 3, "student_engagement": 3}',
    'Students love the folk tales. Need to formalize the comprehension check.',
    '[]', false, NULL),

  ('70000000-0000-0000-0000-000000000017', 'f0000000-0000-0000-0000-000000000017',
    'Geeta working on mental math strategies for Class 2.',
    'Start with number bonds to 10. Daily 5-minute mental math warmup.',
    '{"lesson_prep": 2, "student_engagement": 3}',
    'Geeta is enthusiastic but needs structured approach to mental math.',
    '[]', false, NULL),

  ('70000000-0000-0000-0000-000000000020', 'f0000000-0000-0000-0000-000000000020',
    'Ramesh exploring hands-on numeracy activities. Using stones and sticks.',
    'Good use of local materials. Create a math corner in classroom.',
    '{"lesson_prep": 3, "student_engagement": 3}',
    'Resourceful teacher. Math corner will help sustain engagement.',
    '[]', false, NULL),

  ('70000000-0000-0000-0000-000000000021', 'f0000000-0000-0000-0000-000000000021',
    'In-person visit. Observed Asha teaching reading to Class 1. Good use of big books.',
    'Continue big book approach. Add paired reading activity.',
    '{"lesson_prep": 4, "student_engagement": 3}',
    'Strong classroom setup. Asha has excellent materials. Model teacher potential.',
    '[]', false, NULL),

  ('70000000-0000-0000-0000-000000000024', 'f0000000-0000-0000-0000-000000000024',
    'Sushila discussed strategies for engaging shy students. Role play activities.',
    'Try buddy system for quieter students. Follow up on implementation.',
    '{"lesson_prep": 3, "student_engagement": 2}',
    'Sushila understands the issue. Needs practical strategies for large class sizes.',
    '[]', false, NULL),

  ('70000000-0000-0000-0000-000000000025', 'f0000000-0000-0000-0000-000000000025',
    'Follow up on buddy system. Sushila reports shy students participating more.',
    'Great progress. Document the approach for sharing with other teachers.',
    '{"lesson_prep": 3, "student_engagement": 3}',
    'Buddy system working. Sushila could present at next cluster meeting.',
    '[]', false, NULL);

-- =============================================================================
-- ACTION STEPS
-- =============================================================================

INSERT INTO action_steps (id, session_id, teacher_id, description, due_date, status) VALUES
  -- From Sunita's sessions
  ('80000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Prepare syllable cards for Class 2 phonics', '2026-02-23', 'completed'),
  ('80000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Practice blending with 5 students daily', '2026-02-28', 'completed'),
  ('80000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'Try group rotation with 3 groups of 15 students', '2026-03-02', 'open'),
  ('80000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001', 'Prepare month-end blending assessment', '2026-03-15', 'open'),
  ('80000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001', 'Scale syllable approach to full class', '2026-03-09', 'completed'),
  -- From Manoj's sessions
  ('80000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000004', 'Watch model lesson video on phonics', '2026-02-24', 'completed'),
  ('80000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000005', 'Print and laminate number line for classroom wall', '2026-03-01', 'open'),
  ('80000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000012', 'e0000000-0000-0000-0000-000000000006', 'Start student-of-the-week recognition board', '2026-03-10', 'open'),
  -- From Kavita's sessions
  ('80000000-0000-0000-0000-000000000009', 'f0000000-0000-0000-0000-000000000016', 'e0000000-0000-0000-0000-000000000007', 'Add 3 comprehension questions after each story reading', '2026-02-27', 'completed'),
  ('80000000-0000-0000-0000-000000000010', 'f0000000-0000-0000-0000-000000000017', 'e0000000-0000-0000-0000-000000000008', 'Implement daily 5-minute mental math warmup', '2026-03-13', 'open'),
  -- From Deepak's sessions
  ('80000000-0000-0000-0000-000000000011', 'f0000000-0000-0000-0000-000000000020', 'e0000000-0000-0000-0000-000000000011', 'Set up math corner with local materials', '2026-02-28', 'completed'),
  ('80000000-0000-0000-0000-000000000012', 'f0000000-0000-0000-0000-000000000021', 'e0000000-0000-0000-0000-000000000012', 'Try paired reading in Class 1 for 2 weeks', '2026-03-21', 'open'),
  -- From Anjali's sessions
  ('80000000-0000-0000-0000-000000000013', 'f0000000-0000-0000-0000-000000000024', 'e0000000-0000-0000-0000-000000000014', 'Implement buddy system for shy students', '2026-03-03', 'completed'),
  ('80000000-0000-0000-0000-000000000014', 'f0000000-0000-0000-0000-000000000025', 'e0000000-0000-0000-0000-000000000014', 'Document buddy system approach for cluster meeting', '2026-03-20', 'open');

-- =============================================================================
-- RESCHEDULES (triggers escalation check)
-- Disable trigger temporarily to avoid auto-escalation during seed
-- =============================================================================

ALTER TABLE reschedules DISABLE TRIGGER reschedule_escalation_trigger;

INSERT INTO reschedules (id, session_id, reason_category, new_window, counter) VALUES
  ('90000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000006', 'teacher_unavailable', '2026-03-13 10:00+05:30', 1),
  ('90000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000026', 'school_event', '2026-03-10 11:00+05:30', 1),
  -- Om Prakash rescheduled multiple times (will have an escalation)
  ('90000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000026', 'teacher_unavailable', '2026-03-05 11:00+05:30', 2),
  ('90000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000026', 'teacher_unavailable', '2026-03-08 11:00+05:30', 3);

ALTER TABLE reschedules ENABLE TRIGGER reschedule_escalation_trigger;

-- =============================================================================
-- TEACHER RYG STATUS (latest per teacher)
-- =============================================================================

INSERT INTO teacher_ryg (id, teacher_id, status, set_by, set_at, prior_status, dimensions_json) VALUES
  -- Lucknow Cohort A
  ('aa000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'G', 'b0000000-0000-0000-0000-000000000101', '2026-03-02 11:00+05:30', 'Y', '{"lesson_prep": 3, "student_engagement": 3}'),
  ('aa000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'Y', 'b0000000-0000-0000-0000-000000000101', '2026-02-18 12:00+05:30', NULL, '{"lesson_prep": 3, "student_engagement": 2}'),
  ('aa000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'R', 'b0000000-0000-0000-0000-000000000101', '2026-02-23 11:00+05:30', NULL, '{"lesson_prep": 2, "student_engagement": 2}'),
  ('aa000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004', 'Y', 'b0000000-0000-0000-0000-000000000102', '2026-03-03 10:00+05:30', 'R', '{"lesson_prep": 2, "student_engagement": 2}'),
  ('aa000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000005', 'R', 'b0000000-0000-0000-0000-000000000102', '2026-02-19 15:00+05:30', NULL, '{"lesson_prep": 2, "student_engagement": 2}'),
  ('aa000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000006', 'G', 'b0000000-0000-0000-0000-000000000102', '2026-03-03 10:30+05:30', 'Y', '{"lesson_prep": 3, "student_engagement": 4}'),
  -- Lucknow Cohort B
  ('aa000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000007', 'G', 'b0000000-0000-0000-0000-000000000103', '2026-02-20 11:30+05:30', NULL, '{"lesson_prep": 3, "student_engagement": 3}'),
  ('aa000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000008', 'Y', 'b0000000-0000-0000-0000-000000000103', '2026-03-06 12:00+05:30', NULL, '{"lesson_prep": 2, "student_engagement": 3}'),
  ('aa000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000009', 'R', 'b0000000-0000-0000-0000-000000000103', '2026-03-11 11:00+05:30', NULL, '{}'),
  ('aa000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000010', 'Y', 'b0000000-0000-0000-0000-000000000103', '2026-02-20 11:00+05:30', NULL, '{}'),
  -- Prayagraj Cohort A
  ('aa000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000011', 'G', 'b0000000-0000-0000-0000-000000000104', '2026-03-07 10:30+05:30', 'Y', '{"lesson_prep": 3, "student_engagement": 3}'),
  ('aa000000-0000-0000-0000-000000000012', 'e0000000-0000-0000-0000-000000000012', 'G', 'b0000000-0000-0000-0000-000000000104', '2026-03-07 11:30+05:30', NULL, '{"lesson_prep": 4, "student_engagement": 3}'),
  ('aa000000-0000-0000-0000-000000000013', 'e0000000-0000-0000-0000-000000000013', 'Y', 'b0000000-0000-0000-0000-000000000104', '2026-02-21 10:00+05:30', NULL, '{}'),
  ('aa000000-0000-0000-0000-000000000014', 'e0000000-0000-0000-0000-000000000014', 'G', 'b0000000-0000-0000-0000-000000000105', '2026-03-08 12:00+05:30', 'Y', '{"lesson_prep": 3, "student_engagement": 3}'),
  ('aa000000-0000-0000-0000-000000000015', 'e0000000-0000-0000-0000-000000000015', 'R', 'b0000000-0000-0000-0000-000000000105', '2026-03-01 12:00+05:30', NULL, '{}');

-- =============================================================================
-- ESCALATIONS (one auto, one manual)
-- =============================================================================

INSERT INTO escalations (id, trigger_type, teacher_id, coach_id, cohort_id, status, resolution_category, resolution_notes, actioned_by, actioned_at) VALUES
  -- Om Prakash: multiple reschedules triggered auto-escalation
  ('ab000000-0000-0000-0000-000000000001', 'reschedule_threshold', 'e0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000105', 'c0000000-0000-0000-0000-000000000003', 'open', NULL, NULL, NULL, NULL),
  -- Shiv Prasad no-show: manual escalation by Kavita
  ('ab000000-0000-0000-0000-000000000002', 'manual', 'e0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000103', 'c0000000-0000-0000-0000-000000000002', 'in_progress', NULL, 'Spoke with HM. Teacher was on leave. Will resume next week.', 'b0000000-0000-0000-0000-000000000010', '2026-03-11 14:00+05:30');

-- =============================================================================
-- CM COMMITMENTS
-- =============================================================================

INSERT INTO cm_commitments (id, cm_id, coach_id, session_date, commitments, spot_check_ratings) VALUES
  ('ac000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000101', '2026-03-05',
    '[{"text":"Review Sunita''s session notes weekly","status":"done"},{"text":"Observe one of Sunita''s calls this month","status":"pending"}]',
    '{"session_quality": 3, "teacher_engagement": 4}'),
  ('ac000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000102', '2026-03-05',
    '[{"text":"Help Manoj with tech issue follow-up","status":"done"},{"text":"Check Anil''s number line progress","status":"pending"}]',
    '{"session_quality": 3, "teacher_engagement": 3}'),
  ('ac000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000104', '2026-03-07',
    '[{"text":"Review Deepak''s in-person visit notes","status":"done"},{"text":"Plan cluster meeting for next month","status":"pending"}]',
    '{"session_quality": 4, "teacher_engagement": 3}');

-- =============================================================================
-- VBA SESSIONS (one completed, one upcoming)
-- =============================================================================

INSERT INTO vba_sessions (id, teacher_id, coach_id, scheduled_at, status, protocol_ratings, checklist_items_done) VALUES
  ('ae000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000101', '2026-02-25 09:00+05:30', 'completed',
    '{"reading_fluency": 3, "comprehension": 2}',
    '["vc1", "vc2", "vc3"]'),
  ('ae000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000104', '2026-03-20 09:00+05:30', 'scheduled',
    '{}', '[]');

-- =============================================================================
-- VBA STUDENT RESULTS (for completed VBA)
-- =============================================================================

INSERT INTO vba_student_results (id, vba_session_id, student_name, student_number, literacy_results, numeracy_results) VALUES
  ('af000000-0000-0000-0000-000000000001', 'ae000000-0000-0000-0000-000000000001', 'Aarti', 1,
    '{"letter_recognition": 18, "word_reading": 8, "sentence_reading": 3, "fluency_wpm": 22}',
    '{"number_recognition": 15, "addition": 7, "subtraction": 4}'),
  ('af000000-0000-0000-0000-000000000002', 'ae000000-0000-0000-0000-000000000001', 'Rohit', 2,
    '{"letter_recognition": 22, "word_reading": 12, "sentence_reading": 6, "fluency_wpm": 35}',
    '{"number_recognition": 20, "addition": 10, "subtraction": 7}'),
  ('af000000-0000-0000-0000-000000000003', 'ae000000-0000-0000-0000-000000000001', 'Priya', 3,
    '{"letter_recognition": 25, "word_reading": 15, "sentence_reading": 8, "fluency_wpm": 42}',
    '{"number_recognition": 22, "addition": 12, "subtraction": 9}'),
  ('af000000-0000-0000-0000-000000000004', 'ae000000-0000-0000-0000-000000000001', 'Sunil', 4,
    '{"letter_recognition": 10, "word_reading": 3, "sentence_reading": 0, "fluency_wpm": 8}',
    '{"number_recognition": 8, "addition": 2, "subtraction": 0}'),
  ('af000000-0000-0000-0000-000000000005', 'ae000000-0000-0000-0000-000000000001', 'Kavita', 5,
    '{"letter_recognition": 20, "word_reading": 10, "sentence_reading": 5, "fluency_wpm": 28}',
    '{"number_recognition": 18, "addition": 9, "subtraction": 6}');

-- =============================================================================
-- MOVEMENT PLANS
-- =============================================================================

INSERT INTO movement_plans (id, teacher_id, cm_id, target_status, target_date, actions) VALUES
  ('ad000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000010', 'Y', '2026-04-15',
    '[{"description":"Coach to do in-person visit","assigned_to":"Sunita Devi","due_date":"2026-03-20"},{"description":"Provide classroom management resources","assigned_to":"Priya Singh","due_date":"2026-03-15"}]'),
  ('ad000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000010', 'Y', '2026-04-30',
    '[{"description":"Weekly phone check-ins","assigned_to":"Manoj Kumar","due_date":"2026-03-30"},{"description":"Pair with Savitri for peer observation","assigned_to":"Manoj Kumar","due_date":"2026-03-25"}]');
