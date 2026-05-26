import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useFormik } from "formik"
import * as Yup from "yup"
import { optionalStringValidation, nullableStringValidation } from "@/utils/validations"
import { toast } from "sonner"
import { UserRound, History } from "lucide-react"
import { format, parseISO } from "date-fns"

import { useGetVisitByIdQuery, useGetVisitsQuery, useUpdateVisitMutation, useUpdateVisitStatusMutation } from "@/store/api/visit-api-slice"
import { formatAge } from "@/utils/helpers"
import { VisitStatus as VS } from "@/types/api.types"
import {
  VISIT_STATUS_LABEL,
  VISIT_STATUS_BADGE_VARIANT,
  GENDER_LABEL,
  BLOOD_GROUP_LABEL,
} from "@/constants/constants"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import DeleteConfirmDialog from "@/components/delete-confirm-dialog"

const VisitDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data, isLoading } = useGetVisitByIdQuery(id!, { skip: !id })
  const visit = data?.result?.visit

  const { data: historyData } = useGetVisitsQuery(
    { patientId: visit?.patient._id, pageSize: 50 },
    { skip: !visit?.patient._id },
  )
  const previousVisits = (historyData?.result?.data ?? []).filter((v) => v._id !== id)

  const [updateVisit, { isLoading: isSaving }] = useUpdateVisitMutation()
  const [updateStatus, { isLoading: isCancelling }] = useUpdateVisitStatusMutation()

  const [cancelOpen, setCancelOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  const isConsultation = visit?.status === VS.InConsultation
  const isClosed = visit?.status === VS.Completed || visit?.status === VS.Cancelled

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      symptoms: visit?.symptoms ?? "",
      diagnosis: visit?.diagnosis ?? "",
      followUpDate: visit?.followUpDate
        ? visit.followUpDate.substring(0, 10)
        : null as string | null,
    },
    validationSchema: Yup.object({
      symptoms: optionalStringValidation,
      diagnosis: optionalStringValidation,
      followUpDate: nullableStringValidation,
    }),
    onSubmit: async (values) => {
      if (!id) return
      try {
        await updateVisit({
          id,
          symptoms: values.symptoms,
          diagnosis: values.diagnosis,
          followUpDate: values.followUpDate || null,
          status: VS.Completed,
        }).unwrap()
        toast.success("Visit completed successfully.")
        navigate("/visits")
      } catch (err: unknown) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ??
          "Failed to complete visit."
        toast.error(message)
      }
    },
  })

  const handleCancel = async () => {
    if (!id) return
    try {
      await updateStatus({ id, status: VS.Cancelled }).unwrap()
      toast.success("Visit cancelled.")
      navigate("/visits")
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Failed to cancel visit."
      toast.error(message)
    } finally {
      setCancelOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (!visit) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Visit not found.
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2.5">
          <span className="font-mono text-sm text-muted-foreground">{visit.visitNumber}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-sm text-muted-foreground">Token #{visit.tokenNumber}</span>
          <Badge variant={VISIT_STATUS_BADGE_VARIANT[visit.status] ?? "outline"} className="capitalize">
            {VISIT_STATUS_LABEL[visit.status] ?? visit.status}
          </Badge>
        </div>
      </div>

      <div className="mt-6 flex flex-1 flex-col gap-5 overflow-auto">
        {/* Patient Info */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                <UserRound className="size-3.5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold">Patient Info</h3>
            </div>
            {previousVisits.length > 0 && (
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <History className="size-3.5" />
                {previousVisits.length} previous {previousVisits.length === 1 ? "visit" : "visits"}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">
                {visit.patient.firstName} {visit.patient.lastName}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Patient Code</p>
              <p className="font-mono font-medium">{visit.patient.patientCode}</p>
            </div>
            {visit.patient.phone && (
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{visit.patient.phone}</p>
              </div>
            )}
            {visit.patient.gender && (
              <div>
                <p className="text-muted-foreground">Gender</p>
                <p className="font-medium capitalize">
                  {GENDER_LABEL[visit.patient.gender] ?? visit.patient.gender}
                </p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Age</p>
              <p className="font-medium">
                {visit.patient.dateOfBirth ? formatAge(visit.patient.dateOfBirth) : "—"}
              </p>
            </div>
            {visit.patient.bloodGroup && (
              <div>
                <p className="text-muted-foreground">Blood Group</p>
                <p className="font-medium">
                  {BLOOD_GROUP_LABEL[visit.patient.bloodGroup] ?? visit.patient.bloodGroup}
                </p>
              </div>
            )}
            <div className="col-span-2 sm:col-span-3">
              <p className="text-muted-foreground">Allergies</p>
              <p className="font-medium">
                {visit.patient.allergies?.length ? visit.patient.allergies.join(", ") : "—"}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <p className="text-muted-foreground">Chronic Diseases</p>
              <p className="font-medium">
                {visit.patient.chronicDiseases?.length ? visit.patient.chronicDiseases.join(", ") : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Consultation Form */}
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold">Consultation Notes</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Symptoms */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="symptoms" className="text-xs">Symptoms</Label>
              <textarea
                id="symptoms"
                name="symptoms"
                rows={4}
                disabled={!isConsultation}
                placeholder={isConsultation ? "Describe symptoms…" : "—"}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none disabled:cursor-not-allowed disabled:opacity-60"
                value={formik.values.symptoms}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>

            {/* Diagnosis */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="diagnosis" className="text-xs">Diagnosis</Label>
              <textarea
                id="diagnosis"
                name="diagnosis"
                rows={4}
                disabled={!isConsultation}
                placeholder={isConsultation ? "Enter diagnosis…" : "—"}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none disabled:cursor-not-allowed disabled:opacity-60"
                value={formik.values.diagnosis}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
          </div>

          {/* Follow-up Date */}
          <div className="flex flex-col gap-1.5 sm:w-48">
            <Label className="text-xs">Follow-up Date</Label>
            <DatePicker
              value={formik.values.followUpDate}
              onChange={(val) => formik.setFieldValue("followUpDate", val)}
              placeholder="Select date"
              disabled={!isConsultation}
              maxDate={new Date(9999, 11, 31)}
            />
          </div>

          {/* Actions */}
          {!isClosed && (
            <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 border-destructive/30 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={isCancelling}
                onClick={() => setCancelOpen(true)}
              >
                Cancel Visit
              </Button>
              {isConsultation && (
                <Button type="submit" size="sm" disabled={isSaving} className="h-8 text-xs">
                  {isSaving && <Spinner className="mr-1.5 size-3" />}
                  Complete
                </Button>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Visit History Modal */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Previous Visits — {visit.patient.firstName} {visit.patient.lastName}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 overflow-hidden rounded-md border border-border">
            <div className="grid grid-cols-[90px_110px_1fr_1fr] gap-4 border-b border-border bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
              <span>Date</span>
              <span>Status</span>
              <span>Symptoms</span>
              <span>Diagnosis</span>
            </div>
            {previousVisits.map((v) => (
              <div
                key={v._id}
                className="grid grid-cols-[90px_110px_1fr_1fr] gap-4 border-b border-border px-3 py-2.5 text-xs last:border-b-0"
              >
                <span className="text-muted-foreground">{format(parseISO(v.createdAt), "dd MMM yyyy")}</span>
                <span>
                  <Badge variant={VISIT_STATUS_BADGE_VARIANT[v.status] ?? "outline"} className="capitalize">
                    {VISIT_STATUS_LABEL[v.status] ?? v.status}
                  </Badge>
                </span>
                <span className="truncate">{v.symptoms || <span className="text-muted-foreground">—</span>}</span>
                <span className="truncate">{v.diagnosis || <span className="text-muted-foreground">—</span>}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirm */}
      <DeleteConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={handleCancel}
        isLoading={isCancelling}
        title="Cancel Visit"
        confirmLabel="Cancel Visit"
        description={
          <>
            Are you sure you want to cancel the visit for{" "}
            <span className="font-medium text-foreground">
              {visit.patient.firstName} {visit.patient.lastName}
            </span>
            ?
          </>
        }
      />
    </div>
  )
}

export default VisitDetail
