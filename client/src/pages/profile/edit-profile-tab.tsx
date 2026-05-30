import * as Yup from "yup"
import { useFormik } from "formik"
import { toast } from "sonner"

import { textFieldValidation, phoneValidation } from "@/utils/validations"
import {
  useGetMeQuery,
  useUpdateProfileMutation,
} from "@/store/api/auth-api-slice"
import { setUserData } from "@/store/slices/user-data-slice"
import { useAppDispatch, useAppSelector } from "@/store/hook"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import type { UpdateProfileFormValues } from "./profile.types"

const EditProfileTab = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.userData)
  const { data: meData } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })
  const [updateProfile, { isLoading }] = useUpdateProfileMutation()

  const formik = useFormik<UpdateProfileFormValues>({
    enableReinitialize: true,
    initialValues: {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phone: meData?.result?.phone ?? "",
    },
    validationSchema: Yup.object({
      firstName: textFieldValidation("First name", true),
      lastName: textFieldValidation("Last name", true),
      phone: phoneValidation,
    }),
    onSubmit: async (values) => {
      try {
        const response = await updateProfile(values).unwrap()
        if (response?.success) {
          const { user: updated } = response.result
          dispatch(
            setUserData({
              _id: updated._id,
              email: updated.email,
              firstName: updated.firstName,
              lastName: updated.lastName,
              userType: updated.userType,
              designation: updated.designation ?? null,
              createdAt: updated.createdAt,
              updatedAt: updated.updatedAt,
            })
          )
          toast.success(response.message ?? "Profile updated.")
        } else {
          toast.error(response?.message ?? "Update failed.")
        }
      } catch (err: unknown) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ??
          "Update failed. Please try again."
        toast.error(message)
      }
    },
  })

  return (
    <div className="w-full max-w-sm space-y-5">
      <div>
        <p className="text-sm font-medium text-foreground">
          Update your details
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Changes will reflect across the app immediately.
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First name <span className="text-destructive">*</span></Label>
          <Input
            id="firstName"
            name="firstName"
            placeholder="John"
            value={formik.values.firstName}
            onChange={(e) => {
              if (e.target.value.startsWith(" ")) return
              formik.handleChange(e)
            }}
            onBlur={formik.handleBlur}
            aria-invalid={
              !!(formik.touched.firstName && formik.errors.firstName)
            }
          />
          {formik.touched.firstName && formik.errors.firstName && (
            <p className="text-xs text-destructive">
              {formik.errors.firstName}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last name <span className="text-destructive">*</span></Label>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Doe"
            value={formik.values.lastName}
            onChange={(e) => {
              if (e.target.value.startsWith(" ")) return
              formik.handleChange(e)
            }}
            onBlur={formik.handleBlur}
            aria-invalid={!!(formik.touched.lastName && formik.errors.lastName)}
          />
          {formik.touched.lastName && formik.errors.lastName && (
            <p className="text-xs text-destructive">{formik.errors.lastName}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Contact number</Label>
          <Input
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
            aria-invalid={!!(formik.touched.phone && formik.errors.phone)}
          />
          {formik.touched.phone && formik.errors.phone && (
            <p className="text-xs text-destructive">{formik.errors.phone}</p>
          )}
        </div>

        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading && <Spinner className="mr-2" />}
          Save changes
        </Button>
      </form>
    </div>
  )
}

export default EditProfileTab
