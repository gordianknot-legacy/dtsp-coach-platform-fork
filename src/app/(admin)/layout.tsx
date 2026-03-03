import { WorkspaceShell } from '@/components/shell/WorkspaceShell'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell role="admin">{children}</WorkspaceShell>
}
