import * as Yup from "yup"
import { useFormik } from "formik"
import { toast } from "sonner"

import {
  textFieldValidation,
  requiredPhoneValidation,
  genderValidation,
  dateOfBirthValidation,
  bloodGroupValidation,
  stringArrayValidation,
  optionalEmailValidation,
} from "@/utils/validations"
import {
  useCreatePatientMutation,
  useUpdatePatientMutation,
} from "@/store/api/patient-api-slice"
import {
  GENDER_OPTIONS,
  BLOOD_GROUP_OPTIONS,
} from "@/constants/constants"
import type { Patient, Gender, BloodGroup } from "@/types/api.types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { DatePicker } from "@/components/ui/date-picker"
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
import TagInput from "@/components/ui/tag-input"

// ── Types ─────────────────────────────────────────────────

interface PatientModalProps {
  open: boolean
  onClose: () => void
  editTarget: Patient | null
}

// ── Component ─────────────────────────────────────────────

const PatientModal = ({ open, onClose, editTarget }: PatientModalProps) => {
  const isEditing = !!editTarget

  const [createPatient, { isLoading: isCreating }] = useCreatePatientMutation()
  const [updatePatient, { isLoading: isUpdating }] = useUpdatePatientMutation()
  const isBusy = isCreating || isUpdating

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      firstName: editTarget?.firstName ?? "",
      lastName: editTarget?.lastName ?? "",
      phone: editTarget?.phone ?? "",
      email: editTarget?.email ?? "",
      gender: (editTarget?.gender ?? "") as Gender | "",
      dateOfBirth: editTarget?.dateOfBirth
        ? editTarget.dateOfBirth.substring(0, 10)
        : null as string | null,
      bloodGroup: (editTarget?.bloodGroup ?? "") as BloodGroup | "",
      allergies: editTarget?.allergies ?? [] as string[],
      chronicDiseases: editTarget?.chronicDiseases ?? [] as string[],
    },
    validationSchema: Yup.object({
      firstName: textFieldValidation("First name", true),
      lastName: textFieldValidation("Last name"),
      phone: requiredPhoneValidation,
      email: optionalEmailValidation,
      gender: genderValidation,
      dateOfBirth: dateOfBirthValidation,
      bloodGroup: bloodGroupValidation,
      allergies: stringArrayValidation,
      chronicDiseases: stringArrayValidation,
    }),
    onSubmit: async (values) => {
      try {
        const payload = {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          email: values.email || null,
          gender: values.gender as Gender,
          dateOfBirth: values.dateOfBirth || null,
          bloodGroup: (values.bloodGroup as BloodGroup) || null,
          allergies: values.allergies as string[],
          chronicDiseases: values.chronicDiseases as string[],
        }

        if (isEditing) {
          const res = await updatePatient({ id: editTarget._id, ...payload }).unwrap()
          toast.success(res.message ?? "Patient updated successfully.")
        } else {
          const res = await createPatient(payload).unwrap()
          toast.success(res.message ?? "Patient added successfully.")
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Patient" : "Add Patient"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="mt-2 flex flex-col gap-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            {/* First Name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName" className="text-xs">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="John"
                className="h-8 text-xs"
                value={formik.values.firstName}
                onChange={(e) => {
                  if (e.target.value.startsWith(" ")) return
                  formik.handleChange(e)
                }}
                onBlur={formik.handleBlur}
                aria-invalid={!!(formik.touched.firstName && formik.errors.firstName)}
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <p className="text-[11px] text-destructive">{formik.errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName" className="text-xs">
                Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Doe"
                className="h-8 text-xs"
                value={formik.values.lastName}
                onChange={(e) => {
                  if (e.target.value.startsWith(" ")) return
                  formik.handleChange(e)
                }}
                onBlur={formik.handleBlur}
                aria-invalid={!!(formik.touched.lastName && formik.errors.lastName)}
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <p className="text-[11px] text-destructive">{formik.errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Phone + Gender row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone" className="text-xs">
                Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="text"
                inputMode="numeric"
                placeholder="9876543210"
                className="h-8 text-xs"
                value={formik.values.phone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 10)
                  formik.setFieldValue("phone", digits)
                }}
                onBlur={formik.handleBlur}
                aria-invalid={!!(formik.touched.phone && formik.errors.phone)}
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-[11px] text-destructive">{formik.errors.phone}</p>
              )}
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="gender" className="text-xs">
                Gender <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formik.values.gender}
                onValueChange={(val) => formik.setFieldValue("gender", val)}
              >
                <SelectTrigger
                  id="gender"
                  className="h-8 w-full text-xs"
                  aria-invalid={!!(formik.touched.gender && formik.errors.gender)}
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.gender && formik.errors.gender && (
                <p className="text-[11px] text-destructive">{formik.errors.gender}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-xs">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="patient@example.com"
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

          {/* DOB + Blood group row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Date of Birth */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">
                Date of Birth <span className="text-destructive">*</span>
              </Label>
              <DatePicker
                value={formik.values.dateOfBirth}
                onChange={(val) => {
                  formik.setFieldValue("dateOfBirth", val)
                  formik.setFieldTouched("dateOfBirth", true, false)
                }}
                onBlur={() => formik.setFieldTouched("dateOfBirth", true)}
                placeholder="Select date"
              />
              {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
                <p className="text-[11px] text-destructive">{formik.errors.dateOfBirth}</p>
              )}
            </div>

            {/* Blood Group */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bloodGroup" className="text-xs">
                Blood Group
              </Label>
              <Select
                value={formik.values.bloodGroup || "none"}
                onValueChange={(val) =>
                  formik.setFieldValue("bloodGroup", val === "none" ? "" : val)
                }
              >
                <SelectTrigger id="bloodGroup" className="h-8 w-full text-xs">
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unknown</SelectItem>
                  {BLOOD_GROUP_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Allergies */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Allergies</Label>
            <TagInput
              value={formik.values.allergies as string[]}
              onChange={(tags) => formik.setFieldValue("allergies", tags)}
              placeholder="Type an allergy and press Enter…"
              onBlur={() => formik.setFieldTouched("allergies", true)}
            />
          </div>

          {/* Chronic Diseases */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Chronic Diseases</Label>
            <TagInput
              value={formik.values.chronicDiseases as string[]}
              onChange={(tags) => formik.setFieldValue("chronicDiseases", tags)}
              placeholder="Type a condition and press Enter…"
              onBlur={() => formik.setFieldTouched("chronicDiseases", true)}
            />
          </div>

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
              {isEditing ? "Save Changes" : "Add Patient"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default PatientModal
