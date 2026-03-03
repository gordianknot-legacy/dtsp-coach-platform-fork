export type UserRole = 'coach' | 'cm' | 'admin' | 'observer'
export type RYGStatus = 'R' | 'Y' | 'G'
export type SessionStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'no_show' | 'cancelled' | 'rescheduled'
export type SessionType = 'coaching_call' | 'vba' | 'cm_1on1'
export type ConfirmationStatus = 'pending' | 'confirmed' | 'no_response'
export type EscalationStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type ActionStepStatus = 'open' | 'completed' | 'carried_forward'
export type OrgUnitType = 'state' | 'district' | 'cohort'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      org_units: {
        Row: OrgUnit
        Insert: Omit<OrgUnit, 'id' | 'created_at'>
        Update: Partial<Omit<OrgUnit, 'id' | 'created_at'>>
      }
      program_standards: {
        Row: ProgramStandard
        Insert: Omit<ProgramStandard, 'updated_at'>
        Update: Partial<Omit<ProgramStandard, 'cohort_id' | 'key'>>
      }
      session_templates: {
        Row: SessionTemplate
        Insert: Omit<SessionTemplate, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<SessionTemplate, 'id' | 'cohort_id'>>
      }
      teachers: {
        Row: Teacher
        Insert: Omit<Teacher, 'id' | 'created_at'>
        Update: Partial<Omit<Teacher, 'id' | 'created_at'>>
      }
      assignments: {
        Row: Assignment
        Insert: Omit<Assignment, 'assigned_at'>
        Update: Partial<Omit<Assignment, 'teacher_id' | 'coach_id'>>
      }
      sessions: {
        Row: Session
        Insert: Omit<Session, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Session, 'id' | 'created_at'>>
      }
      session_notes: {
        Row: SessionNote
        Insert: Omit<SessionNote, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<SessionNote, 'id' | 'session_id'>>
      }
      action_steps: {
        Row: ActionStep
        Insert: Omit<ActionStep, 'id' | 'created_at'>
        Update: Partial<Omit<ActionStep, 'id'>>
      }
      reschedules: {
        Row: Reschedule
        Insert: Omit<Reschedule, 'id' | 'created_at'>
        Update: Partial<Omit<Reschedule, 'id'>>
      }
      teacher_ryg: {
        Row: TeacherRYG
        Insert: Omit<TeacherRYG, 'id' | 'set_at'>
        Update: Partial<Omit<TeacherRYG, 'id' | 'teacher_id'>>
      }
      movement_plans: {
        Row: MovementPlan
        Insert: Omit<MovementPlan, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<MovementPlan, 'id' | 'teacher_id'>>
      }
      escalations: {
        Row: Escalation
        Insert: Omit<Escalation, 'id' | 'auto_created_at'>
        Update: Partial<Omit<Escalation, 'id'>>
      }
    }
  }
}

export interface Profile {
  id: string
  role: UserRole
  cohort_id: string | null
  name: string
  phone: string | null
  created_at: string
}

export interface OrgUnit {
  id: string
  name: string
  type: OrgUnitType
  parent_id: string | null
  created_at: string
}

export interface ProgramStandard {
  cohort_id: string
  key: string
  value: string
  updated_at: string
}

export interface SessionTemplate {
  id: string
  cohort_id: string
  focus_categories: string[]
  required_fields: string[]
  vba_checklist: VBAChecklistItem[]
  rubric_json: RubricDimension[]
  created_at: string
  updated_at: string
}

export interface VBAChecklistItem {
  id: string
  label: string
  order: number
}

export interface RubricDimension {
  id: string
  label: string
  scale_min: number
  scale_max: number
  anchors: Record<string, string>
  order: number
}

export interface Teacher {
  id: string
  name: string
  phone: string | null
  school_name: string
  udise_code: string | null
  block_tag: string | null
  designation: string | null
  hm_name: string | null
  hm_phone: string | null
  cohort_id: string
  status: 'active' | 'inactive'
  created_at: string
}

export interface Assignment {
  teacher_id: string
  coach_id: string
  is_active: boolean
  assigned_at: string
}

export interface Session {
  id: string
  teacher_id: string
  coach_id: string
  session_type: SessionType
  scheduled_at: string
  status: SessionStatus
  focus_tag: string | null
  channel: 'google_meet' | 'phone' | 'in_person'
  meet_link: string | null
  duration_mins: number | null
  confirmation_status: ConfirmationStatus
  summary_sent_at: string | null
  next_touch_window: string | null
  tech_issue_flag: boolean
  created_at: string
  updated_at: string
}

export interface SessionNote {
  id: string
  session_id: string
  what_discussed: string | null
  what_decided: string | null
  teacher_practice_markers: Record<string, unknown>
  qualitative_comments: string | null
  collateral_refs: CollateralRef[]
  ai_draft_used: boolean
  ai_draft_text: string | null
  created_at: string
  updated_at: string
}

export interface CollateralRef {
  label: string
  url: string
}

export interface ActionStep {
  id: string
  session_id: string
  teacher_id: string
  description: string
  due_date: string | null
  status: ActionStepStatus
  carried_from_id: string | null
  created_at: string
}

export interface Reschedule {
  id: string
  session_id: string
  reason_category: string
  new_window: string | null
  counter: number
  created_at: string
}

export interface TeacherRYG {
  id: string
  teacher_id: string
  status: RYGStatus
  set_by: string
  set_at: string
  prior_status: RYGStatus | null
  dimensions_json: Record<string, unknown>
}

export interface MovementPlan {
  id: string
  teacher_id: string
  cm_id: string
  target_status: RYGStatus
  target_date: string | null
  actions: MovementAction[]
  created_at: string
  updated_at: string
}

export interface MovementAction {
  description: string
  assigned_to: string
  due_date: string | null
}

export interface Escalation {
  id: string
  trigger_type: 'reschedule_threshold' | 'vba_overdue' | 'chronic_non_confirmation' | 'manual'
  teacher_id: string
  coach_id: string
  cohort_id: string
  status: EscalationStatus
  auto_created_at: string
  resolution_category: string | null
  resolution_notes: string | null
  actioned_by: string | null
  actioned_at: string | null
}
