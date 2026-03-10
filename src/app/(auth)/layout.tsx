export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[380px] shrink-0 p-10 relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, hsl(220 72% 24%) 0%, hsl(224 50% 18%) 100%)',
        }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center text-white font-bold text-sm border border-white/10">
              D
            </div>
            <div>
              <p className="font-semibold text-white text-sm leading-none tracking-tight">DTSP</p>
              <p className="text-[11px] mt-1 leading-none text-blue-200/60">Coach Platform</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white leading-tight tracking-tight">
            District Teacher<br />Support Programme
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-blue-100/70 max-w-[280px]">
            Empowering field coordinators to support primary school teachers across Uttar Pradesh.
          </p>

          <div className="mt-8 space-y-3">
            {[
              { label: 'Session tracking', desc: 'Manage coaching calls and visits' },
              { label: 'Teacher progress', desc: 'RYG status and movement plans' },
              { label: 'Team oversight', desc: 'Cluster-level analytics and escalations' },
            ].map((f) => (
              <div key={f.label} className="flex items-start gap-2.5">
                <div className="w-1 h-1 rounded-full bg-blue-300/50 mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white/85">{f.label}</p>
                  <p className="text-xs text-blue-200/60">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-blue-200/30 relative z-10">
          Central Square Foundation
        </p>
      </div>

      {/* Right login area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background">
        {/* Mobile-only branding */}
        <div className="lg:hidden w-full max-w-[380px] mb-6 pb-4 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
            District Teacher Support Programme
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
