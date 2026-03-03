import { WorkspaceShell } from '@/components/shell/WorkspaceShell'

export default function CMLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell role="cm">{children}</WorkspaceShell>
}
