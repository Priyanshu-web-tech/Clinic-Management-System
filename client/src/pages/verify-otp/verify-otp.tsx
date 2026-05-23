import { useRef, useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useFormik } from "formik"
import * as Yup from "yup"
import { toast } from "sonner"

import { useVerifyOtpMutation, useForgotPasswordMutation } from "@/store/api/authApiSlice"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { NAVIGATION_ROUTES } from "@/constants/constants"
import { cn } from "@/lib/utils"
import type { VerifyOtpFormValues } from "./verify-otp.types"

const OTP_LENGTH = 6
const OTP_COOLDOWN_SECS = 120 // 2 minutes

const getStoredSecondsLeft = (): number => {
  const raw = localStorage.getItem("otp_sent_at")
  if (!raw) return 0
  const sentAt = parseInt(raw, 10)
  return Math.max(0, Math.ceil((sentAt + OTP_COOLDOWN_SECS * 1000 - Date.now()) / 1000))
}

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

const VerifyOtp = () => {
  const navigate = useNavigate()
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation()
  const [forgotPassword, { isLoading: isResending }] = useForgotPasswordMutation()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const [secondsLeft, setSecondsLeft] = useState<number>(getStoredSecondsLeft)

  // Tick down every second, using setTimeout so the dependency on secondsLeft
  // correctly restarts the timer whenever secondsLeft changes.
  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setTimeout(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearTimeout(id)
  }, [secondsLeft])

  const formik = useFormik<VerifyOtpFormValues>({
    initialValues: { otp: "" },
    validationSchema: Yup.object({
      otp: Yup.string()
        .matches(/^\d+$/, "OTP must contain only digits")
        .length(OTP_LENGTH, `OTP must be ${OTP_LENGTH} digits`)
        .required("OTP is required"),
    }),
    onSubmit: async (values) => {
      try {
        const response = await verifyOtp({ otp: values.otp }).unwrap()
        if (response?.success) {
          toast.success("OTP verified successfully.")
          navigate(NAVIGATION_ROUTES.RESET_PASSWORD)
        } else {
          toast.error(response?.message ?? "OTP verification failed.")
        }
      } catch (err: unknown) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ??
          "Invalid OTP. Please try again."
        toast.error(message)
      }
    },
  })

  const handleResend = async () => {
    const email = localStorage.getItem("otp_email")
    if (!email) {
      toast.error("Session expired. Please start over.")
      navigate(NAVIGATION_ROUTES.FORGOT_PASSWORD)
      return
    }
    try {
      const response = await forgotPassword({ email }).unwrap()
      if (response?.success) {
        localStorage.setItem("otp_sent_at", Date.now().toString())
        setSecondsLeft(OTP_COOLDOWN_SECS)
        formik.resetForm()
        inputRefs.current[0]?.focus()
        toast.success("OTP resent! Check your email.")
      } else {
        toast.error(response?.message ?? "Failed to resend OTP.")
      }
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Failed to resend OTP. Please try again."
      toast.error(message)
    }
  }

  const digits = formik.values.otp.padEnd(OTP_LENGTH, "").split("").slice(0, OTP_LENGTH)

  const handleDigitChange = useCallback(
    (idx: number, char: string) => {
      if (!/^\d*$/.test(char)) return
      const next = digits.slice()
      next[idx] = char.slice(-1)
      const joined = next.join("").replace(/\s/g, "")
      formik.setFieldValue("otp", joined)
      if (char && idx < OTP_LENGTH - 1) {
        inputRefs.current[idx + 1]?.focus()
      }
    },
    [digits, formik],
  )

  const handleKeyDown = useCallback(
    (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        if (!digits[idx] && idx > 0) {
          inputRefs.current[idx - 1]?.focus()
        } else {
          const next = digits.slice()
          next[idx] = ""
          formik.setFieldValue("otp", next.join("").replace(/\s/g, ""))
        }
      }
    },
    [digits, formik],
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH)
      formik.setFieldValue("otp", pasted)
      const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1)
      inputRefs.current[focusIdx]?.focus()
    },
    [formik],
  )

  const hasError = !!(formik.touched.otp && formik.errors.otp)

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Enter OTP</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We sent a {OTP_LENGTH}-digit code to your email. Enter it below.
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-center gap-2">
              {Array.from({ length: OTP_LENGTH }).map((_, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digits[idx] === " " || !digits[idx] ? "" : digits[idx]}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  onFocus={(e) => e.target.select()}
                  className={cn(
                    "h-12 w-10 rounded-md border border-input bg-background text-center text-base font-semibold text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30",
                    hasError && "border-destructive ring-2 ring-destructive/20",
                  )}
                />
              ))}
            </div>
            {hasError && (
              <p className="text-center text-xs text-destructive">{formik.errors.otp}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Spinner className="mr-2" />}
            Verify OTP
          </Button>
        </form>

        <div className="mt-5 flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <span>Didn&apos;t receive a code?</span>
          {secondsLeft > 0 ? (
            <span className="font-medium text-foreground tabular-nums">
              Resend in {formatTime(secondsLeft)}
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="font-medium text-primary hover:underline disabled:pointer-events-none disabled:opacity-50"
            >
              {isResending ? "Sending…" : "Resend OTP"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerifyOtp
