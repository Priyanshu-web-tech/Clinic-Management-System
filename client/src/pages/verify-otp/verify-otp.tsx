import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import {
  useVerifyOtpMutation,
  useForgotPasswordMutation,
} from "@/store/api/auth-api-slice"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import {
  NAVIGATION_ROUTES,
  OTP_LENGTH,
  OTP_COOLDOWN_SECS,
} from "@/constants/constants"
import { formatTime, getStoredOtpSecondsLeft } from "@/utils/helpers"

const VerifyOtp = () => {
  const navigate = useNavigate()
  const [otp, setOtp] = useState("")
  const [secondsLeft, setSecondsLeft] = useState<number>(() =>
    getStoredOtpSecondsLeft(OTP_COOLDOWN_SECS)
  )
  const [isLoading, setIsLoading] = useState(false)
  const [verifyOtp] = useVerifyOtpMutation()
  const [forgotPassword, { isLoading: isResending }] =
    useForgotPasswordMutation()

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setTimeout(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearTimeout(id)
  }, [secondsLeft])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== OTP_LENGTH) {
      toast.error(`Please enter all ${OTP_LENGTH} digits.`)
      return
    }
    setIsLoading(true)
    try {
      const response = await verifyOtp({ otp }).unwrap()
      if (response?.success) {
        toast.success(response.message ?? "OTP verified successfully.")
        navigate(NAVIGATION_ROUTES.RESET_PASSWORD)
      } else {
        toast.error(response?.message ?? "OTP verification failed.")
      }
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Invalid OTP. Please try again."
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

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
        localStorage.setItem("otpSentAt", Date.now().toString())
        setSecondsLeft(OTP_COOLDOWN_SECS)
        setOtp("")
        toast.success(response.message ?? "OTP resent! Check your email.")
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

  return (
    <div className="flex max-h-[calc(100vh-3rem)] w-full max-w-sm flex-col rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="shrink-0 px-8 pt-8 pb-4">
        <h1 className="text-xl font-semibold text-foreground">Enter OTP</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent a {OTP_LENGTH}-digit code to your email. Enter it below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        {/* Scrollable fields */}
        <div className="flex-1 space-y-6 overflow-y-auto px-8">
          <div className="flex justify-center pb-2">
            <InputOTP
              maxLength={OTP_LENGTH}
              value={otp}
              onChange={setOtp}
              pattern={REGEXP_ONLY_DIGITS}
            >
              <InputOTPGroup className="gap-2">
                {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-8 pt-4 pb-8">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || otp.length !== OTP_LENGTH}
          >
            {isLoading && <Spinner className="mr-2" />}
            Verify OTP
          </Button>
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
      </form>
    </div>
  )
}

export default VerifyOtp
