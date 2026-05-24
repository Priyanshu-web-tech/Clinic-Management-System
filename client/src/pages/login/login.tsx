import * as Yup from "yup"
import { useState } from "react"
import { useFormik } from "formik"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

import { useLoginMutation } from "@/store/api/authApiSlice"
import { setUserData } from "@/store/slices/userDataSlice"
import { useAppDispatch } from "@/store/hook"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { NAVIGATION_ROUTES } from "@/constants/constants"
import { emailValidation, requiredFieldValidation } from "@/utils/validations"
import type { LoginFormValues } from "./login.types"

const Login = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [login, { isLoading }] = useLoginMutation()
  const [showPassword, setShowPassword] = useState(false)

  const formik = useFormik<LoginFormValues>({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: emailValidation,
      password: requiredFieldValidation("Password"),
    }),
    onSubmit: async (values) => {
      try {
        const response = await login(values).unwrap()
        if (response?.success) {
          const { user } = response.result
          dispatch(
            setUserData({
              _id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              userType: user.userType,
              createdAt: "",
              updatedAt: "",
            })
          )
          navigate(NAVIGATION_ROUTES.DASHBOARD)
        } else {
          toast.error(response?.message ?? "Login failed.")
        }
      } catch (err: unknown) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ??
          "Login failed. Please try again."
        toast.error(message)
      }
    },
  })

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card shadow-sm flex flex-col max-h-[calc(100vh-3rem)]">

      {/* Header */}
      <div className="px-8 pt-8 pb-4 shrink-0">
        <h1 className="text-xl font-semibold text-foreground">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back — enter your credentials to continue
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="flex flex-col flex-1 min-h-0">

        {/* Scrollable fields */}
        <div className="flex-1 overflow-y-auto px-8 space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-medium text-foreground">
              Email
            </label>
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

          <div className="space-y-1 pb-2">
            <label htmlFor="password" className="text-xs font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="pr-9"
                aria-invalid={!!(formik.touched.password && formik.errors.password)}
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

          <div className="flex justify-end">
            <Link
              to={NAVIGATION_ROUTES.FORGOT_PASSWORD}
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pt-4 pb-8 shrink-0">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Spinner className="mr-2" />}
            Sign in
          </Button>
          <p className="mt-5 text-center text-xs text-muted-foreground">
            New to DocMate?{" "}
            <Link to={NAVIGATION_ROUTES.REGISTER} className="font-medium text-primary hover:underline">
              Register as a Doctor
            </Link>
          </p>
        </div>

      </form>
    </div>
  )
}

export default Login
