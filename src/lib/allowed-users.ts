// Whitelist of allowed email addresses that can access the platform.
// These users can choose any role and switch between roles.
export const ALLOWED_EMAILS = [
  'idi@centralsquarefoundation.org',
  'deergha@centralsquarefoundation.org',
  'sanjay@centralsquarefoundation.org',
  'anirudh.s@centralsquarefoundation.org',
] as const

export function isAllowedEmail(email: string): boolean {
  return ALLOWED_EMAILS.includes(email.toLowerCase() as typeof ALLOWED_EMAILS[number])
}
