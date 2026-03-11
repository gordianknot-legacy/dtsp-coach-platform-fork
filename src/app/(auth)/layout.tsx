export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card shadow-lg p-8">
        {children}
      </div>
    </div>
  )
}
