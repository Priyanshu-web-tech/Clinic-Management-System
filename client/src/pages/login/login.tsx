import * as Yup from "yup"
import { useFormik } from "formik"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useLoginMutation } from "@/store/api/authApiSlice"
import { setUserData } from "@/store/slices/userDataSlice"
import { useAppDispatch } from "@/store/hook"
import { Button } from "@/components/ui/button"
import { NAVIGATION_ROUTES } from "@/constants/constants"
import { emailValidation, requiredFieldValidation } from "@/utils/validations"
import type { LoginFormValues } from "./login.types"

const Login = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [login, { isLoading }] = useLoginMutation()

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: "",
      password: "",
    },
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
              first_name: user.first_name,
              last_name: user.last_name,
              user_type: user.user_type,
              status: "active",
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back — enter your credentials to continue
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-xs text-destructive">{formik.errors.email}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-xs text-destructive">{formik.errors.password}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            to={NAVIGATION_ROUTES.REGISTER}
            className="font-medium text-primary hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
