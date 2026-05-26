import * as Yup from "yup"
import { useFormik } from "formik"
import { toast } from "sonner"

import { requiredFieldValidation, optionalStringValidation } from "@/utils/validations"
import {
  useGetMeQuery,
  useUpdateHospitalMutation,
} from "@/store/api/auth-api-slice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

const HospitalTab = () => {
  const { data: meData } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })
  const [updateHospital, { isLoading }] = useUpdateHospitalMutation()

  const hospital = meData?.result?.hospital

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: hospital?.name ?? "",
      address: hospital?.address ?? "",
    },
    validationSchema: Yup.object({
      name: requiredFieldValidation("Hospital name"),
      address: optionalStringValidation,
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
          (err as { data?: { message?: string } })?.data?.message ??
          "Update failed. Please try again."
        toast.error(message)
      }
    },
  })

  return (
    <div className="max-w-sm space-y-5">
      <div>
        <p className="text-sm font-medium text-foreground">Hospital details</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Update your hospital name and address.
        </p>
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

export default HospitalTab
