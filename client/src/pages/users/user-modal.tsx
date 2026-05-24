import * as Yup from "yup"
import { useFormik } from "formik"
import { toast } from "sonner"

import {
  emailValidation,
  requiredFieldValidation,
  phoneValidation,
  manageableUserTypeValidation,
} from "@/utils/validations"
import { useCreateUserMutation, useUpdateUserMutation } from "@/store/api/userApiSlice"
import { USER_TYPE_OPTIONS } from "@/constants/constants"
import type { StaffUser, UserType } from "@/types/api.types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// ── Constants ─────────────────────────────────────────────

const MANAGEABLE_ROLES = USER_TYPE_OPTIONS.filter(
  (o) => o.value === "staff" || o.value === "chemist"
)

// ── Schemas ───────────────────────────────────────────────

const addUserSchema = Yup.object({
  firstName: requiredFieldValidation("First name"),
  lastName: requiredFieldValidation("Last name"),
  email: emailValidation,
  phone: phoneValidation,
  userType: manageableUserTypeValidation,
})

const editUserSchema = Yup.object({
  firstName: requiredFieldValidation("First name"),
  lastName: requiredFieldValidation("Last name"),
  phone: phoneValidation,
  userType: manageableUserTypeValidation,
})

// ── Types ─────────────────────────────────────────────────

interface UserModalProps {
  open: boolean
  onClose: () => void
  editTarget: StaffUser | null
}

// ── Component ─────────────────────────────────────────────

const UserModal = ({ open, onClose, editTarget }: UserModalProps) => {
  const isEditing = !!editTarget

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation()
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation()
  const isBusy = isCreating || isUpdating

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      firstName: editTarget?.firstName ?? "",
      lastName: editTarget?.lastName ?? "",
      email: editTarget?.email ?? "",
      phone: editTarget?.phone ?? "",
      userType: (editTarget?.userType ?? "") as UserType | "",
    },
    validationSchema: isEditing ? editUserSchema : addUserSchema,
    onSubmit: async (values) => {
      try {
        if (isEditing) {
          const res = await updateUser({
            id: editTarget._id,
            firstName: values.firstName,
            lastName: values.lastName,
            phone: values.phone,
            userType: values.userType as UserType,
          }).unwrap()
          toast.success(res.message ?? "Member updated successfully.")
        } else {
          const res = await createUser({
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone,
            userType: values.userType as UserType,
          }).unwrap()
          toast.success(res.message ?? "Member added.")
        }
        handleClose()
      } catch (err: unknown) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ??
          "Something went wrong. Please try again."
        toast.error(message)
      }
    },
  })

  const handleClose = () => {
    formik.resetForm()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Member" : "Add Member"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="mt-2 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {/* First Name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName" className="text-xs">First Name <span className="text-destructive">*</span></Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="John"
                className="h-8 text-xs"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={!!(formik.touched.firstName && formik.errors.firstName)}
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <p className="text-[11px] text-destructive">{formik.errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName" className="text-xs">Last Name <span className="text-destructive">*</span></Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Doe"
                className="h-8 text-xs"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={!!(formik.touched.lastName && formik.errors.lastName)}
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <p className="text-[11px] text-destructive">{formik.errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email — add mode only */}
          {!isEditing && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-xs">Email <span className="text-destructive">*</span></Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                className="h-8 text-xs"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={!!(formik.touched.email && formik.errors.email)}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-[11px] text-destructive">{formik.errors.email}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone" className="text-xs">Phone</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="9876543210"
                className="h-8 text-xs"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={!!(formik.touched.phone && formik.errors.phone)}
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-[11px] text-destructive">{formik.errors.phone}</p>
              )}
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="userType" className="text-xs">Role <span className="text-destructive">*</span></Label>
              <Select
                value={formik.values.userType}
                onValueChange={(val) => formik.setFieldValue("userType", val)}
              >
                <SelectTrigger
                  id="userType"
                  className="h-8 w-full text-xs"
                  aria-invalid={!!(formik.touched.userType && formik.errors.userType)}
                >
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {MANAGEABLE_ROLES.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.userType && formik.errors.userType && (
                <p className="text-[11px] text-destructive">{formik.errors.userType}</p>
              )}
            </div>
          </div>

          {!isEditing && (
            <p className="rounded-md bg-muted/60 px-3 py-2 text-[11px] text-muted-foreground">
              A temporary password will be auto-generated and emailed to the new member.
            </p>
          )}

          <DialogFooter className="mt-1">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </button>
            <Button type="submit" size="sm" disabled={isBusy} className="h-8 text-xs">
              {isBusy && <Spinner className="mr-1.5 size-3" />}
              {isEditing ? "Save Changes" : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UserModal
