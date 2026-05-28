import { Check, Stethoscope, ArrowRight } from "lucide-react"
import { Link, Outlet } from "react-router-dom"
import { AUTH_FEATURES, NAVIGATION_ROUTES } from "@/constants/constants"

const AuthLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left branding panel — desktop only */}
      <div className="relative hidden flex-col items-center justify-center overflow-hidden bg-primary px-12 md:flex md:w-[42%]">
        <div className="pointer-events-none absolute -top-20 -left-20 size-64 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute top-16 right-0 size-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -right-16 -bottom-28 size-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute bottom-24 left-4 size-24 rounded-full bg-white/5" />

        <div className="relative z-10 flex max-w-xs flex-col items-center gap-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-white/15">
            <Stethoscope className="size-8 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Doc Mate
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              Smart healthcare documentation,
              <br />
              simplified for your team.
            </p>
          </div>

          <div className="h-px w-10 bg-white/20" />

          <div className="flex flex-col gap-3 text-left">
            {AUTH_FEATURES.map((feat) => (
              <div key={feat} className="flex items-start gap-3">
                <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Check className="size-3 text-white" />
                </div>
                <span className="text-sm text-white/80">{feat}</span>
              </div>
            ))}
          </div>

          <div className="h-px w-10 bg-white/20" />

          <Link
            to={NAVIGATION_ROUTES.GUIDE}
            className="group flex items-center gap-1.5 rounded-full border border-white/40 px-4 py-1.5 text-xs font-medium text-white/90 transition-colors hover:border-white/70 hover:bg-white/10 hover:text-white"
          >
            See how it works
            <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Right content panel */}
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-6">
        {/* Mobile-only logo */}
        <div className="mb-6 flex flex-col items-center gap-2 md:hidden">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <Stethoscope className="size-5 text-primary" />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground">
            Doc Mate
          </span>
          <Link
            to={NAVIGATION_ROUTES.GUIDE}
            className="text-xs text-muted-foreground transition-colors hover:text-primary hover:underline"
          >
            See how it works →
          </Link>
        </div>

        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
