export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-xl p-8 sm:p-10">
        {children}
      </div>
    </div>
  )
}
