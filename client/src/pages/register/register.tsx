import * as Yup from "yup"
import { useFormik } from "formik"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useRegisterMutation } from "@/store/api/authApiSlice"
import { setUserData } from "@/store/slices/userDataSlice"
import { useAppDispatch } from "@/store/hook"
import { Button } from "@/components/ui/button"
import { NAVIGATION_ROUTES } from "@/constants/constants"
import {
  emailValidation,
  requiredFieldValidation,
  registerPasswordValidation,
} from "@/utils/validations"
import type { RegisterFormValues } from "./register.types"

const USER_TYPE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "doctor", label: "Doctor" },
  { value: "staff", label: "Staff" },
  { value: "pharmacist", label: "Pharmacist" },
] as const

const Register = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [register, { isLoading }] = useRegisterMutation()

  const formik = useFormik<RegisterFormValues>({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      userType: "",
    },
    validationSchema: Yup.object({
      firstName: requiredFieldValidation("First name"),
      lastName: requiredFieldValidation("Last name"),
      email: emailValidation,
      password: registerPasswordValidation,
      userType: Yup.string()
        .oneOf(["admin", "doctor", "staff", "pharmacist"], "Select a valid role")
        .required("Role is required"),
    }),
    onSubmit: async (values) => {
      try {
        const response = await register({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          userType: values.userType as Exclude<typeof values.userType, "">,
        }).unwrap()

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
          toast.error(response?.message ?? "Registration failed.")
        }
      } catch (err: unknown) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ??
          "Registration failed. Please try again."
        toast.error(message)
      }
    },
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Create account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fill in your details to get started
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <label htmlFor="firstName" className="text-xs font-medium text-foreground">
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="John"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <p className="text-xs text-destructive">{formik.errors.firstName}</p>
              )}
            </div>

            <div className="flex-1 space-y-1">
              <label htmlFor="lastName" className="text-xs font-medium text-foreground">
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Doe"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <p className="text-xs text-destructive">{formik.errors.lastName}</p>
              )}
            </div>
          </div>

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

          <div className="space-y-1">
            <label htmlFor="userType" className="text-xs font-medium text-foreground">
              Role
            </label>
            <select
              id="userType"
              name="userType"
              value={formik.values.userType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="" disabled>
                Select a role
              </option>
              {USER_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {formik.touched.userType && formik.errors.userType && (
              <p className="text-xs text-destructive">{formik.errors.userType}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
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

export default Register
