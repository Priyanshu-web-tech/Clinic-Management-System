import { Stethoscope } from "lucide-react"

const Loader = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-5 bg-background">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 animate-pulse">
        <Stethoscope className="size-8 text-primary" />
      </div>

      <span className="font-heading text-base font-semibold tracking-tight text-foreground">
        Doc Mate
      </span>

      <div className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
        <span className="size-2 rounded-full bg-primary animate-bounce" />
      </div>
    </div>
  )
}

export default Loader
