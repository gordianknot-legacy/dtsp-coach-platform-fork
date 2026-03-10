export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel — gradient with pattern */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, hsl(220 82% 20%) 0%, hsl(220 70% 28%) 50%, hsl(240 50% 22%) 100%)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }} />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg border border-white/10">
              D
            </div>
            <div>
              <p className="font-semibold text-white text-base leading-none tracking-tight">DTSP</p>
              <p className="text-[12px] mt-1 leading-none text-blue-200/70">
                Coach Platform
              </p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white leading-tight tracking-tight">
            District Teacher<br />Support Programme
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-blue-100/60 max-w-[300px]">
            Empowering field coordinators to support and uplift primary school teachers across Uttar Pradesh.
          </p>

          {/* Feature highlights */}
          <div className="mt-10 space-y-4">
            {[
              { label: 'Session tracking', desc: 'Manage coaching calls and visits' },
              { label: 'Teacher progress', desc: 'RYG status and movement plans' },
              { label: 'Team oversight', desc: 'Cluster-level analytics and escalations' },
            ].map((f) => (
              <div key={f.label} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-300/50 mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white/90">{f.label}</p>
                  <p className="text-xs text-blue-200/50">{f.desc}</p>
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
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gradient-to-br from-slate-50 to-blue-50/30">
        {children}
      </div>
    </div>
  )
}
