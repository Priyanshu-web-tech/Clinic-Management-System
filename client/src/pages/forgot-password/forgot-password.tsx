import * as Yup from "yup"
import { useFormik } from "formik"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useForgotPasswordMutation } from "@/store/api/authApiSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { NAVIGATION_ROUTES } from "@/constants/constants"
import { emailValidation } from "@/utils/validations"
import type { ForgotPasswordFormValues } from "./forgot-password.types"

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

  const formik = useFormik<ForgotPasswordFormValues>({
    initialValues: { email: "" },
    validationSchema: Yup.object({ email: emailValidation }),
    onSubmit: async (values) => {
      try {
        const response = await forgotPassword(values).unwrap()
        if (response?.success) {
          localStorage.setItem("otp_email", values.email)
          localStorage.setItem("otp_sent_at", Date.now().toString())
          toast.success("OTP sent! Check your email.")
          navigate(NAVIGATION_ROUTES.VERIFY_OTP)
        } else {
          toast.error(response?.message ?? "Failed to send OTP.")
        }
      } catch (err: unknown) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ??
          "Failed to send OTP. Please try again."
        toast.error(message)
      }
    },
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Forgot password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a one-time password.
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={!!(formik.touched.email && formik.errors.email)}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-xs text-destructive">{formik.errors.email}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Spinner className="mr-2" />}
            Send OTP
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Remember your password?{" "}
          <Link
            to={NAVIGATION_ROUTES.LOGIN}
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
