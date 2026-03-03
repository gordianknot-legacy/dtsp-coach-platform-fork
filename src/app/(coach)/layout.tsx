import { WorkspaceShell } from '@/components/shell/WorkspaceShell'

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell role="coach">{children}</WorkspaceShell>
}
