import * as Yup from "yup"
import { useState } from "react"
import { useFormik } from "formik"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

import { useResetPasswordMutation } from "@/store/api/auth-api-slice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { NAVIGATION_ROUTES } from "@/constants/constants"
import { registerPasswordValidation, confirmPasswordValidation } from "@/utils/validations"
import type { ResetPasswordFormValues } from "./reset-password.types"

const ResetPassword = () => {
  const navigate = useNavigate()
  const [resetPassword, { isLoading }] = useResetPasswordMutation()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const formik = useFormik<ResetPasswordFormValues>({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema: Yup.object({
      password: registerPasswordValidation,
      confirmPassword: confirmPasswordValidation("password"),
    }),
    onSubmit: async (values) => {
      try {
        const response = await resetPassword(values).unwrap()
        if (response?.success) {
          toast.success(response.message ?? "Password reset successfully. Please sign in.")
          navigate(NAVIGATION_ROUTES.LOGIN)
        } else {
          toast.error(response?.message ?? "Failed to reset password.")
        }
      } catch (err: unknown) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ??
          "Failed to reset password. Please try again."
        toast.error(message)
      }
    },
  })

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card shadow-sm flex flex-col max-h-[calc(100vh-3rem)]">

      {/* Header */}
      <div className="px-8 pt-8 pb-4 shrink-0">
        <h1 className="text-xl font-semibold text-foreground">Reset password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a strong new password for your account.
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="flex flex-col flex-1 min-h-0">

        {/* Scrollable fields */}
        <div className="flex-1 overflow-y-auto px-8 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="password">New password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={!!(formik.touched.password && formik.errors.password)}
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-xs text-destructive">{formik.errors.password}</p>
            )}
          </div>

          <div className="space-y-1 pb-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={!!(formik.touched.confirmPassword && formik.errors.confirmPassword)}
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <p className="text-xs text-destructive">{formik.errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pt-4 pb-8 shrink-0">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Spinner className="mr-2" />}
            Reset password
          </Button>
        </div>

      </form>
    </div>
  )
}

export default ResetPassword
