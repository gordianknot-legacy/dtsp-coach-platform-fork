import { WorkspaceShell } from '@/components/shell/WorkspaceShell'

export default function ObserverLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell role="observer">{children}</WorkspaceShell>
}
