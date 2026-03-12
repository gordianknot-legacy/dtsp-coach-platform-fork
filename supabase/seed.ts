/**
 * DTSP Coach Platform — Seed Script
 *
 * Creates auth users via Supabase Admin API, then inserts all seed data
 * via the Supabase JS client (service role bypasses RLS).
 *
 * Usage:
 *   source .env.local && npx tsx supabase/seed.ts
 *
 * Requires env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ============================================================================
// IDs
// ============================================================================

const ORG = {
  UP:           'a0000000-0000-0000-0000-000000000001',
  LUCKNOW:      'a0000000-0000-0000-0000-000000000010',
  PRAYAGRAJ:    'a0000000-0000-0000-0000-000000000011',
  LUCKNOW_A:    'c0000000-0000-0000-0000-000000000001',
  LUCKNOW_B:    'c0000000-0000-0000-0000-000000000002',
  PRAYAGRAJ_A:  'c0000000-0000-0000-0000-000000000003',
}

const USER = {
  AARAV:   'b0000000-0000-0000-0000-000000000001',
  NEHA:    'b0000000-0000-0000-0000-000000000002',
  PRIYA:   'b0000000-0000-0000-0000-000000000010',
  RAVI:    'b0000000-0000-0000-0000-000000000011',
  SUNITA:  'b0000000-0000-0000-0000-000000000101',
  MANOJ:   'b0000000-0000-0000-0000-000000000102',
  KAVITA:  'b0000000-0000-0000-0000-000000000103',
  DEEPAK:  'b0000000-0000-0000-0000-000000000104',
  ANJALI:  'b0000000-0000-0000-0000-000000000105',
}

const T = {
  REKHA:    'e0000000-0000-0000-0000-000000000001',
  POONAM:   'e0000000-0000-0000-0000-000000000002',
  VINOD:    'e0000000-0000-0000-0000-000000000003',
  MEENA:    'e0000000-0000-0000-0000-000000000004',
  ANIL:     'e0000000-0000-0000-0000-000000000005',
  SAVITRI:  'e0000000-0000-0000-0000-000000000006',
  RAJ:      'e0000000-0000-0000-0000-000000000007',
  GEETA:    'e0000000-0000-0000-0000-000000000008',
  SHIV:     'e0000000-0000-0000-0000-000000000009',
  PUSHPA:   'e0000000-0000-0000-0000-000000000010',
  RAMESH:   'e0000000-0000-0000-0000-000000000011',
  ASHA:     'e0000000-0000-0000-0000-000000000012',
  BHAGWAN:  'e0000000-0000-0000-0000-000000000013',
  SUSHILA:  'e0000000-0000-0000-0000-000000000014',
  OM:       'e0000000-0000-0000-0000-000000000015',
}

const SEED_USERS = [
  { id: USER.AARAV,  email: 'aarav.sharma@example.com',   name: 'Aarav Sharma',   role: 'admin' },
  { id: USER.NEHA,   email: 'neha.gupta@example.com',     name: 'Neha Gupta',     role: 'observer' },
  { id: USER.PRIYA,  email: 'priya.singh@example.com',    name: 'Priya Singh',    role: 'cm' },
  { id: USER.RAVI,   email: 'ravi.verma@example.com',     name: 'Ravi Verma',     role: 'cm' },
  { id: USER.SUNITA, email: 'sunita.devi@example.com',    name: 'Sunita Devi',    role: 'coach' },
  { id: USER.MANOJ,  email: 'manoj.kumar@example.com',    name: 'Manoj Kumar',    role: 'coach' },
  { id: USER.KAVITA, email: 'kavita.yadav@example.com',   name: 'Kavita Yadav',   role: 'coach' },
  { id: USER.DEEPAK, email: 'deepak.tiwari@example.com',  name: 'Deepak Tiwari',  role: 'coach' },
  { id: USER.ANJALI, email: 'anjali.mishra@example.com',  name: 'Anjali Mishra',  role: 'coach' },
]

// ============================================================================
// Helpers
// ============================================================================

async function insert(table: string, rows: Record<string, unknown>[]) {
  const { error } = await supabase.from(table).insert(rows)
  if (error) {
    console.error(`  FAILED ${table}: ${error.message}`)
    return false
  }
  console.log(`  ✓ ${table} (${rows.length} rows)`)
  return true
}

// Only delete rows with seed-pattern UUIDs (x0000000-...) to avoid nuking real data
const SEED_UUID_PREFIXES = [
  'a0000000', 'b0000000', 'c0000000', 'd0000000', 'e0000000',
  'f0000000', '70000000', '80000000', '90000000', 'aa000000',
  'ab000000', 'ac000000', 'ad000000', 'ae000000', 'af000000',
]

async function clean(table: string) {
  for (const prefix of SEED_UUID_PREFIXES) {
    // Delete rows where id starts with a seed prefix
    await supabase.from(table).delete().like('id', `${prefix}%`)
  }
  // Also clean assignments (composite PK, no 'id' column) by seed teacher/coach IDs
  if (table === 'assignments') {
    for (const tid of Object.values(T)) {
      await supabase.from('assignments').delete().eq('teacher_id', tid)
    }
  }
  // Clean program_standards (composite PK: cohort_id + key)
  if (table === 'program_standards') {
    for (const cid of [ORG.LUCKNOW_A, ORG.LUCKNOW_B, ORG.PRAYAGRAJ_A]) {
      await supabase.from('program_standards').delete().eq('cohort_id', cid)
    }
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('=== DTSP Seed Script ===\n')

  // Step 1: Clean existing data (reverse dependency order)
  console.log('Step 1: Cleaning existing data...')
  for (const table of [
    'vba_student_results', 'vba_sessions', 'cm_commitments',
    'escalations', 'movement_plans', 'teacher_ryg', 'reschedules',
    'action_steps', 'session_notes', 'sessions', 'assignments',
    'teachers', 'session_templates', 'program_standards', 'profiles', 'org_units',
  ]) {
    await clean(table)
  }

  // Delete seed auth users
  for (const user of SEED_USERS) {
    await supabase.auth.admin.deleteUser(user.id)
  }
  console.log('  Done.\n')

  // Step 2: Create auth users
  console.log('Step 2: Creating auth users...')
  for (const user of SEED_USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      id: user.id,
      email: user.email,
      email_confirm: true,
      user_metadata: { name: user.name, role: user.role },
    })
    if (error) {
      console.error(`  FAILED: ${user.name}: ${error.message}`)
    } else {
      console.log(`  ✓ ${user.name} (${user.role})`)
    }
  }
  console.log()

  // Step 3: Insert seed data
  console.log('Step 3: Inserting seed data...')

  // Org units
  await insert('org_units', [
    { id: ORG.UP, name: 'Uttar Pradesh', type: 'state', parent_id: null },
    { id: ORG.LUCKNOW, name: 'Lucknow', type: 'district', parent_id: ORG.UP },
    { id: ORG.PRAYAGRAJ, name: 'Prayagraj', type: 'district', parent_id: ORG.UP },
    { id: ORG.LUCKNOW_A, name: 'Lucknow Cohort A', type: 'cohort', parent_id: ORG.LUCKNOW },
    { id: ORG.LUCKNOW_B, name: 'Lucknow Cohort B', type: 'cohort', parent_id: ORG.LUCKNOW },
    { id: ORG.PRAYAGRAJ_A, name: 'Prayagraj Cohort A', type: 'cohort', parent_id: ORG.PRAYAGRAJ },
  ])

  // Profiles
  await insert('profiles', [
    { id: USER.AARAV,  role: 'admin',    cohort_id: ORG.LUCKNOW_A, name: 'Aarav Sharma',   phone: '+919876500001' },
    { id: USER.NEHA,   role: 'observer', cohort_id: null,          name: 'Neha Gupta',     phone: '+919876500002' },
    { id: USER.PRIYA,  role: 'cm',       cohort_id: ORG.LUCKNOW_A, name: 'Priya Singh',    phone: '+919876500010' },
    { id: USER.RAVI,   role: 'cm',       cohort_id: ORG.PRAYAGRAJ_A, name: 'Ravi Verma',   phone: '+919876500011' },
    { id: USER.SUNITA, role: 'coach',    cohort_id: ORG.LUCKNOW_A, name: 'Sunita Devi',    phone: '+919876500101' },
    { id: USER.MANOJ,  role: 'coach',    cohort_id: ORG.LUCKNOW_A, name: 'Manoj Kumar',    phone: '+919876500102' },
    { id: USER.KAVITA, role: 'coach',    cohort_id: ORG.LUCKNOW_B, name: 'Kavita Yadav',   phone: '+919876500103' },
    { id: USER.DEEPAK, role: 'coach',    cohort_id: ORG.PRAYAGRAJ_A, name: 'Deepak Tiwari', phone: '+919876500104' },
    { id: USER.ANJALI, role: 'coach',    cohort_id: ORG.PRAYAGRAJ_A, name: 'Anjali Mishra', phone: '+919876500105' },
  ])

  // Program standards
  await insert('program_standards', [
    { cohort_id: ORG.LUCKNOW_A, key: 'reschedule_escalation_threshold', value: '3' },
    { cohort_id: ORG.LUCKNOW_A, key: 'sessions_per_teacher_per_month', value: '2' },
    { cohort_id: ORG.LUCKNOW_A, key: 'vba_frequency_weeks', value: '6' },
    { cohort_id: ORG.LUCKNOW_B, key: 'reschedule_escalation_threshold', value: '3' },
    { cohort_id: ORG.LUCKNOW_B, key: 'sessions_per_teacher_per_month', value: '2' },
    { cohort_id: ORG.PRAYAGRAJ_A, key: 'reschedule_escalation_threshold', value: '3' },
    { cohort_id: ORG.PRAYAGRAJ_A, key: 'sessions_per_teacher_per_month', value: '2' },
  ])

  // Session templates
  await insert('session_templates', [
    {
      id: 'd0000000-0000-0000-0000-000000000001', cohort_id: ORG.LUCKNOW_A,
      focus_categories: ['Literacy', 'Numeracy', 'Classroom Management', 'Relationship Building'],
      required_fields: ['what_discussed', 'focus_tag'],
      vba_checklist: [{ id: 'vc1', label: 'Student seating arranged', order: 1 }, { id: 'vc2', label: 'Materials ready', order: 2 }, { id: 'vc3', label: 'Assessment sheets distributed', order: 3 }],
      rubric_json: [{ id: 'r1', label: 'Lesson Preparation', scale_min: 1, scale_max: 4, anchors: { '1': 'No preparation', '2': 'Partial', '3': 'Adequate', '4': 'Exemplary' }, order: 1 }, { id: 'r2', label: 'Student Engagement', scale_min: 1, scale_max: 4, anchors: { '1': 'Passive', '2': 'Some participation', '3': 'Active', '4': 'Highly engaged' }, order: 2 }],
    },
    {
      id: 'd0000000-0000-0000-0000-000000000002', cohort_id: ORG.LUCKNOW_B,
      focus_categories: ['Literacy', 'Numeracy', 'Classroom Management'],
      required_fields: ['what_discussed', 'focus_tag'], vba_checklist: [], rubric_json: [],
    },
    {
      id: 'd0000000-0000-0000-0000-000000000003', cohort_id: ORG.PRAYAGRAJ_A,
      focus_categories: ['Literacy', 'Numeracy', 'Relationship Building', 'Off-script'],
      required_fields: ['what_discussed', 'focus_tag'],
      vba_checklist: [{ id: 'vc1', label: 'Student seating arranged', order: 1 }, { id: 'vc2', label: 'Materials ready', order: 2 }],
      rubric_json: [{ id: 'r1', label: 'Lesson Preparation', scale_min: 1, scale_max: 4, anchors: { '1': 'No preparation', '2': 'Partial', '3': 'Adequate', '4': 'Exemplary' }, order: 1 }],
    },
  ])

  // Teachers
  await insert('teachers', [
    { id: T.REKHA,   name: 'Rekha Maurya',    phone: '+919800100001', school_name: 'PS Amausi',          udise_code: '09220100101', block_tag: 'Sarojini Nagar', designation: 'Assistant Teacher', hm_name: 'Ramesh Pal',     hm_phone: '+919800200001', cohort_id: ORG.LUCKNOW_A, status: 'active' },
    { id: T.POONAM,  name: 'Poonam Yadav',    phone: '+919800100002', school_name: 'PS Gudamba',         udise_code: '09220100102', block_tag: 'Sarojini Nagar', designation: 'Assistant Teacher', hm_name: 'Suman Gupta',    hm_phone: '+919800200002', cohort_id: ORG.LUCKNOW_A, status: 'active' },
    { id: T.VINOD,   name: 'Vinod Kushwaha',  phone: '+919800100003', school_name: 'PS Chinhat',         udise_code: '09220100103', block_tag: 'Chinhat',        designation: 'Assistant Teacher', hm_name: 'Dinesh Singh',   hm_phone: '+919800200003', cohort_id: ORG.LUCKNOW_A, status: 'active' },
    { id: T.MEENA,   name: 'Meena Tripathi',  phone: '+919800100004', school_name: 'PS Kakori',          udise_code: '09220100104', block_tag: 'Kakori',         designation: 'Assistant Teacher', hm_name: 'Geeta Devi',     hm_phone: '+919800200004', cohort_id: ORG.LUCKNOW_A, status: 'active' },
    { id: T.ANIL,    name: 'Anil Verma',      phone: '+919800100005', school_name: 'PS Mohanlalganj',    udise_code: '09220100105', block_tag: 'Mohanlalganj',   designation: 'Assistant Teacher', hm_name: 'Renu Singh',     hm_phone: '+919800200005', cohort_id: ORG.LUCKNOW_A, status: 'active' },
    { id: T.SAVITRI, name: 'Savitri Devi',    phone: '+919800100006', school_name: 'PS Itaunja',         udise_code: '09220100106', block_tag: 'Itaunja',        designation: 'Assistant Teacher', hm_name: 'Pradeep Mishra', hm_phone: '+919800200006', cohort_id: ORG.LUCKNOW_A, status: 'active' },
    { id: T.RAJ,     name: 'Raj Kumar Singh', phone: '+919800100007', school_name: 'PS Malihabad',       udise_code: '09220100201', block_tag: 'Malihabad',      designation: 'Assistant Teacher', hm_name: 'Shanti Devi',    hm_phone: '+919800200007', cohort_id: ORG.LUCKNOW_B, status: 'active' },
    { id: T.GEETA,   name: 'Geeta Pandey',    phone: '+919800100008', school_name: 'PS Bakshi Ka Talab', udise_code: '09220100202', block_tag: 'BKT',            designation: 'Assistant Teacher', hm_name: 'Arun Kumar',     hm_phone: '+919800200008', cohort_id: ORG.LUCKNOW_B, status: 'active' },
    { id: T.SHIV,    name: 'Shiv Prasad',     phone: '+919800100009', school_name: 'PS Gosainganj',      udise_code: '09220100203', block_tag: 'Gosainganj',     designation: 'Assistant Teacher', hm_name: 'Maya Rani',      hm_phone: '+919800200009', cohort_id: ORG.LUCKNOW_B, status: 'active' },
    { id: T.PUSHPA,  name: 'Pushpa Rawat',    phone: '+919800100010', school_name: 'PS Nagram',          udise_code: '09220100204', block_tag: 'Nagram',         designation: 'Assistant Teacher', hm_name: 'Hari Om',        hm_phone: '+919800200010', cohort_id: ORG.LUCKNOW_B, status: 'active' },
    { id: T.RAMESH,  name: 'Ramesh Chandra',  phone: '+919800100011', school_name: 'PS Phulpur',         udise_code: '09300100301', block_tag: 'Phulpur',        designation: 'Assistant Teacher', hm_name: 'Kamla Devi',     hm_phone: '+919800200011', cohort_id: ORG.PRAYAGRAJ_A, status: 'active' },
    { id: T.ASHA,    name: 'Asha Kumari',     phone: '+919800100012', school_name: 'PS Soraon',          udise_code: '09300100302', block_tag: 'Soraon',         designation: 'Assistant Teacher', hm_name: 'Vijay Shankar',  hm_phone: '+919800200012', cohort_id: ORG.PRAYAGRAJ_A, status: 'active' },
    { id: T.BHAGWAN, name: 'Bhagwan Das',     phone: '+919800100013', school_name: 'PS Handia',          udise_code: '09300100303', block_tag: 'Handia',         designation: 'Assistant Teacher', hm_name: 'Sundar Lal',     hm_phone: '+919800200013', cohort_id: ORG.PRAYAGRAJ_A, status: 'active' },
    { id: T.SUSHILA, name: 'Sushila Sharma',  phone: '+919800100014', school_name: 'PS Meja',            udise_code: '09300100304', block_tag: 'Meja',           designation: 'Assistant Teacher', hm_name: 'Brijesh Kumar',  hm_phone: '+919800200014', cohort_id: ORG.PRAYAGRAJ_A, status: 'active' },
    { id: T.OM,      name: 'Om Prakash',      phone: '+919800100015', school_name: 'PS Karchhana',       udise_code: '09300100305', block_tag: 'Karchhana',      designation: 'Assistant Teacher', hm_name: 'Saroj Bala',     hm_phone: '+919800200015', cohort_id: ORG.PRAYAGRAJ_A, status: 'inactive' },
  ])

  // Assignments
  await insert('assignments', [
    { teacher_id: T.REKHA,   coach_id: USER.SUNITA, is_active: true },
    { teacher_id: T.POONAM,  coach_id: USER.SUNITA, is_active: true },
    { teacher_id: T.VINOD,   coach_id: USER.SUNITA, is_active: true },
    { teacher_id: T.MEENA,   coach_id: USER.MANOJ,  is_active: true },
    { teacher_id: T.ANIL,    coach_id: USER.MANOJ,  is_active: true },
    { teacher_id: T.SAVITRI, coach_id: USER.MANOJ,  is_active: true },
    { teacher_id: T.RAJ,     coach_id: USER.KAVITA, is_active: true },
    { teacher_id: T.GEETA,   coach_id: USER.KAVITA, is_active: true },
    { teacher_id: T.SHIV,    coach_id: USER.KAVITA, is_active: true },
    { teacher_id: T.PUSHPA,  coach_id: USER.KAVITA, is_active: true },
    { teacher_id: T.RAMESH,  coach_id: USER.DEEPAK, is_active: true },
    { teacher_id: T.ASHA,    coach_id: USER.DEEPAK, is_active: true },
    { teacher_id: T.BHAGWAN, coach_id: USER.DEEPAK, is_active: true },
    { teacher_id: T.SUSHILA, coach_id: USER.ANJALI, is_active: true },
    { teacher_id: T.OM,      coach_id: USER.ANJALI, is_active: true },
  ])

  // Sessions
  const S = {
    S01: 'f0000000-0000-0000-0000-000000000001', S02: 'f0000000-0000-0000-0000-000000000002',
    S03: 'f0000000-0000-0000-0000-000000000003', S04: 'f0000000-0000-0000-0000-000000000004',
    S05: 'f0000000-0000-0000-0000-000000000005', S06: 'f0000000-0000-0000-0000-000000000006',
    S07: 'f0000000-0000-0000-0000-000000000007', S08: 'f0000000-0000-0000-0000-000000000008',
    S09: 'f0000000-0000-0000-0000-000000000009', S10: 'f0000000-0000-0000-0000-000000000010',
    S11: 'f0000000-0000-0000-0000-000000000011', S12: 'f0000000-0000-0000-0000-000000000012',
    S13: 'f0000000-0000-0000-0000-000000000013', S14: 'f0000000-0000-0000-0000-000000000014',
    S15: 'f0000000-0000-0000-0000-000000000015', S16: 'f0000000-0000-0000-0000-000000000016',
    S17: 'f0000000-0000-0000-0000-000000000017', S18: 'f0000000-0000-0000-0000-000000000018',
    S19: 'f0000000-0000-0000-0000-000000000019', S20: 'f0000000-0000-0000-0000-000000000020',
    S21: 'f0000000-0000-0000-0000-000000000021', S22: 'f0000000-0000-0000-0000-000000000022',
    S23: 'f0000000-0000-0000-0000-000000000023', S24: 'f0000000-0000-0000-0000-000000000024',
    S25: 'f0000000-0000-0000-0000-000000000025', S26: 'f0000000-0000-0000-0000-000000000026',
    S27: 'f0000000-0000-0000-0000-000000000027',
  }

  await insert('sessions', [
    // Sunita's sessions
    { id: S.S01, teacher_id: T.REKHA,  coach_id: USER.SUNITA, session_type: 'coaching_call', scheduled_at: '2026-02-16T10:00:00+05:30', status: 'completed', focus_tag: 'Literacy', channel: 'google_meet', meet_link: 'https://meet.google.com/abc-defg-hij', duration_mins: 35, confirmation_status: 'confirmed', summary_sent_at: '2026-02-16T11:00:00+05:30', tech_issue_flag: false },
    { id: S.S02, teacher_id: T.POONAM, coach_id: USER.SUNITA, session_type: 'coaching_call', scheduled_at: '2026-02-18T11:00:00+05:30', status: 'completed', focus_tag: 'Numeracy', channel: 'google_meet', meet_link: 'https://meet.google.com/abc-defg-hik', duration_mins: 40, confirmation_status: 'confirmed', summary_sent_at: '2026-02-18T12:00:00+05:30', tech_issue_flag: false },
    { id: S.S03, teacher_id: T.VINOD,  coach_id: USER.SUNITA, session_type: 'coaching_call', scheduled_at: '2026-02-23T10:00:00+05:30', status: 'completed', focus_tag: 'Classroom Management', channel: 'phone', duration_mins: 25, confirmation_status: 'confirmed', tech_issue_flag: false },
    { id: S.S04, teacher_id: T.REKHA,  coach_id: USER.SUNITA, session_type: 'coaching_call', scheduled_at: '2026-03-02T10:00:00+05:30', status: 'completed', focus_tag: 'Literacy', channel: 'google_meet', meet_link: 'https://meet.google.com/abc-defg-hil', duration_mins: 30, confirmation_status: 'confirmed', summary_sent_at: '2026-03-02T11:00:00+05:30', tech_issue_flag: false },
    { id: S.S05, teacher_id: T.POONAM, coach_id: USER.SUNITA, session_type: 'coaching_call', scheduled_at: '2026-03-04T11:00:00+05:30', status: 'no_show', focus_tag: 'Numeracy', channel: 'google_meet', meet_link: 'https://meet.google.com/abc-defg-him', confirmation_status: 'no_response', tech_issue_flag: false },
    { id: S.S06, teacher_id: T.VINOD,  coach_id: USER.SUNITA, session_type: 'coaching_call', scheduled_at: '2026-03-09T10:00:00+05:30', status: 'rescheduled', focus_tag: 'Literacy', channel: 'google_meet', confirmation_status: 'pending', tech_issue_flag: false },
    { id: S.S07, teacher_id: T.REKHA,  coach_id: USER.SUNITA, session_type: 'coaching_call', scheduled_at: '2026-03-16T10:00:00+05:30', status: 'scheduled', focus_tag: 'Numeracy', channel: 'google_meet', meet_link: 'https://meet.google.com/abc-defg-hin', confirmation_status: 'pending', tech_issue_flag: false },
    { id: S.S08, teacher_id: T.POONAM, coach_id: USER.SUNITA, session_type: 'coaching_call', scheduled_at: '2026-03-18T11:00:00+05:30', status: 'scheduled', focus_tag: 'Literacy', channel: 'google_meet', meet_link: 'https://meet.google.com/abc-defg-hio', confirmation_status: 'confirmed', tech_issue_flag: false },
    { id: S.S09, teacher_id: T.VINOD,  coach_id: USER.SUNITA, session_type: 'coaching_call', scheduled_at: '2026-03-13T10:00:00+05:30', status: 'confirmed', focus_tag: 'Classroom Management', channel: 'google_meet', meet_link: 'https://meet.google.com/abc-defg-hip', confirmation_status: 'confirmed', tech_issue_flag: false },
    // Manoj's sessions
    { id: S.S10, teacher_id: T.MEENA,   coach_id: USER.MANOJ, session_type: 'coaching_call', scheduled_at: '2026-02-17T09:00:00+05:30', status: 'completed', focus_tag: 'Literacy', channel: 'google_meet', meet_link: 'https://meet.google.com/mnk-aaaa-001', duration_mins: 45, confirmation_status: 'confirmed', summary_sent_at: '2026-02-17T10:00:00+05:30', tech_issue_flag: false },
    { id: S.S11, teacher_id: T.ANIL,    coach_id: USER.MANOJ, session_type: 'coaching_call', scheduled_at: '2026-02-19T14:00:00+05:30', status: 'completed', focus_tag: 'Numeracy', channel: 'phone', duration_mins: 30, confirmation_status: 'confirmed', tech_issue_flag: false },
    { id: S.S12, teacher_id: T.SAVITRI, coach_id: USER.MANOJ, session_type: 'coaching_call', scheduled_at: '2026-03-03T09:00:00+05:30', status: 'completed', focus_tag: 'Relationship Building', channel: 'google_meet', meet_link: 'https://meet.google.com/mnk-aaaa-002', duration_mins: 40, confirmation_status: 'confirmed', summary_sent_at: '2026-03-03T10:00:00+05:30', tech_issue_flag: false },
    { id: S.S13, teacher_id: T.MEENA,   coach_id: USER.MANOJ, session_type: 'coaching_call', scheduled_at: '2026-03-10T09:00:00+05:30', status: 'in_progress', focus_tag: 'Literacy', channel: 'google_meet', meet_link: 'https://meet.google.com/mnk-aaaa-003', confirmation_status: 'confirmed', tech_issue_flag: false },
    { id: S.S14, teacher_id: T.ANIL,    coach_id: USER.MANOJ, session_type: 'coaching_call', scheduled_at: '2026-03-05T14:00:00+05:30', status: 'cancelled', focus_tag: 'Numeracy', channel: 'google_meet', meet_link: 'https://meet.google.com/mnk-aaaa-004', confirmation_status: 'confirmed', tech_issue_flag: true },
    { id: S.S15, teacher_id: T.SAVITRI, coach_id: USER.MANOJ, session_type: 'coaching_call', scheduled_at: '2026-03-17T09:00:00+05:30', status: 'scheduled', focus_tag: 'Literacy', channel: 'google_meet', meet_link: 'https://meet.google.com/mnk-aaaa-005', confirmation_status: 'pending', tech_issue_flag: false },
    // Kavita's sessions
    { id: S.S16, teacher_id: T.RAJ,    coach_id: USER.KAVITA, session_type: 'coaching_call', scheduled_at: '2026-02-20T10:00:00+05:30', status: 'completed', focus_tag: 'Literacy', channel: 'google_meet', meet_link: 'https://meet.google.com/kvy-bbbb-001', duration_mins: 35, confirmation_status: 'confirmed', summary_sent_at: '2026-02-20T11:00:00+05:30', tech_issue_flag: false },
    { id: S.S17, teacher_id: T.GEETA,  coach_id: USER.KAVITA, session_type: 'coaching_call', scheduled_at: '2026-03-06T11:00:00+05:30', status: 'completed', focus_tag: 'Numeracy', channel: 'phone', duration_mins: 25, confirmation_status: 'confirmed', tech_issue_flag: false },
    { id: S.S18, teacher_id: T.SHIV,   coach_id: USER.KAVITA, session_type: 'coaching_call', scheduled_at: '2026-03-11T10:00:00+05:30', status: 'no_show', focus_tag: 'Literacy', channel: 'google_meet', meet_link: 'https://meet.google.com/kvy-bbbb-002', confirmation_status: 'no_response', tech_issue_flag: false },
    { id: S.S19, teacher_id: T.PUSHPA, coach_id: USER.KAVITA, session_type: 'coaching_call', scheduled_at: '2026-03-14T10:00:00+05:30', status: 'scheduled', focus_tag: 'Classroom Management', channel: 'google_meet', meet_link: 'https://meet.google.com/kvy-bbbb-003', confirmation_status: 'pending', tech_issue_flag: false },
    // Deepak's sessions
    { id: S.S20, teacher_id: T.RAMESH,  coach_id: USER.DEEPAK, session_type: 'coaching_call', scheduled_at: '2026-02-21T09:00:00+05:30', status: 'completed', focus_tag: 'Numeracy', channel: 'google_meet', meet_link: 'https://meet.google.com/dkt-cccc-001', duration_mins: 40, confirmation_status: 'confirmed', summary_sent_at: '2026-02-21T10:00:00+05:30', tech_issue_flag: false },
    { id: S.S21, teacher_id: T.ASHA,    coach_id: USER.DEEPAK, session_type: 'coaching_call', scheduled_at: '2026-03-07T10:00:00+05:30', status: 'completed', focus_tag: 'Literacy', channel: 'in_person', duration_mins: 50, confirmation_status: 'confirmed', summary_sent_at: '2026-03-07T11:00:00+05:30', tech_issue_flag: false },
    { id: S.S22, teacher_id: T.BHAGWAN, coach_id: USER.DEEPAK, session_type: 'coaching_call', scheduled_at: '2026-03-12T09:00:00+05:30', status: 'confirmed', focus_tag: 'Numeracy', channel: 'google_meet', meet_link: 'https://meet.google.com/dkt-cccc-002', confirmation_status: 'confirmed', tech_issue_flag: false },
    { id: S.S23, teacher_id: T.RAMESH,  coach_id: USER.DEEPAK, session_type: 'coaching_call', scheduled_at: '2026-03-19T09:00:00+05:30', status: 'scheduled', focus_tag: 'Literacy', channel: 'google_meet', meet_link: 'https://meet.google.com/dkt-cccc-003', confirmation_status: 'pending', tech_issue_flag: false },
    // Anjali's sessions
    { id: S.S24, teacher_id: T.SUSHILA, coach_id: USER.ANJALI, session_type: 'coaching_call', scheduled_at: '2026-02-24T11:00:00+05:30', status: 'completed', focus_tag: 'Relationship Building', channel: 'google_meet', meet_link: 'https://meet.google.com/anm-dddd-001', duration_mins: 35, confirmation_status: 'confirmed', summary_sent_at: '2026-02-24T12:00:00+05:30', tech_issue_flag: false },
    { id: S.S25, teacher_id: T.SUSHILA, coach_id: USER.ANJALI, session_type: 'coaching_call', scheduled_at: '2026-03-08T11:00:00+05:30', status: 'completed', focus_tag: 'Literacy', channel: 'phone', duration_mins: 30, confirmation_status: 'confirmed', tech_issue_flag: false },
    { id: S.S26, teacher_id: T.OM,      coach_id: USER.ANJALI, session_type: 'coaching_call', scheduled_at: '2026-03-01T11:00:00+05:30', status: 'rescheduled', focus_tag: 'Numeracy', channel: 'google_meet', confirmation_status: 'pending', tech_issue_flag: false },
    { id: S.S27, teacher_id: T.SUSHILA, coach_id: USER.ANJALI, session_type: 'coaching_call', scheduled_at: '2026-03-15T11:00:00+05:30', status: 'scheduled', focus_tag: 'Off-script', channel: 'google_meet', meet_link: 'https://meet.google.com/anm-dddd-002', confirmation_status: 'pending', tech_issue_flag: false },
  ])

  // Session notes
  await insert('session_notes', [
    { id: '70000000-0000-0000-0000-000000000001', session_id: S.S01, what_discussed: 'Discussed phonics teaching approach for Class 2. Rekha is using letter cards but students struggle with blending.', what_decided: 'Will try syllable-based approach next week. Rekha to prepare new cards.', teacher_practice_markers: { lesson_prep: 3, student_engagement: 2 }, qualitative_comments: 'Rekha is motivated but needs more structured materials.', collateral_refs: [{ label: 'Phonics guide PDF', url: 'https://drive.google.com/example1' }], ai_draft_used: true, ai_draft_text: 'रेखा जी के साथ कक्षा 2 के लिए फोनिक्स शिक्षण पर चर्चा हुई।' },
    { id: '70000000-0000-0000-0000-000000000002', session_id: S.S02, what_discussed: 'Reviewed number sense activities for Class 1. Poonam using concrete materials effectively.', what_decided: 'Continue with current approach. Add peer learning component.', teacher_practice_markers: { lesson_prep: 3, student_engagement: 3 }, qualitative_comments: 'Strong progress since last session.', collateral_refs: [], ai_draft_used: false },
    { id: '70000000-0000-0000-0000-000000000003', session_id: S.S03, what_discussed: 'Discussed classroom management challenges. Vinod has 45 students in one room.', what_decided: 'Try group rotation strategy.', teacher_practice_markers: { lesson_prep: 2, student_engagement: 2 }, qualitative_comments: 'Difficult conditions but Vinod is trying.', collateral_refs: [], ai_draft_used: false },
    { id: '70000000-0000-0000-0000-000000000004', session_id: S.S04, what_discussed: 'Follow-up on syllable approach. Rekha reports improvement in blending.', what_decided: 'Scale to full class next week.', teacher_practice_markers: { lesson_prep: 3, student_engagement: 3 }, qualitative_comments: 'Good progress. Syllable cards working well.', collateral_refs: [], ai_draft_used: true, ai_draft_text: 'रेखा जी ने बताया कि शब्दांश दृष्टिकोण से सुधार हुआ है।' },
    { id: '70000000-0000-0000-0000-000000000005', session_id: S.S10, what_discussed: 'First session with Meena. Discussed current literacy teaching methods.', what_decided: 'Meena to observe a model lesson video.', teacher_practice_markers: { lesson_prep: 2, student_engagement: 2 }, qualitative_comments: 'Experienced but using traditional rote methods. Open to new ideas.', collateral_refs: [], ai_draft_used: false },
    { id: '70000000-0000-0000-0000-000000000006', session_id: S.S11, what_discussed: 'Anil struggling with number line concept for Class 3.', what_decided: 'Will send number line printables via WhatsApp.', teacher_practice_markers: { lesson_prep: 2, student_engagement: 2 }, qualitative_comments: 'Anil needs more support.', collateral_refs: [], ai_draft_used: false },
    { id: '70000000-0000-0000-0000-000000000007', session_id: S.S12, what_discussed: 'Savitri implementing relationship building strategies. Morning circle time going well.', what_decided: 'Continue morning circles. Add student-of-the-week.', teacher_practice_markers: { lesson_prep: 3, student_engagement: 4 }, qualitative_comments: 'Excellent engagement. Natural at building classroom community.', collateral_refs: [], ai_draft_used: false },
    { id: '70000000-0000-0000-0000-000000000008', session_id: S.S16, what_discussed: 'Raj Kumar reviewed story reading techniques using local folk tales.', what_decided: 'Add comprehension questions after reading.', teacher_practice_markers: { lesson_prep: 3, student_engagement: 3 }, qualitative_comments: 'Students love the folk tales.', collateral_refs: [], ai_draft_used: false },
    { id: '70000000-0000-0000-0000-000000000009', session_id: S.S17, what_discussed: 'Geeta working on mental math strategies for Class 2.', what_decided: 'Start with number bonds to 10.', teacher_practice_markers: { lesson_prep: 2, student_engagement: 3 }, qualitative_comments: 'Enthusiastic but needs structured approach.', collateral_refs: [], ai_draft_used: false },
    { id: '70000000-0000-0000-0000-000000000010', session_id: S.S20, what_discussed: 'Ramesh exploring hands-on numeracy activities using stones and sticks.', what_decided: 'Create a math corner in classroom.', teacher_practice_markers: { lesson_prep: 3, student_engagement: 3 }, qualitative_comments: 'Resourceful teacher.', collateral_refs: [], ai_draft_used: false },
    { id: '70000000-0000-0000-0000-000000000011', session_id: S.S21, what_discussed: 'In-person visit. Observed Asha teaching reading to Class 1.', what_decided: 'Continue big book approach. Add paired reading.', teacher_practice_markers: { lesson_prep: 4, student_engagement: 3 }, qualitative_comments: 'Strong classroom setup. Model teacher potential.', collateral_refs: [], ai_draft_used: false },
    { id: '70000000-0000-0000-0000-000000000012', session_id: S.S24, what_discussed: 'Sushila discussed strategies for engaging shy students.', what_decided: 'Try buddy system for quieter students.', teacher_practice_markers: { lesson_prep: 3, student_engagement: 2 }, qualitative_comments: 'Needs practical strategies for large class sizes.', collateral_refs: [], ai_draft_used: false },
    { id: '70000000-0000-0000-0000-000000000013', session_id: S.S25, what_discussed: 'Follow up on buddy system. Shy students participating more.', what_decided: 'Document approach for sharing with other teachers.', teacher_practice_markers: { lesson_prep: 3, student_engagement: 3 }, qualitative_comments: 'Buddy system working. Could present at cluster meeting.', collateral_refs: [], ai_draft_used: false },
  ])

  // Action steps
  await insert('action_steps', [
    { id: '80000000-0000-0000-0000-000000000001', session_id: S.S01, teacher_id: T.REKHA,   description: 'Prepare syllable cards for Class 2 phonics', due_date: '2026-02-23', status: 'completed' },
    { id: '80000000-0000-0000-0000-000000000002', session_id: S.S01, teacher_id: T.REKHA,   description: 'Practice blending with 5 students daily', due_date: '2026-02-28', status: 'completed' },
    { id: '80000000-0000-0000-0000-000000000003', session_id: S.S03, teacher_id: T.VINOD,   description: 'Try group rotation with 3 groups of 15', due_date: '2026-03-02', status: 'open' },
    { id: '80000000-0000-0000-0000-000000000004', session_id: S.S04, teacher_id: T.REKHA,   description: 'Prepare month-end blending assessment', due_date: '2026-03-15', status: 'open' },
    { id: '80000000-0000-0000-0000-000000000005', session_id: S.S04, teacher_id: T.REKHA,   description: 'Scale syllable approach to full class', due_date: '2026-03-09', status: 'completed' },
    { id: '80000000-0000-0000-0000-000000000006', session_id: S.S10, teacher_id: T.MEENA,   description: 'Watch model lesson video on phonics', due_date: '2026-02-24', status: 'completed' },
    { id: '80000000-0000-0000-0000-000000000007', session_id: S.S11, teacher_id: T.ANIL,    description: 'Print and laminate number line for classroom', due_date: '2026-03-01', status: 'open' },
    { id: '80000000-0000-0000-0000-000000000008', session_id: S.S12, teacher_id: T.SAVITRI, description: 'Start student-of-the-week recognition board', due_date: '2026-03-10', status: 'open' },
    { id: '80000000-0000-0000-0000-000000000009', session_id: S.S16, teacher_id: T.RAJ,     description: 'Add 3 comprehension questions after each story', due_date: '2026-02-27', status: 'completed' },
    { id: '80000000-0000-0000-0000-000000000010', session_id: S.S17, teacher_id: T.GEETA,   description: 'Implement daily 5-minute mental math warmup', due_date: '2026-03-13', status: 'open' },
    { id: '80000000-0000-0000-0000-000000000011', session_id: S.S20, teacher_id: T.RAMESH,  description: 'Set up math corner with local materials', due_date: '2026-02-28', status: 'completed' },
    { id: '80000000-0000-0000-0000-000000000012', session_id: S.S21, teacher_id: T.ASHA,    description: 'Try paired reading in Class 1 for 2 weeks', due_date: '2026-03-21', status: 'open' },
    { id: '80000000-0000-0000-0000-000000000013', session_id: S.S24, teacher_id: T.SUSHILA, description: 'Implement buddy system for shy students', due_date: '2026-03-03', status: 'completed' },
    { id: '80000000-0000-0000-0000-000000000014', session_id: S.S25, teacher_id: T.SUSHILA, description: 'Document buddy system for cluster meeting', due_date: '2026-03-20', status: 'open' },
  ])

  // Reschedules
  await insert('reschedules', [
    { id: '90000000-0000-0000-0000-000000000001', session_id: S.S06, reason_category: 'teacher_unavailable', new_window: '2026-03-13T10:00:00+05:30', counter: 1 },
    { id: '90000000-0000-0000-0000-000000000002', session_id: S.S26, reason_category: 'school_event', new_window: '2026-03-10T11:00:00+05:30', counter: 1 },
    { id: '90000000-0000-0000-0000-000000000003', session_id: S.S26, reason_category: 'teacher_unavailable', new_window: '2026-03-05T11:00:00+05:30', counter: 2 },
    { id: '90000000-0000-0000-0000-000000000004', session_id: S.S26, reason_category: 'teacher_unavailable', new_window: '2026-03-08T11:00:00+05:30', counter: 3 },
  ])

  // Teacher RYG
  await insert('teacher_ryg', [
    { id: 'aa000000-0000-0000-0000-000000000001', teacher_id: T.REKHA,   status: 'G', set_by: USER.SUNITA, set_at: '2026-03-02T11:00:00+05:30', prior_status: 'Y', dimensions_json: { lesson_prep: 3, student_engagement: 3 } },
    { id: 'aa000000-0000-0000-0000-000000000002', teacher_id: T.POONAM,  status: 'Y', set_by: USER.SUNITA, set_at: '2026-02-18T12:00:00+05:30', dimensions_json: { lesson_prep: 3, student_engagement: 2 } },
    { id: 'aa000000-0000-0000-0000-000000000003', teacher_id: T.VINOD,   status: 'R', set_by: USER.SUNITA, set_at: '2026-02-23T11:00:00+05:30', dimensions_json: { lesson_prep: 2, student_engagement: 2 } },
    { id: 'aa000000-0000-0000-0000-000000000004', teacher_id: T.MEENA,   status: 'Y', set_by: USER.MANOJ,  set_at: '2026-03-03T10:00:00+05:30', prior_status: 'R', dimensions_json: { lesson_prep: 2, student_engagement: 2 } },
    { id: 'aa000000-0000-0000-0000-000000000005', teacher_id: T.ANIL,    status: 'R', set_by: USER.MANOJ,  set_at: '2026-02-19T15:00:00+05:30', dimensions_json: { lesson_prep: 2, student_engagement: 2 } },
    { id: 'aa000000-0000-0000-0000-000000000006', teacher_id: T.SAVITRI, status: 'G', set_by: USER.MANOJ,  set_at: '2026-03-03T10:30:00+05:30', prior_status: 'Y', dimensions_json: { lesson_prep: 3, student_engagement: 4 } },
    { id: 'aa000000-0000-0000-0000-000000000007', teacher_id: T.RAJ,     status: 'G', set_by: USER.KAVITA, set_at: '2026-02-20T11:30:00+05:30', dimensions_json: { lesson_prep: 3, student_engagement: 3 } },
    { id: 'aa000000-0000-0000-0000-000000000008', teacher_id: T.GEETA,   status: 'Y', set_by: USER.KAVITA, set_at: '2026-03-06T12:00:00+05:30', dimensions_json: { lesson_prep: 2, student_engagement: 3 } },
    { id: 'aa000000-0000-0000-0000-000000000009', teacher_id: T.SHIV,    status: 'R', set_by: USER.KAVITA, set_at: '2026-03-11T11:00:00+05:30', dimensions_json: {} },
    { id: 'aa000000-0000-0000-0000-000000000010', teacher_id: T.PUSHPA,  status: 'Y', set_by: USER.KAVITA, set_at: '2026-02-20T11:00:00+05:30', dimensions_json: {} },
    { id: 'aa000000-0000-0000-0000-000000000011', teacher_id: T.RAMESH,  status: 'G', set_by: USER.DEEPAK, set_at: '2026-03-07T10:30:00+05:30', prior_status: 'Y', dimensions_json: { lesson_prep: 3, student_engagement: 3 } },
    { id: 'aa000000-0000-0000-0000-000000000012', teacher_id: T.ASHA,    status: 'G', set_by: USER.DEEPAK, set_at: '2026-03-07T11:30:00+05:30', dimensions_json: { lesson_prep: 4, student_engagement: 3 } },
    { id: 'aa000000-0000-0000-0000-000000000013', teacher_id: T.BHAGWAN, status: 'Y', set_by: USER.DEEPAK, set_at: '2026-02-21T10:00:00+05:30', dimensions_json: {} },
    { id: 'aa000000-0000-0000-0000-000000000014', teacher_id: T.SUSHILA, status: 'G', set_by: USER.ANJALI, set_at: '2026-03-08T12:00:00+05:30', prior_status: 'Y', dimensions_json: { lesson_prep: 3, student_engagement: 3 } },
    { id: 'aa000000-0000-0000-0000-000000000015', teacher_id: T.OM,      status: 'R', set_by: USER.ANJALI, set_at: '2026-03-01T12:00:00+05:30', dimensions_json: {} },
  ])

  // Escalations
  await insert('escalations', [
    { id: 'ab000000-0000-0000-0000-000000000001', trigger_type: 'reschedule_threshold', teacher_id: T.OM, coach_id: USER.ANJALI, cohort_id: ORG.PRAYAGRAJ_A, status: 'open' },
    { id: 'ab000000-0000-0000-0000-000000000002', trigger_type: 'manual', teacher_id: T.SHIV, coach_id: USER.KAVITA, cohort_id: ORG.LUCKNOW_B, status: 'in_progress', resolution_notes: 'Spoke with HM. Teacher was on leave. Will resume next week.', actioned_by: USER.PRIYA, actioned_at: '2026-03-11T14:00:00+05:30' },
  ])

  // CM commitments
  await insert('cm_commitments', [
    { id: 'ac000000-0000-0000-0000-000000000001', cm_id: USER.PRIYA, coach_id: USER.SUNITA, session_date: '2026-03-05', commitments: [{ text: "Review Sunita's session notes weekly", status: 'done' }, { text: "Observe one of Sunita's calls this month", status: 'pending' }], spot_check_ratings: { session_quality: 3, teacher_engagement: 4 } },
    { id: 'ac000000-0000-0000-0000-000000000002', cm_id: USER.PRIYA, coach_id: USER.MANOJ,  session_date: '2026-03-05', commitments: [{ text: 'Help Manoj with tech issue follow-up', status: 'done' }, { text: "Check Anil's number line progress", status: 'pending' }], spot_check_ratings: { session_quality: 3, teacher_engagement: 3 } },
    { id: 'ac000000-0000-0000-0000-000000000003', cm_id: USER.RAVI,  coach_id: USER.DEEPAK, session_date: '2026-03-07', commitments: [{ text: "Review Deepak's in-person visit notes", status: 'done' }, { text: 'Plan cluster meeting for next month', status: 'pending' }], spot_check_ratings: { session_quality: 4, teacher_engagement: 3 } },
  ])

  // VBA sessions
  await insert('vba_sessions', [
    { id: 'ae000000-0000-0000-0000-000000000001', teacher_id: T.REKHA, coach_id: USER.SUNITA, scheduled_at: '2026-02-25T09:00:00+05:30', status: 'completed', protocol_ratings: { reading_fluency: 3, comprehension: 2 }, checklist_items_done: ['vc1', 'vc2', 'vc3'] },
    { id: 'ae000000-0000-0000-0000-000000000002', teacher_id: T.RAMESH, coach_id: USER.DEEPAK, scheduled_at: '2026-03-20T09:00:00+05:30', status: 'scheduled', protocol_ratings: {}, checklist_items_done: [] },
  ])

  // VBA student results
  await insert('vba_student_results', [
    { id: 'af000000-0000-0000-0000-000000000001', vba_session_id: 'ae000000-0000-0000-0000-000000000001', student_name: 'Aarti',  student_number: 1, literacy_results: { letter_recognition: 18, word_reading: 8, sentence_reading: 3, fluency_wpm: 22 }, numeracy_results: { number_recognition: 15, addition: 7, subtraction: 4 } },
    { id: 'af000000-0000-0000-0000-000000000002', vba_session_id: 'ae000000-0000-0000-0000-000000000001', student_name: 'Rohit',  student_number: 2, literacy_results: { letter_recognition: 22, word_reading: 12, sentence_reading: 6, fluency_wpm: 35 }, numeracy_results: { number_recognition: 20, addition: 10, subtraction: 7 } },
    { id: 'af000000-0000-0000-0000-000000000003', vba_session_id: 'ae000000-0000-0000-0000-000000000001', student_name: 'Priya',  student_number: 3, literacy_results: { letter_recognition: 25, word_reading: 15, sentence_reading: 8, fluency_wpm: 42 }, numeracy_results: { number_recognition: 22, addition: 12, subtraction: 9 } },
    { id: 'af000000-0000-0000-0000-000000000004', vba_session_id: 'ae000000-0000-0000-0000-000000000001', student_name: 'Sunil',  student_number: 4, literacy_results: { letter_recognition: 10, word_reading: 3, sentence_reading: 0, fluency_wpm: 8 }, numeracy_results: { number_recognition: 8, addition: 2, subtraction: 0 } },
    { id: 'af000000-0000-0000-0000-000000000005', vba_session_id: 'ae000000-0000-0000-0000-000000000001', student_name: 'Kavita', student_number: 5, literacy_results: { letter_recognition: 20, word_reading: 10, sentence_reading: 5, fluency_wpm: 28 }, numeracy_results: { number_recognition: 18, addition: 9, subtraction: 6 } },
  ])

  // Movement plans
  await insert('movement_plans', [
    { id: 'ad000000-0000-0000-0000-000000000001', teacher_id: T.VINOD, cm_id: USER.PRIYA, target_status: 'Y', target_date: '2026-04-15', actions: [{ description: 'Coach to do in-person visit', assigned_to: 'Sunita Devi', due_date: '2026-03-20' }, { description: 'Provide classroom management resources', assigned_to: 'Priya Singh', due_date: '2026-03-15' }] },
    { id: 'ad000000-0000-0000-0000-000000000002', teacher_id: T.ANIL,  cm_id: USER.PRIYA, target_status: 'Y', target_date: '2026-04-30', actions: [{ description: 'Weekly phone check-ins', assigned_to: 'Manoj Kumar', due_date: '2026-03-30' }, { description: 'Pair with Savitri for peer observation', assigned_to: 'Manoj Kumar', due_date: '2026-03-25' }] },
  ])

  console.log('\n=== Seed complete ===')
  console.log('\nSeed users:')
  console.log('┌─────────────────────┬──────────┬──────────────────────────────┐')
  console.log('│ Name                │ Role     │ Email                        │')
  console.log('├─────────────────────┼──────────┼──────────────────────────────┤')
  for (const u of SEED_USERS) {
    console.log(`│ ${u.name.padEnd(19)} │ ${u.role.padEnd(8)} │ ${u.email.padEnd(28)} │`)
  }
  console.log('└─────────────────────┴──────────┴──────────────────────────────┘')
  console.log('\nData: 6 org units, 15 teachers, 15 assignments, 27 sessions,')
  console.log('13 session notes, 14 action steps, 4 reschedules, 15 RYG ratings,')
  console.log('2 escalations, 3 CM commitments, 2 VBA sessions, 5 student results,')
  console.log('2 movement plans')
}

main().catch(console.error)
