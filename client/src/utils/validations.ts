import * as Yup from "yup"

export const emailValidation = Yup.string()
  .email("Invalid email address")
  .matches(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    "Invalid email address"
  )
  .required("Email is required")

export const requiredFieldValidation = (fieldName = "This field") =>
  Yup.string().required(`${fieldName} is required`)

export const passwordValidation = (username?: string, email?: string) =>
  Yup.string()
    .trim()
    .required("Please enter your password")
    .min(12, "Password must be at least 12 characters long")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must include at least one special character"
    )
    .matches(/[a-z]/, "Password must include at least one lowercase character")
    .matches(/[A-Z]/, "Password must include at least one uppercase character")
    .matches(/[0-9]/, "Password must include at least one digit")
    .test("no-username", "Password must not contain your username", (value) => {
      if (!value || !username) return true
      return !value.toLowerCase().includes(username.toLowerCase())
    })
    .test("no-email", "Password must not contain your email", (value) => {
      if (!value || !email) return true
      return !value.toLowerCase().includes(email.toLowerCase())
    })

export const confirmPasswordValidation = (matchField = "newPassword") =>
  Yup.string()
    .trim()
    .required("Please confirm your password")
    .oneOf([Yup.ref(matchField)], "Passwords do not match")

export const registerPasswordValidation = Yup.string()
  .trim()
  .required("Password is required")
  .min(8, "Password must be at least 8 characters")
  .matches(/[a-z]/, "Must include a lowercase letter")
  .matches(/[A-Z]/, "Must include an uppercase letter")
  .matches(/[0-9]/, "Must include a number")
  .matches(/[@$!%*?&#]/, "Must include a special character (@$!%*?&#)")
