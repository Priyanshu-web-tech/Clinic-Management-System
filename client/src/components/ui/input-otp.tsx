import { OTPInput, OTPInputContext } from "input-otp"
import { Minus } from "lucide-react"
import { useContext } from "react"

import { cn } from "@/lib/utils"

const InputOTP = ({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & { containerClassName?: string }) => (
  <OTPInput
    data-slot="input-otp"
    containerClassName={cn(
      "flex items-center gap-2 has-disabled:opacity-50",
      containerClassName
    )}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
)

const InputOTPGroup = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="input-otp-group"
    className={cn("flex items-center", className)}
    {...props}
  />
)

const InputOTPSlot = ({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & { index: number }) => {
  const inputOTPContext = useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      data-has-fake-caret={hasFakeCaret}
      className={cn(
        "relative flex h-12 w-10 items-center justify-center rounded-md border border-input bg-background text-base font-semibold text-foreground transition-all",
        "data-[active=true]:border-ring data-[active=true]:ring-2 data-[active=true]:ring-ring/30",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  )
}

const InputOTPSeparator = ({ ...props }: React.ComponentProps<"div">) => (
  <div data-slot="input-otp-separator" role="separator" {...props}>
    <Minus />
  </div>
)

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
