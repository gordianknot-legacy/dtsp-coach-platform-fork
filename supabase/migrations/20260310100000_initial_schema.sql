-- =============================================================================
-- DTSP Coach Platform — Initial Schema (clean install)
-- =============================================================================

-- Cleanup from any partial prior run
DROP TABLE IF EXISTS vba_student_results CASCADE;
DROP TABLE IF EXISTS vba_sessions CASCADE;
DROP TABLE IF EXISTS cm_commitments CASCADE;
DROP TABLE IF EXISTS escalations CASCADE;
DROP TABLE IF EXISTS movement_plans CASCADE;
DROP TABLE IF EXISTS teacher_ryg CASCADE;
DROP TABLE IF EXISTS reschedules CASCADE;
DROP TABLE IF EXISTS action_steps CASCADE;
DROP TABLE IF EXISTS session_notes CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS session_templates CASCADE;
DROP TABLE IF EXISTS program_standards CASCADE;
DROP TABLE IF EXISTS org_units CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS ryg_status CASCADE;
DROP TYPE IF EXISTS session_status CASCADE;
DROP TYPE IF EXISTS session_type CASCADE;
DROP TYPE IF EXISTS confirmation_status CASCADE;
DROP TYPE IF EXISTS escalation_status CASCADE;
DROP TYPE IF EXISTS action_step_status CASCADE;
DROP TYPE IF EXISTS org_unit_type CASCADE;
DROP TYPE IF EXISTS teacher_status CASCADE;
DROP TYPE IF EXISTS session_channel CASCADE;
DROP TYPE IF EXISTS escalation_trigger CASCADE;
DROP TYPE IF EXISTS reschedule_reason CASCADE;

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE user_role AS ENUM ('coach', 'cm', 'admin', 'observer');
CREATE TYPE ryg_status AS ENUM ('R', 'Y', 'G');
CREATE TYPE session_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'no_show', 'cancelled', 'rescheduled');
CREATE TYPE session_type AS ENUM ('coaching_call', 'vba', 'cm_1on1');
CREATE TYPE confirmation_status AS ENUM ('pending', 'confirmed', 'no_response');
CREATE TYPE escalation_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE action_step_status AS ENUM ('open', 'completed', 'carried_forward');
CREATE TYPE org_unit_type AS ENUM ('state', 'district', 'cohort');
CREATE TYPE teacher_status AS ENUM ('active', 'inactive');
CREATE TYPE session_channel AS ENUM ('google_meet', 'phone', 'in_person');
CREATE TYPE escalation_trigger AS ENUM ('reschedule_threshold', 'vba_overdue', 'chronic_non_confirmation', 'manual');
CREATE TYPE reschedule_reason AS ENUM ('teacher_unavailable', 'coach_unavailable', 'tech_issue', 'school_event', 'other');

-- =============================================================================
-- CORE TABLES
-- =============================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  cohort_id UUID,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE org_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type org_unit_type NOT NULL,
  parent_id UUID REFERENCES org_units(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ADD CONSTRAINT profiles_cohort_id_fkey
  FOREIGN KEY (cohort_id) REFERENCES org_units(id);

CREATE TABLE program_standards (
  cohort_id UUID NOT NULL REFERENCES org_units(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (cohort_id, key)
);

CREATE TABLE session_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID NOT NULL REFERENCES org_units(id) ON DELETE CASCADE,
  focus_categories JSONB NOT NULL DEFAULT '["Literacy", "Numeracy", "Relationship", "Off-script"]',
  required_fields JSONB NOT NULL DEFAULT '["what_discussed", "focus_tag"]',
  vba_checklist JSONB NOT NULL DEFAULT '[]',
  rubric_json JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cohort_id)
);

CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  school_name TEXT NOT NULL DEFAULT '',
  udise_code TEXT,
  block_tag TEXT,
  designation TEXT,
  hm_name TEXT,
  hm_phone TEXT,
  cohort_id UUID NOT NULL REFERENCES org_units(id),
  status teacher_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT teachers_udise_unique UNIQUE (udise_code)
);

CREATE TABLE assignments (
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (teacher_id, coach_id)
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id),
  coach_id UUID NOT NULL REFERENCES profiles(id),
  session_type session_type NOT NULL DEFAULT 'coaching_call',
  scheduled_at TIMESTAMPTZ NOT NULL,
  status session_status NOT NULL DEFAULT 'scheduled',
  focus_tag TEXT,
  channel session_channel NOT NULL DEFAULT 'google_meet',
  meet_link TEXT,
  duration_mins INTEGER,
  confirmation_status confirmation_status NOT NULL DEFAULT 'pending',
  summary_sent_at TIMESTAMPTZ,
  next_touch_window TIMESTAMPTZ,
  tech_issue_flag BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  what_discussed TEXT,
  what_decided TEXT,
  teacher_practice_markers JSONB NOT NULL DEFAULT '{}',
  qualitative_comments TEXT,
  collateral_refs JSONB NOT NULL DEFAULT '[]',
  ai_draft_used BOOLEAN NOT NULL DEFAULT FALSE,
  ai_draft_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id)
);

CREATE TABLE action_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id),
  description TEXT NOT NULL,
  due_date DATE,
  status action_step_status NOT NULL DEFAULT 'open',
  carried_from_id UUID REFERENCES action_steps(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reschedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  reason_category reschedule_reason NOT NULL DEFAULT 'other',
  new_window TIMESTAMPTZ,
  counter INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE teacher_ryg (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  status ryg_status NOT NULL,
  set_by UUID NOT NULL REFERENCES profiles(id),
  set_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  prior_status ryg_status,
  dimensions_json JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE movement_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  cm_id UUID NOT NULL REFERENCES profiles(id),
  target_status ryg_status NOT NULL,
  target_date DATE,
  actions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type escalation_trigger NOT NULL,
  teacher_id UUID NOT NULL REFERENCES teachers(id),
  coach_id UUID NOT NULL REFERENCES profiles(id),
  cohort_id UUID NOT NULL REFERENCES org_units(id),
  status escalation_status NOT NULL DEFAULT 'open',
  auto_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolution_category TEXT,
  resolution_notes TEXT,
  actioned_by UUID REFERENCES profiles(id),
  actioned_at TIMESTAMPTZ
);

CREATE TABLE cm_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cm_id UUID NOT NULL REFERENCES profiles(id),
  coach_id UUID NOT NULL REFERENCES profiles(id),
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  commitments JSONB NOT NULL DEFAULT '[]',
  spot_check_ratings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vba_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id),
  coach_id UUID NOT NULL REFERENCES profiles(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status session_status NOT NULL DEFAULT 'scheduled',
  protocol_ratings JSONB NOT NULL DEFAULT '{}',
  checklist_items_done JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vba_student_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vba_session_id UUID NOT NULL REFERENCES vba_sessions(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_number INTEGER NOT NULL,
  literacy_results JSONB NOT NULL DEFAULT '{}',
  numeracy_results JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (vba_session_id, student_number)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX sessions_coach_id_idx ON sessions (coach_id);
CREATE INDEX sessions_teacher_id_idx ON sessions (teacher_id);
CREATE INDEX sessions_scheduled_at_idx ON sessions (scheduled_at);
CREATE INDEX sessions_status_idx ON sessions (status);
CREATE INDEX action_steps_teacher_id_idx ON action_steps (teacher_id);
CREATE INDEX action_steps_status_idx ON action_steps (status);
CREATE INDEX teacher_ryg_teacher_id_idx ON teacher_ryg (teacher_id);
CREATE INDEX teacher_ryg_set_at_idx ON teacher_ryg (set_at DESC);
CREATE INDEX escalations_coach_id_idx ON escalations (coach_id);
CREATE INDEX escalations_status_idx ON escalations (status);
CREATE INDEX teachers_cohort_id_idx ON teachers (cohort_id);
CREATE INDEX teachers_block_tag_idx ON teachers (block_tag);
CREATE INDEX assignments_coach_id_idx ON assignments (coach_id);
CREATE INDEX assignments_is_active_idx ON assignments (is_active);

-- =============================================================================
-- TRIGGERS: updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER session_notes_updated_at BEFORE UPDATE ON session_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER movement_plans_updated_at BEFORE UPDATE ON movement_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER vba_sessions_updated_at BEFORE UPDATE ON vba_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER vba_student_results_updated_at BEFORE UPDATE ON vba_student_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- TRIGGER: Auto-create escalation on reschedule threshold
-- =============================================================================

CREATE OR REPLACE FUNCTION check_reschedule_escalation()
RETURNS TRIGGER AS $$
DECLARE
  v_teacher_id UUID;
  v_coach_id UUID;
  v_cohort_id UUID;
  v_threshold INTEGER;
  v_count INTEGER;
BEGIN
  SELECT s.teacher_id, s.coach_id, t.cohort_id
  INTO v_teacher_id, v_coach_id, v_cohort_id
  FROM sessions s
  JOIN teachers t ON t.id = s.teacher_id
  WHERE s.id = NEW.session_id;

  SELECT COALESCE(value::INTEGER, 3)
  INTO v_threshold
  FROM program_standards
  WHERE cohort_id = v_cohort_id AND key = 'reschedule_escalation_threshold'
  LIMIT 1;

  IF v_threshold IS NULL THEN v_threshold := 3; END IF;

  SELECT COUNT(*)
  INTO v_count
  FROM reschedules r
  JOIN sessions s ON s.id = r.session_id
  WHERE s.teacher_id = v_teacher_id
    AND r.created_at > NOW() - INTERVAL '30 days';

  IF v_count >= v_threshold THEN
    INSERT INTO escalations (trigger_type, teacher_id, coach_id, cohort_id, status)
    SELECT 'reschedule_threshold', v_teacher_id, v_coach_id, v_cohort_id, 'open'
    WHERE NOT EXISTS (
      SELECT 1 FROM escalations
      WHERE teacher_id = v_teacher_id
        AND trigger_type = 'reschedule_threshold'
        AND status IN ('open', 'in_progress')
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER reschedule_escalation_trigger
  AFTER INSERT ON reschedules
  FOR EACH ROW EXECUTE FUNCTION check_reschedule_escalation();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE reschedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_ryg ENABLE ROW LEVEL SECURITY;
ALTER TABLE movement_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cm_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vba_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vba_student_results ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION current_user_cohort()
RETURNS UUID AS $$
  SELECT cohort_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- PROFILES
CREATE POLICY "profiles_self_read" ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid());
CREATE POLICY "profiles_admin_read" ON profiles FOR SELECT TO authenticated
  USING (current_user_role() = 'admin');
CREATE POLICY "profiles_cm_read" ON profiles FOR SELECT TO authenticated
  USING (current_user_role() = 'cm' AND cohort_id = current_user_cohort());
CREATE POLICY "profiles_self_update" ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());
CREATE POLICY "profiles_admin_insert" ON profiles FOR INSERT TO authenticated
  WITH CHECK (current_user_role() = 'admin');

-- ORG UNITS
CREATE POLICY "org_units_read" ON org_units FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "org_units_admin_write" ON org_units FOR ALL TO authenticated
  USING (current_user_role() = 'admin')
  WITH CHECK (current_user_role() = 'admin');

-- PROGRAM STANDARDS
CREATE POLICY "standards_read" ON program_standards FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "standards_admin_write" ON program_standards FOR ALL TO authenticated
  USING (current_user_role() = 'admin')
  WITH CHECK (current_user_role() = 'admin');

-- SESSION TEMPLATES
CREATE POLICY "templates_read" ON session_templates FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "templates_admin_write" ON session_templates FOR ALL TO authenticated
  USING (current_user_role() = 'admin')
  WITH CHECK (current_user_role() = 'admin');

-- TEACHERS
CREATE POLICY "teachers_coach_read" ON teachers FOR SELECT TO authenticated
  USING (current_user_role() = 'coach' AND id IN (
    SELECT teacher_id FROM assignments WHERE coach_id = auth.uid() AND is_active = TRUE
  ));
CREATE POLICY "teachers_cm_read" ON teachers FOR SELECT TO authenticated
  USING (current_user_role() IN ('cm', 'admin', 'observer') AND cohort_id = current_user_cohort());
CREATE POLICY "teachers_admin_write" ON teachers FOR ALL TO authenticated
  USING (current_user_role() = 'admin' AND cohort_id = current_user_cohort())
  WITH CHECK (current_user_role() = 'admin' AND cohort_id = current_user_cohort());

-- ASSIGNMENTS
CREATE POLICY "assignments_coach_read" ON assignments FOR SELECT TO authenticated
  USING (current_user_role() = 'coach' AND coach_id = auth.uid());
CREATE POLICY "assignments_cm_read" ON assignments FOR SELECT TO authenticated
  USING (current_user_role() = 'cm' AND coach_id IN (
    SELECT id FROM profiles WHERE cohort_id = current_user_cohort()
  ));
CREATE POLICY "assignments_admin_all" ON assignments FOR ALL TO authenticated
  USING (current_user_role() = 'admin')
  WITH CHECK (current_user_role() = 'admin');

-- SESSIONS
CREATE POLICY "sessions_coach_all" ON sessions FOR ALL TO authenticated
  USING (current_user_role() = 'coach' AND coach_id = auth.uid())
  WITH CHECK (current_user_role() = 'coach' AND coach_id = auth.uid());
CREATE POLICY "sessions_cm_read" ON sessions FOR SELECT TO authenticated
  USING (current_user_role() = 'cm' AND coach_id IN (
    SELECT id FROM profiles WHERE cohort_id = current_user_cohort() AND role = 'coach'
  ));
CREATE POLICY "sessions_admin_read" ON sessions FOR SELECT TO authenticated
  USING (current_user_role() = 'admin' AND coach_id IN (
    SELECT id FROM profiles WHERE cohort_id = current_user_cohort()
  ));
CREATE POLICY "sessions_observer_read" ON sessions FOR SELECT TO authenticated
  USING (current_user_role() = 'observer');

-- SESSION NOTES
CREATE POLICY "notes_coach_all" ON session_notes FOR ALL TO authenticated
  USING (current_user_role() = 'coach' AND session_id IN (SELECT id FROM sessions WHERE coach_id = auth.uid()))
  WITH CHECK (current_user_role() = 'coach' AND session_id IN (SELECT id FROM sessions WHERE coach_id = auth.uid()));
CREATE POLICY "notes_cm_read" ON session_notes FOR SELECT TO authenticated
  USING (current_user_role() IN ('cm', 'admin', 'observer') AND session_id IN (
    SELECT s.id FROM sessions s JOIN profiles p ON p.id = s.coach_id WHERE p.cohort_id = current_user_cohort()
  ));

-- ACTION STEPS
CREATE POLICY "action_steps_coach_all" ON action_steps FOR ALL TO authenticated
  USING (current_user_role() = 'coach' AND session_id IN (SELECT id FROM sessions WHERE coach_id = auth.uid()))
  WITH CHECK (current_user_role() = 'coach' AND session_id IN (SELECT id FROM sessions WHERE coach_id = auth.uid()));
CREATE POLICY "action_steps_cm_read" ON action_steps FOR SELECT TO authenticated
  USING (current_user_role() IN ('cm', 'admin', 'observer'));

-- RESCHEDULES
CREATE POLICY "reschedules_coach_all" ON reschedules FOR ALL TO authenticated
  USING (current_user_role() = 'coach' AND session_id IN (SELECT id FROM sessions WHERE coach_id = auth.uid()))
  WITH CHECK (current_user_role() = 'coach' AND session_id IN (SELECT id FROM sessions WHERE coach_id = auth.uid()));
CREATE POLICY "reschedules_cm_read" ON reschedules FOR SELECT TO authenticated
  USING (current_user_role() IN ('cm', 'admin'));

-- TEACHER RYG
CREATE POLICY "ryg_coach_read" ON teacher_ryg FOR SELECT TO authenticated
  USING (current_user_role() = 'coach' AND teacher_id IN (
    SELECT teacher_id FROM assignments WHERE coach_id = auth.uid() AND is_active = TRUE
  ));
CREATE POLICY "ryg_coach_insert" ON teacher_ryg FOR INSERT TO authenticated
  WITH CHECK (current_user_role() = 'coach' AND teacher_id IN (
    SELECT teacher_id FROM assignments WHERE coach_id = auth.uid() AND is_active = TRUE
  ) AND set_by = auth.uid());
CREATE POLICY "ryg_cm_all" ON teacher_ryg FOR ALL TO authenticated
  USING (current_user_role() IN ('cm', 'admin'))
  WITH CHECK (current_user_role() IN ('cm', 'admin'));

-- MOVEMENT PLANS
CREATE POLICY "movement_cm_all" ON movement_plans FOR ALL TO authenticated
  USING (current_user_role() = 'cm' AND cm_id = auth.uid())
  WITH CHECK (current_user_role() = 'cm' AND cm_id = auth.uid());
CREATE POLICY "movement_admin_read" ON movement_plans FOR SELECT TO authenticated
  USING (current_user_role() = 'admin');
CREATE POLICY "movement_coach_read" ON movement_plans FOR SELECT TO authenticated
  USING (current_user_role() = 'coach' AND teacher_id IN (
    SELECT teacher_id FROM assignments WHERE coach_id = auth.uid() AND is_active = TRUE
  ));

-- ESCALATIONS
CREATE POLICY "escalations_coach_read" ON escalations FOR SELECT TO authenticated
  USING (current_user_role() = 'coach' AND coach_id = auth.uid());
CREATE POLICY "escalations_cm_all" ON escalations FOR ALL TO authenticated
  USING (current_user_role() = 'cm' AND cohort_id = current_user_cohort())
  WITH CHECK (current_user_role() = 'cm' AND cohort_id = current_user_cohort());
CREATE POLICY "escalations_admin_read" ON escalations FOR SELECT TO authenticated
  USING (current_user_role() = 'admin');

-- CM COMMITMENTS
CREATE POLICY "commitments_cm_all" ON cm_commitments FOR ALL TO authenticated
  USING (current_user_role() = 'cm' AND cm_id = auth.uid())
  WITH CHECK (current_user_role() = 'cm' AND cm_id = auth.uid());
CREATE POLICY "commitments_admin_read" ON cm_commitments FOR SELECT TO authenticated
  USING (current_user_role() = 'admin');

-- VBA SESSIONS
CREATE POLICY "vba_coach_all" ON vba_sessions FOR ALL TO authenticated
  USING (current_user_role() = 'coach' AND coach_id = auth.uid())
  WITH CHECK (current_user_role() = 'coach' AND coach_id = auth.uid());
CREATE POLICY "vba_cm_read" ON vba_sessions FOR SELECT TO authenticated
  USING (current_user_role() IN ('cm', 'admin', 'observer'));

-- VBA STUDENT RESULTS
CREATE POLICY "vba_results_coach_all" ON vba_student_results FOR ALL TO authenticated
  USING (current_user_role() = 'coach' AND vba_session_id IN (SELECT id FROM vba_sessions WHERE coach_id = auth.uid()))
  WITH CHECK (current_user_role() = 'coach' AND vba_session_id IN (SELECT id FROM vba_sessions WHERE coach_id = auth.uid()));
CREATE POLICY "vba_results_cm_read" ON vba_student_results FOR SELECT TO authenticated
  USING (current_user_role() IN ('cm', 'admin', 'observer'));
