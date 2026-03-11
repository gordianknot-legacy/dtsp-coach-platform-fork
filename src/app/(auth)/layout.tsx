export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50/30 to-slate-100 px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand accent stripe */}
        <div className="h-1.5 bg-gradient-to-r from-brand via-primary to-brand rounded-t-2xl" />
        <div className="rounded-b-2xl border border-t-0 border-border bg-card shadow-xl p-8 sm:p-10">
          {children}
        </div>
      </div>
    </div>
  )
}
