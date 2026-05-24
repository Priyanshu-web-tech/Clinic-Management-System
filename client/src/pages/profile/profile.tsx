import * as Yup from "yup"
import { useState, useEffect } from "react"
import { useFormik } from "formik"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

import { useGetMeQuery, useUpdateProfileMutation, useUpdateHospitalMutation, useChangePasswordMutation } from "@/store/api/authApiSlice"
import { setUserData } from "@/store/slices/userDataSlice"
import { useAppDispatch, useAppSelector } from "@/store/hook"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { registerPasswordValidation, confirmPasswordValidation } from "@/utils/validations"
import { USER_TYPE_LABEL } from "@/constants/constants"
import type { UpdateProfileFormValues, ChangePasswordFormValues } from "./profile.types"

// ── Personal Info Tab ──────────────────────────────────────────────────────────

const PersonalInfoTab = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.userData)
  const { data, isLoading, isError } = useGetMeQuery(undefined, { refetchOnMountOrArgChange: true })

  useEffect(() => {
    if (data?.result) {
      dispatch(setUserData(data.result))
    }
  }, [data, dispatch])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-sm text-muted-foreground">Loading profile…</p>
      </div>
    )
  }

  if (isError || !data?.result) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-sm text-destructive">Failed to load profile.</p>
      </div>
    )
  }

  const profile = data.result

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
          {user.firstName.charAt(0).toUpperCase()}
          {user.lastName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-foreground">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-muted-foreground">{profile.email}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
        <ProfileRow label="Email" value={profile.email} />
        {profile.phone && <ProfileRow label="Phone" value={profile.phone} />}
        <ProfileRow label="Role" value={USER_TYPE_LABEL[profile.userType] ?? profile.userType} />
        {profile.hospital && (
          <>
            <ProfileRow label="Hospital" value={profile.hospital.name} />
            {profile.hospital.address && (
              <ProfileRow label="Address" value={profile.hospital.address} />
            )}
          </>
        )}
        <ProfileRow
          label="Member since"
          value={new Date(profile.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        />
      </div>
    </div>
  )
}

// ── Edit Profile Tab ───────────────────────────────────────────────────────────

const EditProfileTab = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.userData)
  const { data: meData } = useGetMeQuery(undefined, { refetchOnMountOrArgChange: true })
  const [updateProfile, { isLoading }] = useUpdateProfileMutation()

  const formik = useFormik<UpdateProfileFormValues>({
    enableReinitialize: true,
    initialValues: {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phone: meData?.result?.phone ?? "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().trim().required("First name is required"),
      lastName: Yup.string().trim().required("Last name is required"),
      phone: Yup.string()
        .matches(/^\d{10}$/, "Phone number must be exactly 10 digits")
        .optional(),
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
              createdAt: updated.createdAt,
              updatedAt: updated.updatedAt,
            }),
          )
          toast.success(response.message ?? "Profile updated.")
        } else {
          toast.error(response?.message ?? "Update failed.")
        }
      } catch (err: unknown) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ?? "Update failed. Please try again."
        toast.error(message)
      }
    },
  })

  return (
    <div className="space-y-5 max-w-sm">
      <div>
        <p className="text-sm font-medium text-foreground">Update your details</p>
        <p className="text-xs text-muted-foreground mt-0.5">Changes will reflect across the app immediately.</p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            name="firstName"
            placeholder="John"
            value={formik.values.firstName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={!!(formik.touched.firstName && formik.errors.firstName)}
          />
          {formik.touched.firstName && formik.errors.firstName && (
            <p className="text-xs text-destructive">{formik.errors.firstName}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Doe"
            value={formik.values.lastName}
            onChange={formik.handleChange}
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

// ── Hospital Tab ───────────────────────────────────────────────────────────────

const HospitalTab = () => {
  const { data: meData } = useGetMeQuery(undefined, { refetchOnMountOrArgChange: true })
  const [updateHospital, { isLoading }] = useUpdateHospitalMutation()

  const hospital = meData?.result?.hospital

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: hospital?.name ?? "",
      address: hospital?.address ?? "",
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Hospital name is required"),
      address: Yup.string().optional(),
    }),
    onSubmit: async (values) => {
      try {
        const response = await updateHospital(values).unwrap()
        if (response?.success) {
          toast.success(response.message ?? "Hospital updated.")
        } else {
          toast.error(response?.message ?? "Update failed.")
        }
      } catch (err: unknown) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ?? "Update failed. Please try again."
        toast.error(message)
      }
    },
  })

  return (
    <div className="space-y-5 max-w-sm">
      <div>
        <p className="text-sm font-medium text-foreground">Hospital details</p>
        <p className="text-xs text-muted-foreground mt-0.5">Update your hospital name and address.</p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="hospitalName">Hospital name</Label>
          <Input
            id="hospitalName"
            name="name"
            placeholder="City General Hospital"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={!!(formik.touched.name && formik.errors.name)}
          />
          {formik.touched.name && formik.errors.name && (
            <p className="text-xs text-destructive">{formik.errors.name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="hospitalAddress">Address</Label>
          <Input
            id="hospitalAddress"
            name="address"
            placeholder="123 Main St, City"
            value={formik.values.address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </div>

        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading && <Spinner className="mr-2" />}
          Save changes
        </Button>
      </form>
    </div>
  )
}

// ── Password Tab ───────────────────────────────────────────────────────────────

const PasswordTab = () => {
  const [changePassword, { isLoading }] = useChangePasswordMutation()
  const [show, setShow] = useState({ current: false, new: false, confirm: false })

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
          (err as { data?: { message?: string } })?.data?.message ?? "Failed to change password."
        toast.error(message)
      }
    },
  })

  return (
    <div className="space-y-5 max-w-sm">
      <div>
        <p className="text-sm font-medium text-foreground">Change your password</p>
        <p className="text-xs text-muted-foreground mt-0.5">Must be at least 8 characters with uppercase, lowercase, number and special character.</p>
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
              aria-invalid={!!(formik.touched.currentPassword && formik.errors.currentPassword)}
            />
            <PasswordToggle show={show.current} onClick={() => toggle("current")} />
          </div>
          {formik.touched.currentPassword && formik.errors.currentPassword && (
            <p className="text-xs text-destructive">{formik.errors.currentPassword}</p>
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
              aria-invalid={!!(formik.touched.newPassword && formik.errors.newPassword)}
            />
            <PasswordToggle show={show.new} onClick={() => toggle("new")} />
          </div>
          {formik.touched.newPassword && formik.errors.newPassword && (
            <p className="text-xs text-destructive">{formik.errors.newPassword}</p>
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
              aria-invalid={!!(formik.touched.confirmPassword && formik.errors.confirmPassword)}
            />
            <PasswordToggle show={show.confirm} onClick={() => toggle("confirm")} />
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="text-xs text-destructive">{formik.errors.confirmPassword}</p>
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

// ── Shared helpers ─────────────────────────────────────────────────────────────

const ProfileRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">{value}</span>
  </div>
)

const PasswordToggle = ({ show, onClick }: { show: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    tabIndex={-1}
    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
  >
    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
  </button>
)

// ── Page ───────────────────────────────────────────────────────────────────────

const Profile = () => (
  <div className="p-6">
    <div className="w-full max-w-lg">
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Personal info</TabsTrigger>
          <TabsTrigger value="edit">Edit profile</TabsTrigger>
          <TabsTrigger value="hospital">Hospital</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <PersonalInfoTab />
        </TabsContent>

        <TabsContent value="edit">
          <EditProfileTab />
        </TabsContent>

        <TabsContent value="hospital">
          <HospitalTab />
        </TabsContent>

        <TabsContent value="password">
          <PasswordTab />
        </TabsContent>
      </Tabs>
    </div>
  </div>
)

export default Profile
