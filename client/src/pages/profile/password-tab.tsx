import * as Yup from "yup"
import { useState } from "react"
import { useFormik } from "formik"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

import { useChangePasswordMutation } from "@/store/api/auth-api-slice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  registerPasswordValidation,
  confirmPasswordValidation,
} from "@/utils/validations"
import type { ChangePasswordFormValues } from "./profile.types"

const PasswordToggle = ({
  show,
  onClick,
}: {
  show: boolean
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
  >
    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
  </button>
)

const PasswordTab = () => {
  const [changePassword, { isLoading }] = useChangePasswordMutation()
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const toggle = (field: keyof typeof show) =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }))

  const formik = useFormik<ChangePasswordFormValues>({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required("Current password is required"),
      newPassword: registerPasswordValidation,
      confirmPassword: confirmPasswordValidation("newPassword"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await changePassword(values).unwrap()
        if (response?.success) {
          toast.success(response.message ?? "Password changed successfully.")
          resetForm()
        } else {
          toast.error(response?.message ?? "Failed to change password.")
        }
      } catch (err: unknown) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ??
          "Failed to change password."
        toast.error(message)
      }
    },
  })

  return (
    <div className="max-w-sm space-y-5">
      <div>
        <p className="text-sm font-medium text-foreground">
          Change your password
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Must be at least 8 characters with uppercase, lowercase, number and
          special character.
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="currentPassword">Current password</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              name="currentPassword"
              type={show.current ? "text" : "password"}
              placeholder="••••••••"
              value={formik.values.currentPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="pr-9"
              aria-invalid={
                !!(
                  formik.touched.currentPassword &&
                  formik.errors.currentPassword
                )
              }
            />
            <PasswordToggle
              show={show.current}
              onClick={() => toggle("current")}
            />
          </div>
          {formik.touched.currentPassword && formik.errors.currentPassword && (
            <p className="text-xs text-destructive">
              {formik.errors.currentPassword}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="newPassword">New password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              name="newPassword"
              type={show.new ? "text" : "password"}
              placeholder="••••••••"
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="pr-9"
              aria-invalid={
                !!(formik.touched.newPassword && formik.errors.newPassword)
              }
            />
            <PasswordToggle show={show.new} onClick={() => toggle("new")} />
          </div>
          {formik.touched.newPassword && formik.errors.newPassword && (
            <p className="text-xs text-destructive">
              {formik.errors.newPassword}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={show.confirm ? "text" : "password"}
              placeholder="••••••••"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="pr-9"
              aria-invalid={
                !!(
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                )
              }
            />
            <PasswordToggle
              show={show.confirm}
              onClick={() => toggle("confirm")}
            />
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {formik.errors.confirmPassword}
            </p>
          )}
        </div>

        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading && <Spinner className="mr-2" />}
          Update password
        </Button>
      </form>
    </div>
  )
}

export default PasswordTab
