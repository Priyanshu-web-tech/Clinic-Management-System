import * as Yup from "yup"
import { useState } from "react"
import { useFormik } from "formik"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

import { useRegisterMutation } from "@/store/api/authApiSlice"
import { setUserData } from "@/store/slices/userDataSlice"
import { useAppDispatch } from "@/store/hook"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { NAVIGATION_ROUTES } from "@/constants/constants"
import {
  emailValidation,
  requiredFieldValidation,
  registerPasswordValidation,
  confirmPasswordValidation,
} from "@/utils/validations"
import type { RegisterFormValues } from "./register.types"

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"

const Register = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [register, { isLoading }] = useRegisterMutation()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const formik = useFormik<RegisterFormValues>({
    initialValues: {
      hospitalName: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      hospitalName: requiredFieldValidation("Hospital name"),
      firstName: requiredFieldValidation("First name"),
      lastName: requiredFieldValidation("Last name"),
      email: emailValidation,
      phone: Yup.string()
        .matches(/^\d{10}$/, "Phone number must be exactly 10 digits")
        .optional(),
      address: Yup.string().optional(),
      password: registerPasswordValidation,
      confirmPassword: confirmPasswordValidation("password"),
    }),
    onSubmit: async (values) => {
      try {
        const response = await register({
          hospitalName: values.hospitalName,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          address: values.address,
          password: values.password,
        }).unwrap()

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
    <div className="flex h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-sm flex flex-col max-h-[calc(100vh-2rem)]">

        {/* Header — fixed, never scrolls */}
        <div className="px-8 pt-8 pb-4 shrink-0">
          <h1 className="text-xl font-semibold text-foreground">Create account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Fill in your details to get started</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="flex flex-col flex-1 min-h-0">

          {/* Scrollable fields */}
          <div className="flex-1 overflow-y-auto px-8 space-y-4">

            {/* Hospital Name */}
            <div className="space-y-1">
              <label htmlFor="hospitalName" className="text-xs font-medium text-foreground">
                Hospital name <span className="text-destructive">*</span>
              </label>
              <input
                id="hospitalName"
                name="hospitalName"
                type="text"
                placeholder="City General Hospital"
                value={formik.values.hospitalName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={inputClass}
              />
              {formik.touched.hospitalName && formik.errors.hospitalName && (
                <p className="text-xs text-destructive">{formik.errors.hospitalName}</p>
              )}
            </div>

            {/* First / Last name */}
            <div className="flex gap-3">
              <div className="flex-1 space-y-1">
                <label htmlFor="firstName" className="text-xs font-medium text-foreground">
                  First name <span className="text-destructive">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={inputClass}
                />
                {formik.touched.firstName && formik.errors.firstName && (
                  <p className="text-xs text-destructive">{formik.errors.firstName}</p>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <label htmlFor="lastName" className="text-xs font-medium text-foreground">
                  Last name <span className="text-destructive">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={inputClass}
                />
                {formik.touched.lastName && formik.errors.lastName && (
                  <p className="text-xs text-destructive">{formik.errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-medium text-foreground">
                Email <span className="text-destructive">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={inputClass}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-xs text-destructive">{formik.errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label htmlFor="phone" className="text-xs font-medium text-foreground">
                Contact number
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                inputMode="numeric"
                placeholder="9876543210"
                value={formik.values.phone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 10)
                  formik.setFieldValue("phone", digits)
                }}
                onBlur={formik.handleBlur}
                className={inputClass}
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-xs text-destructive">{formik.errors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label htmlFor="address" className="text-xs font-medium text-foreground">
                Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                placeholder="123 Main St, City"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={inputClass}
              />
              {formik.touched.address && formik.errors.address && (
                <p className="text-xs text-destructive">{formik.errors.address}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-medium text-foreground">
                Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`${inputClass} pr-9`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-xs text-destructive">{formik.errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1 pb-2">
              <label htmlFor="confirmPassword" className="text-xs font-medium text-foreground">
                Confirm password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`${inputClass} pr-9`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-xs text-destructive">{formik.errors.confirmPassword}</p>
              )}
            </div>

          </div>

          {/* Footer — fixed, never scrolls */}
          <div className="px-8 pt-4 pb-8 shrink-0">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Spinner className="mr-2" />}
              Create account
            </Button>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link to={NAVIGATION_ROUTES.LOGIN} className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>

        </form>
      </div>
    </div>
  )
}

export default Register
