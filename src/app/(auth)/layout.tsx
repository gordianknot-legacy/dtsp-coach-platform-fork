export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel — hidden on mobile, fills half on desktop */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] bg-[hsl(220,20%,18%)] flex-col justify-between p-10 lg:p-16">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-brand text-brand-foreground flex items-center justify-center text-base font-bold">
            DT
          </div>
          <span className="text-lg font-semibold text-white">DTSP</span>
        </div>

        <div className="max-w-md">
          <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight">
            Coaching that reaches every classroom.
          </h2>
          <p className="text-base text-white/60 mt-4 leading-relaxed">
            The District Teacher Support Programme platform helps coaches manage sessions, track progress, and support teachers across Uttar Pradesh.
          </p>
        </div>

        <p className="text-xs text-white/30">
          Central Square Foundation
        </p>
      </div>

      {/* Right form panel — full width on mobile, half on desktop */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
