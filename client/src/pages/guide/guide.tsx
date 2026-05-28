import { Link, useNavigate } from "react-router-dom"
import {
  Stethoscope,
  Users,
  UserRound,
  CalendarCheck,
  ClipboardList,
  Pill,
  ArrowLeft,
  Activity,
  UserCog,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { NAVIGATION_ROUTES } from "@/constants/constants"
import { useAppSelector } from "@/store/hook"
import type { LucideIcon } from "lucide-react"

type Role = "doctor" | "receptionist" | "chemist"

const ROLE_CONFIG: Record<
  Role,
  {
    label: string
    variant: "default" | "success" | "warning"
    description: string
    icon: LucideIcon
  }
> = {
  doctor: {
    label: "Doctor",
    variant: "default",
    description: "Manages the clinic, consults patients, and writes prescriptions.",
    icon: Stethoscope,
  },
  receptionist: {
    label: "Receptionist",
    variant: "success",
    description: "Registers patients and manages the visit queue.",
    icon: UserCog,
  },
  chemist: {
    label: "Chemist",
    variant: "warning",
    description: "Views and dispenses prescription medicines.",
    icon: Pill,
  },
}

const steps: { role: Role; title: string; description: string; icon: LucideIcon }[] = [
  {
    role: "doctor",
    title: "Register your clinic",
    description:
      "Sign up as a doctor — your account doubles as the clinic admin. A clinic profile is created automatically and you can configure it from your profile settings.",
    icon: Stethoscope,
  },
  {
    role: "doctor",
    title: "Build your team",
    description:
      "Add receptionists to manage the patient queue and chemists to handle prescriptions. Each staff member gets their own login with role-scoped access to only what they need.",
    icon: Users,
  },
  {
    role: "receptionist",
    title: "Register patients",
    description:
      "Add patients with their medical background — blood group, allergies, and chronic diseases. Each patient gets a unique code for fast lookup across visits.",
    icon: UserRound,
  },
  {
    role: "receptionist",
    title: "Add a patient to the queue",
    description:
      "When a patient arrives, register a visit. They're assigned a token number and placed in the waiting queue. All active staff see the update instantly — no manual refresh needed.",
    icon: CalendarCheck,
  },
  {
    role: "doctor",
    title: "Start consultation",
    description:
      "Pick the next waiting patient from the queue to begin consultation. Record symptoms and notes directly in the visit detail screen.",
    icon: Activity,
  },
  {
    role: "doctor",
    title: "Complete visit with prescription",
    description:
      "Add a diagnosis, a follow-up date, and medicines with dosage, frequency, and timing. Completing the visit generates a prescription and automatically emails a visit summary to the patient.",
    icon: ClipboardList,
  },
  {
    role: "chemist",
    title: "Dispense medicines",
    description:
      "New prescriptions appear in real-time on the chemist's screen the moment a doctor completes a visit. View medicine frequency, timing, and duration, then dispense accordingly.",
    icon: Pill,
  },
]

const Guide = () => {
  const navigate = useNavigate()
  const isSignedIn = useAppSelector((state) => state.userData.isSignedIn)

  return (
    <div className="h-screen overflow-y-auto bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
              <Stethoscope className="size-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">DocMate</span>
          </div>
          {isSignedIn ? (
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-1.5 size-3.5" />
              Back
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link to={NAVIGATION_ROUTES.LOGIN}>
                <ArrowLeft className="mr-1.5 size-3.5" />
                Back to Login
              </Link>
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            How DocMate works
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            DocMate connects your entire clinic team in one seamless workflow —<br className="hidden sm:block" />
            from patient registration all the way to prescription dispensing.
          </p>
        </div>

        {/* Role legend */}
        <div className="mb-12 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(Object.entries(ROLE_CONFIG) as [Role, (typeof ROLE_CONFIG)[Role]][]).map(
            ([, config]) => {
              const Icon = config.icon
              return (
                <div
                  key={config.label}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className="size-4 text-muted-foreground" />
                    <Badge variant={config.variant} className="text-[10px]">
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {config.description}
                  </p>
                </div>
              )
            }
          )}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute top-5 left-5 bottom-5 w-px bg-border" />

          <div className="space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              const role = ROLE_CONFIG[step.role]
              return (
                <div key={index} className="relative flex gap-5">
                  {/* Step number bubble */}
                  <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xs font-semibold text-foreground">
                    {index + 1}
                  </div>

                  {/* Content card */}
                  <div className="flex-1 rounded-lg border border-border bg-card p-4">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <Badge variant={role.variant} className="text-[10px]">
                        {role.label}
                      </Badge>
                      <h3 className="text-sm font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <Icon className="ml-auto size-4 shrink-0 text-muted-foreground/40" />
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        {!isSignedIn && (
          <div className="mt-14 flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-base font-semibold text-foreground">
              Ready to get started?
            </h2>
            <p className="text-xs text-muted-foreground">
              Set up your clinic in minutes — no configuration required.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to={NAVIGATION_ROUTES.REGISTER}>Register your clinic</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to={NAVIGATION_ROUTES.LOGIN}>Sign in</Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Guide
