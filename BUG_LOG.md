# DTSP Coach Platform — Bug Log

Generated: 2026-03-10

## CRITICAL (3)

- [x] **BUG-001** RYGBadge crashes on unknown status — `RYGBadge.tsx:17` no fallback for invalid status
- [x] **BUG-002** CM Coaches page crashes on empty coach list — `coaches/page.tsx:37` `.in()` with empty array
- [x] **BUG-003** SessionRow crashes if channel/confirmation_status is null — `SessionRow.tsx:41-42`

## HIGH (4)

- [x] **BUG-004** Dark mode completely broken — `globals.css:38-60` `@theme` inside `@media` is invalid in Tailwind v4
- [x] **BUG-005** TopNav role switcher has no loading state — `TopNav.tsx:186-194`
- [x] **BUG-006** TopNav role switcher has no error handling — `TopNav.tsx:190-194`
- [x] **BUG-007** Escalation display shows "undefined" for missing teacher/coach — `cm/page.tsx:92-94`

## MEDIUM (5)

- [x] **BUG-008** Mobile KPI grid too cramped (2-col on tiny phones) — `cm/page.tsx:70`, `admin/page.tsx:62`
- [x] **BUG-009** Auth layout has no branding on mobile/tablet — `(auth)/layout.tsx:6`
- [x] **BUG-010** Role-select description text nearly invisible (40% opacity) — `role-select/page.tsx:104`
- [x] **BUG-011** useEffect missing dependencies in CoachHome — `CoachHome.tsx:69-73`
- [x] **BUG-012** CoachHome tomorrow/week tabs have no error handling — `CoachHome.tsx:48-59`

## LOW (4)

- [x] **BUG-013** Middleware double-fetches profile — `middleware.ts:45+76`
- [x] **BUG-014** TopNav border uses hardcoded HSL instead of CSS variable — `TopNav.tsx:91`
- [ ] **BUG-015** Observer page is barebones placeholder — `observer/page.tsx` (intentional for alpha)
- [x] **BUG-016** Auth layout gradient text accessibility — `(auth)/layout.tsx:33,48`
