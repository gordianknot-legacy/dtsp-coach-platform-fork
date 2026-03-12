// Any @centralsquarefoundation.org email can access the platform.
const ALLOWED_DOMAIN = 'centralsquarefoundation.org'

export function isAllowedEmail(email: string): boolean {
  return email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)
}
