# DTSP Platform — Backend Architecture (Master Context File)

**Version:** 1.0  
**Last Updated:** February 27, 2026  
**Purpose:** Complete backend microservices architecture for DTSP coaching CRM platform

---

## Ground Rules (Never Violate These)

1. **Each service owns its own DB schema.** No service queries another service's tables directly — only via API calls.
2. **Every service validates the JWT from MS-1** before doing anything. Role + org_unit_id come from the token.
3. **All thresholds, rules, and definitions live in MS-2.** No other service hardcodes a number.
4. **AI (MS-10) never blocks a user action.** Every AI call is async and degrades gracefully.
5. **MS-11 (WhatsApp API) slot is prepared but not built.** Manual copy-paste covers MVP.

---

## Architecture Principles

**Modular Monolith for MVP:**
- Single PostgreSQL database instance (Supabase/Railway)
- Separate schemas per service
- API-only communication between services
- Independent deployability path preserved for future scaling

**Tech Stack:**
- **Backend:** FastAPI (Python) or Express (Node.js)
- **Database:** PostgreSQL (single instance, separate schemas)
- **Auth:** JWT tokens from MS-1
- **Event Bus:** Database polling for MVP, Redis Pub/Sub post-MVP
- **External APIs:** Google Meet, WhatsApp Business (post-MVP), UDISE bulk data

---

## Service Overview

| Service | Owns | Dependencies |
|---------|------|--------------|
| MS-1: Identity & Access | Auth, roles, tokens, activity logging | None (foundation) |
| MS-2: Org & Configuration | Hierarchy, standards, templates, rules, audit | MS-1 |
| MS-3: Roster & Assignment | Teacher/coach profiles, assignments, UDISE reference | MS-1, MS-2 |
| MS-4: Session & CRM | Coaching sessions, notes, action steps, RYG, movement plans | MS-1, MS-2, MS-3 |
| MS-5: VBA | VBA sessions, student assessments, protocol integrity | MS-1, MS-2, MS-4 |
| MS-6: Scheduling | Planning board, meeting links, reminder queue | MS-1, MS-2, MS-3, MS-4 |
| MS-7: Escalation | Auto-escalations, CM resolution, deferred items | MS-1, MS-2, MS-4, MS-5 |
| MS-8: Analytics & Reporting | KPIs, dashboards, exports (read-only) | MS-1, MS-4, MS-5, MS-7 |
| MS-9: Content | Content library, webinars, collateral | MS-1, MS-2 |
| MS-10: AI | Pre-session briefs, draft summaries, transcripts | MS-1, MS-4, MS-5, MS-9 |
| MS-11: WhatsApp (Slot) | Automated notifications via WhatsApp Business API | MS-1, MS-2, MS-6 (prepared, not built at MVP) |

---

## MS-1: Identity & Access Service

**Owns:** Authentication, role enforcement, session tokens, platform activity logging

### DB Schema

```sql
users
  id                UUID PRIMARY KEY
  name              VARCHAR(255)
  phone             VARCHAR(15) UNIQUE
  email             VARCHAR(255) UNIQUE
  role              ENUM('coach', 'coach_manager', 'program_admin', 'govt_observer')
  status            ENUM('active', 'inactive', 'pending_first_login')
  cohort_id         UUID (→ MS-2.org_units)
  created_at        TIMESTAMP

user_sessions
  id                UUID PRIMARY KEY
  user_id           UUID (→ users)
  token             TEXT UNIQUE
  expires_at        TIMESTAMP
  device            VARCHAR(255)
  created_at        TIMESTAMP

platform_events
  id                UUID PRIMARY KEY
  user_id           UUID (→ users)
  event_type        ENUM('login', 'session_opened', 'vba_workspace_opened', 
                         'summary_saved', 'feature_accessed')
  entity_type       VARCHAR(50)
  entity_id         UUID
  occurred_at       TIMESTAMP
  device            VARCHAR(255)
  session_token     TEXT
```

### API Surface

```
POST   /auth/login              → phone/email + password/OTP
POST   /auth/refresh            → refresh token
POST   /auth/logout             → invalidate token
GET    /auth/me                 → returns role + org_unit_id (consumed by all services)
GET    /activity/coach/:id      → login history, feature access (CM-only)
  ?period=                       → this_week/this_month/custom
```

### Notes

- **platform_events** is written by middleware that fires on every authenticated request — no manual instrumentation per screen
- Coach activity data (last login, zero-activity days) consumed by MS-8 for CM 1:1 workspace (Flow D)
- Govt observer role = read-only token, scoped to their state org unit
- Token lifetime: 24 hours (configurable)

---

## MS-2: Org & Configuration Service

**Owns:** Org hierarchy, program standards, session templates, escalation rules, RYG thresholds, reminder rules (prepared slot), audit trail

### DB Schema

```sql
org_units
  id                UUID PRIMARY KEY
  name              VARCHAR(255)
  type              ENUM('state', 'district', 'cohort')
  parent_id         UUID (→ org_units) NULL
  created_at        TIMESTAMP

program_standards
  id                UUID PRIMARY KEY
  org_unit_id       UUID (→ org_units)
  key               VARCHAR(100)
  value             TEXT
  overrides_default BOOLEAN
  updated_by        UUID (→ MS-1.users)
  updated_at        TIMESTAMP
  
  -- Standard keys (examples):
  -- weekly_call_target
  -- touches_per_teacher_per_month
  -- completion_definition
  -- active_teacher_window_days
  -- reschedule_escalation_threshold
  -- vba_overdue_week
  -- chronic_noconfirm_threshold
  -- spotcheck_quota_per_period
  -- spotcheck_lookback_days
  -- clean_week_completion_threshold
  -- repeated_notdone_flag_enabled
  -- no_focus_tag_amber_threshold
  -- async_touch_amber_threshold
  -- deferred_item_auto_clear_days

session_templates
  id                UUID PRIMARY KEY
  org_unit_id       UUID (→ org_units)
  focus_categories  JSONB  -- ['literacy', 'numeracy', 'relationship', 'off_script']
  required_fields   JSONB  -- ['what_discussed', 'what_decided', 'next_touch']
  vba_checklist_items JSONB
  rubric_dimensions JSONB  -- ['agenda_adherence', 'action_item_clarity', 'tone']
  rubric_scale      INTEGER  -- e.g., 5 for 1-5 scale
  rubric_anchors_json JSONB  -- scoring descriptions per dimension
  updated_by        UUID (→ MS-1.users)
  updated_at        TIMESTAMP

escalation_rules
  id                UUID PRIMARY KEY
  org_unit_id       UUID (→ org_units)
  trigger_type      ENUM('repeat_reschedule', 'vba_integrity', 
                         'chronic_noconfirm', 'vba_overdue', 
                         'missing_summaries', 'red_no_plan')
  threshold_value   INTEGER
  auto_action       TEXT
  active            BOOLEAN
  created_at        TIMESTAMP

ryg_thresholds
  id                UUID PRIMARY KEY
  org_unit_id       UUID (→ org_units)
  green_def         TEXT
  yellow_def        TEXT
  red_def           TEXT
  at_risk_days_threshold INTEGER
  configurable_dimensions_json JSONB
  updated_at        TIMESTAMP

reminder_rules                           -- ← PREPARED SLOT for MS-11
  id                UUID PRIMARY KEY
  cohort_id         UUID (→ org_units)
  trigger_type      ENUM('day_before_call', 'day_of_call', 'no_confirmation_nudge',
                         'post_vba_summary', 'missed_webinar_catchup')
  timing_offset_mins INTEGER
  template_id       UUID (→ MS-6.notification_templates)
  channel           ENUM('whatsapp', 'sms')
  active            BOOLEAN DEFAULT FALSE  -- FALSE at MVP
  created_by        UUID (→ MS-1.users)
  created_at        TIMESTAMP

audit_log
  id                UUID PRIMARY KEY
  actor_id          UUID (→ MS-1.users)
  action_type       VARCHAR(100)
  entity_type       VARCHAR(50)
  entity_id         UUID
  old_val           JSONB
  new_val           JSONB
  ts                TIMESTAMP
```

### API Surface

```
GET    /standards/:org_unit_id         → consumed by all services at init
GET    /templates/:org_unit_id
GET    /escalation-rules/:org_unit_id
GET    /ryg-thresholds/:org_unit_id
PUT    /standards/:org_unit_id         → Admin only
POST   /cohorts                        → create new cohort
PUT    /cohorts/:id/override-standards → cohort-specific overrides
GET    /health/config-complete/:cohort_id  → readiness checklist (Flow C item 28)
GET    /audit-log                      → Admin only
  ?entity_type=
  ?actor_id=
```

### Build Priority

**Build this first.** Seed with defaults before touching any other service.

---

## MS-3: Roster & Assignment Service

**Owns:** Teacher profiles, coach profiles, teacher↔coach assignments, assignment history, UDISE reference data

### DB Schema

```sql
teachers
  id                UUID PRIMARY KEY
  name              VARCHAR(255)
  designation       VARCHAR(100)
  phone             VARCHAR(15) UNIQUE
  school_name       VARCHAR(255)
  udise_code        VARCHAR(50)
  block_tag         VARCHAR(100)
  hm_name           VARCHAR(255)
  hm_phone          VARCHAR(15)
  grade             VARCHAR(20)
  cohort_id         UUID (→ MS-2.org_units)
  import_warnings   JSONB
  status            ENUM('active', 'inactive')
  created_at        TIMESTAMP

coaches
  id                UUID PRIMARY KEY
  user_id           UUID (→ MS-1.users)
  cohort_id         UUID (→ MS-2.org_units)
  status            ENUM('active', 'inactive')
  created_at        TIMESTAMP

assignments
  id                UUID PRIMARY KEY
  teacher_id        UUID (→ teachers)
  coach_id          UUID (→ coaches)
  assigned_at       TIMESTAMP
  assigned_by       UUID (→ MS-1.users)
  is_active         BOOLEAN

assignment_history
  id                UUID PRIMARY KEY
  teacher_id        UUID (→ teachers)
  prior_coach_id    UUID (→ coaches)
  new_coach_id      UUID (→ coaches)
  changed_at        TIMESTAMP
  changed_by        UUID (→ MS-1.users)
  reason            TEXT

roster_imports
  id                UUID PRIMARY KEY
  cohort_id         UUID (→ MS-2.org_units)
  filename          VARCHAR(255)
  imported_by       UUID (→ MS-1.users)
  total_rows        INTEGER
  hard_error_count  INTEGER
  warning_count     INTEGER
  imported_at       TIMESTAMP
  notes             TEXT

udise_reference                          -- ← state school reference data
  udise_code        VARCHAR(50) PRIMARY KEY
  school_name       VARCHAR(255)
  block             VARCHAR(100)
  district          VARCHAR(100)
  state             VARCHAR(100)
  school_type       VARCHAR(100)
  last_synced_at    TIMESTAMP
  source            ENUM('csv', 'portal')

reference_imports
  id                UUID PRIMARY KEY
  source_type       ENUM('udise_csv', 'state_portal', 'manual')
  imported_by       UUID (→ MS-1.users)
  imported_at       TIMESTAMP
  record_count      INTEGER
  notes             TEXT
```

### Validation Rules on Roster Import

**Hard errors (blocked from import):**
- Missing teacher phone
- Invalid phone format
- Duplicate teacher phone
- Missing UDISE code

**Warnings (importable with flag):**
- Unrecognised UDISE code (checked against `udise_reference`)
- Missing designation
- Missing HM name/number
- Missing block tag
- Duplicate name at same UDISE

### API Surface

```
POST   /roster/import                  → CSV validation + import
GET    /roster/import/:id/report       → validation report with errors/warnings
GET    /teachers                       → filtered portfolio queries
  ?coach_id=
  ?block=
  ?status=
  ?cohort_id=
GET    /teachers/:id                   → full profile
POST   /teachers/:id                   → manual add
PUT    /teachers/:id                   → update teacher record
POST   /assignments                    → teacher↔coach link
PUT    /assignments/:id/reassign       → reassign with history preservation
GET    /assignments/history/:teacher_id
GET    /coaches?cohort_id=
POST   /udise/import                   → reference data CSV upload
GET    /udise/:code                    → lookup single school
```

---

## MS-4: Session & CRM Service

**Owns:** All session records (coaching calls), action steps, confirmation states, reschedule records, post-call summaries, collateral logs, artifact receipts, teacher RYG, movement plans, Google Meet webhook data

### DB Schema

```sql
sessions
  id                UUID PRIMARY KEY
  teacher_id        UUID (→ MS-3.teachers)
  coach_id          UUID (→ MS-3.coaches)
  session_type      ENUM('coaching', 'vba')
  scheduled_at      TIMESTAMP
  status            ENUM('scheduled', 'completed', 'no_show', 'cancelled', 'rescheduled')
  focus_tag         ENUM('literacy', 'numeracy', 'relationship', 'off_script', NULL)
  channel           ENUM('meet', 'wa_video', 'audio', 'async')
  duration_mins     INTEGER
  tech_issue_flag   BOOLEAN
  confirmation_status ENUM('pending', 'received', 'nudged')
  summary_sent_at   TIMESTAMP
  next_touch_window TIMESTAMP
  created_at        TIMESTAMP
  closed_at         TIMESTAMP

session_notes
  id                UUID PRIMARY KEY
  session_id        UUID (→ sessions)
  what_discussed    TEXT
  what_decided      TEXT
  teacher_practice_markers JSONB
  qualitative_comments TEXT
  collateral_shared JSONB
  ai_draft_used     BOOLEAN

action_steps
  id                UUID PRIMARY KEY
  session_id        UUID (→ sessions)
  teacher_id        UUID (→ MS-3.teachers)
  description       TEXT
  due_date          DATE
  status            ENUM('open', 'done', 'not_done')
  carried_forward_from_id UUID (→ action_steps) NULL
  created_at        TIMESTAMP

reschedules
  id                UUID PRIMARY KEY
  session_id        UUID (→ sessions)
  reason_category   ENUM('beo_visit', 'duty', 'network', 'tech_issue', 
                         'teacher_request', 'other')
  new_window        TIMESTAMP
  requested_by      VARCHAR(50)
  counter           INTEGER  -- auto-increment per teacher
  created_at        TIMESTAMP

confirmations
  id                UUID PRIMARY KEY
  session_id        UUID (→ sessions)
  type              ENUM('day_before', 'day_of', 'nudge')
  sent_at           TIMESTAMP
  response_status   ENUM('pending', 'confirmed', 'no_response')
  reminder_text_used TEXT

teacher_ryg
  id                UUID PRIMARY KEY
  teacher_id        UUID (→ MS-3.teachers)
  status            ENUM('R', 'Y', 'G')
  set_by            UUID (→ MS-1.users)
  set_at            TIMESTAMP
  period_label      VARCHAR(50)
  dimensions_json   JSONB
  prior_status      ENUM('R', 'Y', 'G')

movement_plans
  id                UUID PRIMARY KEY
  teacher_id        UUID (→ MS-3.teachers)
  cm_id             UUID (→ MS-1.users)
  target_status     ENUM('Y', 'G')
  target_date       DATE
  actions           JSONB
  created_at        TIMESTAMP
  last_updated_at   TIMESTAMP

artifacts
  id                UUID PRIMARY KEY
  teacher_id        UUID (→ MS-3.teachers)
  session_id        UUID (→ sessions)
  type_tag          ENUM('weekly_assessment', 'taalika', 'aaklan', 'tracker_photo')
  storage_ref       TEXT
  received_at       TIMESTAMP
  requested_in_session_id UUID (→ sessions) NULL

meet_event_data                          -- ← Google Meet webhook
  id                UUID PRIMARY KEY
  session_id        UUID (→ sessions)
  meet_code         VARCHAR(50)
  host_join_time    TIMESTAMP
  teacher_join_time TIMESTAMP
  host_leave_time   TIMESTAMP
  teacher_leave_time TIMESTAMP
  actual_duration_mins INTEGER
  transcript_available BOOLEAN
  transcript_ref    TEXT
  raw_webhook_payload JSONB
  received_at       TIMESTAMP
```

### API Surface

```
POST   /sessions                       → create session record
PUT    /sessions/:id/status            → update outcome (completed/no_show/etc.)
POST   /sessions/:id/notes
POST   /sessions/:id/action-steps
PUT    /sessions/:id/close             → triggers smart prompt check via MS-10
GET    /sessions                       → coach's daily/weekly view
  ?coach_id=
  ?date=
  ?status=
GET    /sessions/:id                   → full session detail
GET    /teachers/:id/interaction-history → full timeline for CRM view
GET    /due-actions?coach_id=          → computed query (see below)
POST   /teacher-ryg
GET    /teacher-ryg/:teacher_id
POST   /movement-plans
PUT    /movement-plans/:id
POST   /artifacts
GET    /artifacts?teacher_id=&type=
POST   /webhooks/meet                  → receives Google Meet Activity API events
```

### Due Actions Query (Computed, Never Stored)

```sql
-- Sessions where closed_at IS NULL and status = 'completed'
UNION
-- Action steps where status = 'open' and due_date < now()
UNION
-- Sessions where summary_sent_at IS NULL and closed_at IS NOT NULL
```

---

## MS-5: VBA Service

**Owns:** VBA-specific session data, student rosters, per-student response capture, protocol/integrity ratings, classroom reports

**Extends an MS-4 session record — never duplicates it.** Every VBA has a parent `session_id` in MS-4.

### DB Schema

```sql
vba_sessions
  id                UUID PRIMARY KEY
  session_id        UUID (→ MS-4.sessions)  -- parent session record
  expected_student_count INTEGER
  protocol_adherence_score INTEGER  -- 1-5 scale
  sop_adherence_score INTEGER       -- 1-5 scale
  integrity_flag_count INTEGER
  observation_notes TEXT
  classroom_report_text TEXT
  report_sent_at    TIMESTAMP
  locked_at         TIMESTAMP

student_roster
  id                UUID PRIMARY KEY
  teacher_id        UUID (→ MS-3.teachers)
  name              VARCHAR(255)
  student_uid       VARCHAR(50)
  grade             VARCHAR(20)
  active            BOOLEAN

vba_student_results
  id                UUID PRIMARY KEY
  vba_session_id    UUID (→ vba_sessions)
  student_id        UUID (→ student_roster)
  assessment_status ENUM('assessed', 'absent')
  literacy_responses_json JSONB
  numeracy_responses_json JSONB
  integrity_flags   JSONB
  partial_save_ts   TIMESTAMP
  is_complete       BOOLEAN

vba_integrity_flags
  id                UUID PRIMARY KEY
  vba_session_id    UUID (→ vba_sessions)
  student_id        UUID (→ student_roster)
  flag_type         VARCHAR(100)
  note              TEXT
  flagged_at        TIMESTAMP
  escalated         BOOLEAN
  escalation_id     UUID (→ MS-7.escalations) NULL
```

### API Surface

```
GET    /vba/due-list?coach_id=         → who needs VBA this quarter
POST   /vba/sessions                   → initialise VBA (requires parent session_id from MS-4)
GET    /vba/sessions/:id
PATCH  /vba/sessions/:id/student/:student_id  → live per-student capture
                                               (idempotent, partial-save safe)
PUT    /vba/sessions/:id/protocol      → protocol + integrity ratings
POST   /vba/sessions/:id/close         → locks responses, triggers report generation
GET    /vba/sessions/:id/report        → classroom proficiency snapshot
GET    /vba/monitoring?cohort_id=      → CM monitoring view
```

### Critical Implementation Notes

- `PATCH /student/:id` is called on **every input** during live assessment
- Must be fast, idempotent, and never overwrite a previously complete entry
- Use field-level guards: only update fields present in payload

---

## MS-6: Scheduling Service

**Owns:** Weekly planning board, meeting link storage, reminder queue (manual phase), at-risk-today computation

### DB Schema

```sql
weekly_plans
  id                UUID PRIMARY KEY
  coach_id          UUID (→ MS-3.coaches)
  week_start        DATE
  capacity_target   INTEGER
  buffer_slots      INTEGER
  draft_status      ENUM('draft', 'confirmed')
  created_at        TIMESTAMP

planned_slots
  id                UUID PRIMARY KEY
  weekly_plan_id    UUID (→ weekly_plans)
  teacher_id        UUID (→ MS-3.teachers)
  proposed_window   TIMESTAMP
  meeting_link      TEXT
  agenda_checklist_id UUID
  slot_status       ENUM('draft', 'scheduled', 'completed', 'cancelled')

reminder_queue                           -- ← drives manual copy-paste MVP
  id                UUID PRIMARY KEY      -- will drive MS-11 sends post-MVP
  session_id        UUID (→ MS-4.sessions)
  teacher_id        UUID (→ MS-3.teachers)
  reminder_type     ENUM('day_before', 'day_of', 'nudge')
  template_text     TEXT
  generated_at      TIMESTAMP
  marked_sent_at    TIMESTAMP
  sent_by           UUID (→ MS-1.users)
  status            ENUM('queued', 'sent', 'failed')

notification_templates                   -- ← PREPARED SLOT for MS-11
  id                UUID PRIMARY KEY
  name              VARCHAR(255)
  language          ENUM('hi', 'en')
  body_text         TEXT
  variable_map      JSONB
  wa_template_name  VARCHAR(255)  -- approved Meta template ID
  active            BOOLEAN DEFAULT FALSE
```

### API Surface

```
POST   /planning/week
GET    /planning/week?coach_id=&week=
PUT    /planning/week/:id
POST   /slots/:id/generate-link        → creates + stores Google Meet link
GET    /reminders/today?coach_id=      → reminder queue for today (copy-paste)
PUT    /reminders/:id/mark-sent
GET    /at-risk-today?coach_id=        → unconfirmed + repeat no-pickup sort
```

### Meeting Link Rule

Link is stored in `planned_slots` (source of truth). When MS-4 creates a session record, it **copies** the link from the slot. This prevents "link created but not sent" failure mode.

---

## MS-7: Escalation Service

**Owns:** Escalation items, CM resolution log, deferred queue

**Event-driven:** Listens to events from MS-4 and MS-5. Never polls.

### DB Schema

```sql
escalations
  id                UUID PRIMARY KEY
  trigger_type      ENUM('repeat_reschedule', 'vba_integrity', 
                         'chronic_noconfirm', 'vba_overdue', 
                         'missing_summaries', 'red_no_plan')
  entity_type       VARCHAR(50)
  entity_id         UUID
  teacher_id        UUID (→ MS-3.teachers)
  coach_id          UUID (→ MS-3.coaches)
  cohort_id         UUID (→ MS-2.org_units)
  status            ENUM('open', 'in_progress', 'closed')
  auto_created_at   TIMESTAMP
  escalation_rule_id UUID (→ MS-2.escalation_rules)
  overdue_flag      BOOLEAN

escalation_actions
  id                UUID PRIMARY KEY
  escalation_id     UUID (→ escalations)
  cm_id             UUID (→ MS-1.users)
  resolution_category VARCHAR(100)
  notes             TEXT
  status_change     VARCHAR(50)
  actioned_at       TIMESTAMP

deferred_items
  id                UUID PRIMARY KEY
  cm_id             UUID (→ MS-1.users)
  entity_type       VARCHAR(50)
  entity_id         UUID
  note              TEXT
  deferred_at       TIMESTAMP
  auto_clear_at     TIMESTAMP  -- deferred_at + N days per MS-2 config
```

### Events That Create Escalations Automatically

| Event Source | Event | Rule Check | Action |
|---|---|---|---|
| MS-4 | `reschedule.created` | counter > MS-2 threshold | Create escalation |
| MS-5 | `vba.integrity_flag` | always | Create escalation |
| MS-4 | `session.closed` + no summary after N hours | MS-2 threshold | Create escalation |
| MS-4 | `ryg.set_to_red` + no movement plan | always | Create escalation |
| MS-5 | `vba.no_show` repeat | MS-2 threshold | Create escalation |

### API Surface

```
GET    /escalations                    → CM escalation queue
  ?coach_id=
  ?cohort_id=
  ?status=
  ?type=
PUT    /escalations/:id/action         → requires resolution_category + notes
GET    /escalations/overdue?cohort_id= → open beyond threshold → flags to Admin
POST   /deferred
DELETE /deferred/:id
GET    /deferred?cm_id=
```

---

## MS-8: Analytics & Reporting Service

**Owns:** All aggregated KPIs, snapshot data, trend computations, exports

**Read-only from other services.** Never writes to operational tables.

### Materialized Views (Refreshed every 15 min or on `session.closed` event)

```sql
coach_kpi_rollup
  coach_id          UUID
  period            VARCHAR(50)
  completion_rate   DECIMAL
  reschedule_rate   DECIMAL
  confirmation_rate DECIMAL
  missing_summaries_count INTEGER
  vba_completion_rate DECIMAL
  avg_agenda_adherence DECIMAL
  spotcheck_trend_json JSONB  -- last 4 periods

portfolio_health
  cohort_id         UUID
  period            VARCHAR(50)
  total_teachers    INTEGER
  active_teachers   INTEGER
  at_risk_count     INTEGER
  ryg_distribution_json JSONB
  call_funnel_json  JSONB
  vba_funnel_json   JSONB
  intervention_mix_json JSONB
  channel_mix_json  JSONB
  webinar_reach_json JSONB

coach_spotcheck_trend
  coach_id          UUID
  period            VARCHAR(50)
  agenda_adherence  DECIMAL[]
  action_clarity_trend DECIMAL[]
  tone_distribution_json JSONB

teacher_health_snapshot
  teacher_id        UUID
  days_since_last_touch INTEGER
  touch_count_this_period INTEGER
  trend             ENUM('improving', 'stable', 'worsening')
  reschedule_count  INTEGER
  vba_status_this_quarter VARCHAR(50)
```

### Cache Strategy

- **Cache key:** `cohort_id + period + metric_type`
- **Bust on:** `session.closed` event
- **TTL:** 15 minutes for MVP

### API Surface

```
GET    /kpis/coach/:id?period=         → pre-compiled for 1:1 workspace open (Flow D)
GET    /kpis/portfolio/:cohort_id?period=  → ops review card (Flow D home)
GET    /snapshot/:cohort_id?period=    → full leadership snapshot payload (Flow E)
GET    /teachers/health?coach_id=&period=  → at-risk teacher list with trends
GET    /spotcheck/trend/:coach_id?periods= → last N periods trend data
GET    /exports/csv                    → CSV export for state reviews
  ?cohort_id=
  ?period=
  ?type=
POST   /exports/pdf/snapshot           → formatted PDF for Flow E export button
GET    /activity/coach/:id?period=     → platform usage (from MS-1 events)
```

### Front-End Rule (Critical)

**Dashboards and CM views call MS-8 only — never MS-4 or MS-5 directly for display data.** This is the single most important token-efficiency decision for future front-end builds.

---

## MS-9: Content Service

**Owns:** Central content library, webinar records, attendance tracking, session collateral

### DB Schema

```sql
content_items
  id                UUID PRIMARY KEY
  title             VARCHAR(255)
  type              ENUM('pdf', 'image', 'webinar', 'tg_link')
  storage_ref       TEXT
  tags              TEXT[]
  searchable_text   TEXT
  uploaded_by       UUID (→ MS-1.users)
  created_at        TIMESTAMP

webinars
  id                UUID PRIMARY KEY
  title             VARCHAR(255)
  scheduled_at      TIMESTAMP
  recording_link    TEXT
  summary_link      TEXT
  catchup_link      TEXT
  created_by        UUID (→ MS-1.users)

webinar_attendance
  id                UUID PRIMARY KEY
  webinar_id        UUID (→ webinars)
  teacher_id        UUID (→ MS-3.teachers)
  attended          BOOLEAN
  catchup_sent_at   TIMESTAMP
  no_engagement     BOOLEAN

session_collateral
  id                UUID PRIMARY KEY
  session_id        UUID (→ MS-4.sessions)
  content_item_id   UUID (→ content_items)
  shared_via        ENUM('screen_share', 'whatsapp')
  shared_at         TIMESTAMP
```

### API Surface

```
GET    /content?tags=&type=&q=         → library search
POST   /content                        → upload item (Admin/CM)
POST   /content/attach-to-session      → quick share from session
GET    /webinars
GET    /webinars/:id/attendance
PUT    /webinars/attendance/:id        → mark catchup sent
GET    /webinars/teacher/:id           → teacher's webinar history
```

---

## MS-10: AI Service

**Owns:** Pre-session briefs, draft summaries, transcript processing, smart prompts, quality signals

### DB Schema

```sql
ai_requests
  id                UUID PRIMARY KEY
  request_type      ENUM('pre_brief', 'draft_summary', 
                         'smart_prompt', 'transcript_quality')
  session_id        UUID (→ MS-4.sessions)
  input_payload     JSONB
  output_text       TEXT
  model_used        VARCHAR(100)
  tokens_used       INTEGER
  latency_ms        INTEGER
  status            ENUM('success', 'partial', 'unavailable')
  created_at        TIMESTAMP

transcripts
  id                UUID PRIMARY KEY
  session_id        UUID (→ MS-4.sessions)
  raw_text          TEXT
  language          VARCHAR(10)
  source            ENUM('realtime', 'upload', 'meet_webhook')
  created_at        TIMESTAMP

quality_signals
  id                UUID PRIMARY KEY
  session_id        UUID (→ MS-4.sessions)
  talk_time_ratio   DECIMAL
  signal_source     ENUM('transcript', 'tags', 'spotcheck')
  computed_at       TIMESTAMP
```

### API Surface

```
POST   /ai/pre-session-brief/:session_id   → called on "Pre-session brief" click
POST   /ai/draft-summary/:session_id       → called on "End call" before After Call screen
POST   /ai/transcribe                      → upload-based or Meet webhook trigger
GET    /ai/smart-prompt/:session_id        → checks required fields before session close
GET    /ai/quality-signals/:session_id     → conditional on transcript existing
```

### Non-Blocking Contract

Every endpoint returns:
```json
{
  "status": "success" | "partial" | "unavailable",
  "data": { ... }
}
```

**Front end never waits on AI.** If unavailable, structured fields show blank, not error.

---

## MS-11: WhatsApp Notification Service ← PREPARED SLOT

**Not built at MVP.** Schema defined in MS-6 (`reminder_queue`, `notification_templates`). Rules defined in MS-2 (`reminder_rules`, active = false).

### When Built, It Will:

- Consume `reminder_queue` from MS-6 (already exists)
- Send via WhatsApp Business API through BSP (Interakt/Wati)
- Write delivery status back to `reminder_queue.status`
- Require Meta template pre-approval before any send

### Required Before Building MS-11:

1. WhatsApp Business account linked to verified business entity
2. BSP account (Interakt/Wati) setup
3. All message templates submitted to Meta and approved
4. Test templates on small cohort first

### Zero Changes to Existing Services When MS-11 Is Added:

- MS-2, MS-4, MS-6, MS-8 remain unchanged
- Only MS-11 consumes the prepared slot

---

## Service Dependency Map

```
MS-1 (Identity)
    ↓ token validation
ALL SERVICES

MS-2 (Org/Config) ← standards/rules read by all services
    ↓ seeds
MS-3 (Roster)
    ↓ teacher/coach IDs
MS-4 (Session)  ←→  MS-5 (VBA)  [VBA extends session record]
    ↓ events
MS-6 (Scheduling)  ← reads MS-3 + MS-4
MS-7 (Escalations) ← listens to MS-4 + MS-5 events
    ↓ aggregates
MS-8 (Analytics)   ← reads MS-4, MS-5, MS-7 (read-only)
    ↓ content lookup
MS-9 (Content)     ← referenced by MS-4 session_collateral
MS-10 (AI)         ← reads MS-4, MS-5, MS-9 / writes drafts to MS-4
```

---

## Build & Deploy Sequence

| Stage | Services | Testable Milestone | Days |
|---|---|---|---|
| 1 | MS-1 + MS-2 | Login works, roles enforced, cohort setup, standards configured | 2-3 |
| 2 | MS-3 | CSV import validates, assignments work, UDISE reference loads | 1-2 |
| 3 | MS-4 + MS-6 | Full call lifecycle: schedule → confirm → call → close → summary | 4-6 |
| 4 | MS-7 | Escalations auto-fire from stage 3 data | 1 |
| 5 | MS-5 | VBA workspace, live student capture, classroom report | 2-3 |
| 6 | MS-8 | CM ops dashboard, 1:1 workspace, leadership snapshot | 2-3 |
| 7 | MS-9 | Content library, collateral attach from session | 1 |
| 8 | MS-10 + Meet webhook | AI brief, draft summary, webhook enriches session record | 1-2 |

**Total estimated:** ~2-3 months of Claude Code sessions at $20/month subscription

---

## External System Integrations

| System | Integration Type | What It Provides | How It Connects |
|--------|------------------|------------------|-----------------|
| **Google Meet** | API + Webhook | Meeting links, join/leave times, duration, transcript (conditional) | Meet Activity API webhook to MS-4 |
| **WhatsApp** | Manual (MVP) → API (Post-MVP) | Reminder/summary delivery | Copy-paste → WhatsApp Business API via BSP |
| **UDISE / State Portal** | Bulk CSV (MVP) → API (Future) | School reference data for validation | CSV upload to MS-3 → future: periodic sync API |
| **Platform Itself** | Event logging | Coach activity, login history | Middleware writes to MS-1 `platform_events` |

### Google Meet Webhook Setup

**Requirements:**
- Google Workspace account (not personal Gmail)
- Meet Activity API enabled in Google Cloud Console
- Webhook endpoint configured: `POST /webhooks/meet` in MS-4

**What it provides:**
- Session end time
- Participant join/leave times
- Duration (derived)
- Transcript (if host enabled transcription)

**Latency:** 5-30 minutes after call ends — webhook enriches record silently, doesn't block coach workflow

### WhatsApp Business API (Post-MVP)

**Requirements:**
- WhatsApp Business account
- Business verification complete
- BSP account (Interakt/Wati recommended)
- All message templates pre-approved by Meta

**Cost:** ₹3,000-6,000/month at DTSP volumes

---

## Claude Code Session Template

Paste this at the start of every build session to maintain tight context:

```
Platform: DTSP coaching CRM
Current service: MS-[N] — [Name]

This service owns:
[paste relevant schema section]

It reads from:
[list other service APIs it calls]

It does NOT touch:
[list everything else]

Active decisions:
- WA API is post-MVP (MS-11 slot prepared in MS-2 + MS-6)
- AI never blocks user actions
- MS-8 is the only service front end calls for dashboard data
- Due actions are computed queries, never stored tables
- Meeting links stored in MS-6, copied to MS-4 on session create
- Cross-service communication through APIs only, never direct DB queries

Task today:
[your specific task]
```

---

## Flexibility & Future-Proofing

### Where Changes Don't Require Code

1. **MS-2 holds all rules as data** — change thresholds, add focus categories, modify RYG definitions via Admin UI
2. **JSON fields for evolving structures** — rubric dimensions, call funnel metrics, resolution categories stored as JSON
3. **Key-value pattern in program_standards** — new settings = new rows, no schema changes

### Where Code Changes Are Required (But Isolated)

| Scenario | Impact | Complexity |
|----------|--------|------------|
| New session type (e.g., group call) | MS-4 only | Small |
| New role (e.g., Block Education Officer) | MS-1 + MS-8 scoping | Medium |
| New service (e.g., MS-11 WhatsApp) | Additive, slot prepared | Planned |
| New metric in snapshot | MS-8 only | Small |

### The Discipline That Preserves Flexibility

**Cross-service communication stays through APIs, never direct DB queries.** The moment one service imports another's DB client and queries its tables directly, you've coupled them — and every future schema change breaks silently.

**In every Claude Code session:** *"This service does not import or query any other service's database. If it needs data from MS-3, it calls `GET /teachers/:id`."*

---

## Token Budget Management

### Claude Code $20/Month Subscription

- ~$20 of API usage
- Typical session: $0.50-$2.00
- **Realistic: 10-20 productive sessions per month**

### What Actually Slows You Down

1. **Decision debt** — unclear specs burn tokens in back-and-forth
2. **Testing gaps** — seeding test data takes 1 session per service
3. **Context reloading** — 10-15% of each session spent re-establishing context
4. **Integration bugs** — 1 debugging session per cross-service integration

### The Single Most Important Habit

**Maintain a running context file** — a single markdown doc with:
- Current DB schema (all tables, all fields)
- Service boundaries (what each owns)
- API contracts (what MS-7 expects from MS-4)
- Decisions made (WA API post-MVP, etc.)

Paste relevant section at start of every Claude Code session. **Saves 30-40% of token budget** across entire build.

---

## Success Checklist

Before moving to front-end:

- [ ] Each API returns the right data for exact scenarios in flows
- [ ] Cross-service calls work (MS-7 fires escalation when MS-4 logs 3rd reschedule)
- [ ] Role scoping is airtight (coach token cannot retrieve other coach's teachers)
- [ ] Test data covers edge cases (teacher with 0 sessions, coach with all no-shows)
- [ ] One-paragraph description written for each API endpoint
- [ ] Master context file up to date with all schema changes

**When backend behaves (not just runs), front-end becomes mechanical** — you're just deciding how to display data that already exists correctly.

---

**End of Document**

---

## Document Control

- **Version:** 1.0
- **Owner:** DTSP Product Team
- **Last Reviewed:** February 27, 2026
- **Next Review:** Post Stage 3 completion (after MS-4 + MS-6 build)
- **Change Log:** Initial comprehensive architecture document