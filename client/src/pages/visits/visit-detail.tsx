import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useFormik } from "formik"
import * as Yup from "yup"
import { optionalStringValidation, nullableStringValidation } from "@/utils/validations"
import { toast } from "sonner"
import { UserRound, History, Plus, Trash2, Pill, ChevronDown, ChevronRight } from "lucide-react"
import { format, parseISO } from "date-fns"

import { useGetVisitByIdQuery, useGetVisitsQuery, useUpdateVisitMutation, useUpdateVisitStatusMutation } from "@/store/api/visit-api-slice"
import { useGetPrescriptionsQuery } from "@/store/api/prescription-api-slice"
import { formatAge } from "@/utils/helpers"
import { VisitStatus as VS, DurationUnit, MedicineTiming } from "@/types/api.types"
import type { PrescriptionMedicineInput, Prescription } from "@/types/api.types"
import {
  VISIT_STATUS_LABEL,
  VISIT_STATUS_BADGE_VARIANT,
  GENDER_LABEL,
  BLOOD_GROUP_LABEL,
  DURATION_UNIT_OPTIONS,
  MEDICINE_TIMING_OPTIONS,
  MEDICINE_TIMING_LABEL,
  DURATION_UNIT_LABEL,
} from "@/constants/constants"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import DeleteConfirmDialog from "@/components/delete-confirm-dialog"

const HistoryVisitRow = ({
  visit,
  prescription,
}: {
  visit: { _id: string; visitNumber: string; createdAt: string; status: string; symptoms: string; diagnosis: string }
  prescription: Prescription | undefined
}) => {
  const [expanded, setExpanded] = useState(false)
  const hasPrescription = prescription && prescription.medicines.length > 0

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        className="grid w-full grid-cols-[16px_80px_100px_1fr_1fr_100px] items-center gap-3 px-3 py-2.5 text-left text-xs transition-colors hover:bg-accent/30"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="text-muted-foreground">
          {expanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        </span>
        <span className="font-mono text-muted-foreground">{visit.visitNumber}</span>
        <span className="text-muted-foreground">{format(parseISO(visit.createdAt), "dd MMM yyyy")}</span>
        <span className="truncate text-muted-foreground">{visit.symptoms || <span className="text-border">—</span>}</span>
        <span className="truncate text-muted-foreground">{visit.diagnosis || <span className="text-border">—</span>}</span>
        <span>
          <Badge variant={VISIT_STATUS_BADGE_VARIANT[visit.status] ?? "outline"} className="capitalize">
            {VISIT_STATUS_LABEL[visit.status] ?? visit.status}
          </Badge>
        </span>
      </button>

      {expanded && (
        <div className="bg-muted/20 px-4 pb-3">
          <div className="flex items-center gap-1.5 py-2 text-xs font-medium text-muted-foreground">
            <Pill className="size-3" />
            Prescription
          </div>
          {hasPrescription ? (
            <div className="overflow-hidden rounded-md border border-border bg-muted/20">
              <div className="grid grid-cols-[1fr_110px_90px_80px] border-b border-border px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                <span>Medicine</span>
                <span>Frequency</span>
                <span>Timing</span>
                <span>Duration</span>
              </div>
              {prescription.medicines.map((m, i) => {
                const slots = (["morning", "afternoon", "night"] as const)
                  .filter((s) => m.frequency[s] > 0)
                  .map((s) => `${s.charAt(0).toUpperCase()}:${m.frequency[s]}`)
                return (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_110px_90px_80px] items-center border-b border-border px-3 py-2 text-xs last:border-b-0"
                  >
                    <span className="font-medium">{m.medicineName}</span>
                    <span className="text-muted-foreground">{slots.join(" · ") || "—"}</span>
                    <span className="text-muted-foreground">{MEDICINE_TIMING_LABEL[m.timing]}</span>
                    <span className="whitespace-nowrap text-muted-foreground">
                      {m.durationValue} {DURATION_UNIT_LABEL[m.durationUnit]}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="py-2 text-xs text-muted-foreground">No prescription for this visit.</p>
          )}
        </div>
      )}
    </div>
  )
}

const EMPTY_MEDICINE: PrescriptionMedicineInput = {
  medicineName: "",
  durationValue: 1,
  durationUnit: DurationUnit.Days,
  frequency: { morning: 0, afternoon: 0, night: 0 },
  timing: MedicineTiming.Anytime,
}

// Shared grid template: medicine name | M | A | N | timing | duration | delete
const COL = "grid-cols-[1fr_45px_45px_45px_130px_165px_28px]"

const MedicineRow = ({
  medicine,
  index,
  onChange,
  onRemove,
  disabled,
}: {
  medicine: PrescriptionMedicineInput
  index: number
  onChange: (index: number, updated: PrescriptionMedicineInput) => void
  onRemove: (index: number) => void
  disabled: boolean
}) => {
  const set = (patch: Partial<PrescriptionMedicineInput>) =>
    onChange(index, { ...medicine, ...patch })

  const setFreq = (slot: "morning" | "afternoon" | "night", value: number) =>
    set({ frequency: { ...medicine.frequency, [slot]: value } })

  return (
    <div className={`grid ${COL} items-center gap-2 rounded-md border border-border bg-background px-3 py-2`}>
      <input
        type="text"
        disabled={disabled}
        value={medicine.medicineName}
        onChange={(e) => set({ medicineName: e.target.value })}
        placeholder="Medicine name"
        className="w-full min-w-0 rounded-sm border border-input bg-background px-2 py-1 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
      />

      {(["morning", "afternoon", "night"] as const).map((slot) => (
        <input
          key={slot}
          type="number"
          disabled={disabled}
          value={medicine.frequency[slot]}
          min={0}
          step={0.5}
          onChange={(e) => setFreq(slot, parseFloat(e.target.value) || 0)}
          className="w-full rounded-sm border border-input bg-background px-1 py-1 text-center text-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
        />
      ))}

      <Select
        value={medicine.timing}
        onValueChange={(val) => set({ timing: val as MedicineTiming })}
        disabled={disabled}
      >
        <SelectTrigger className="h-7 w-full text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MEDICINE_TIMING_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-xs">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1">
        <input
          type="number"
          disabled={disabled}
          value={medicine.durationValue}
          min={1}
          onChange={(e) => set({ durationValue: Math.max(1, parseInt(e.target.value) || 1) })}
          className="w-11 rounded-sm border border-input bg-background px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
        />
        <Select
          value={medicine.durationUnit}
          onValueChange={(val) => set({ durationUnit: val as DurationUnit })}
          disabled={disabled}
        >
          <SelectTrigger className="h-7 flex-1 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DURATION_UNIT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!disabled ? (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="flex items-center justify-center rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </button>
      ) : (
        <div />
      )}
    </div>
  )
}

const ReadonlyMedicineRow = ({ medicine }: { medicine: PrescriptionMedicineInput }) => {
  const freqParts = (["morning", "afternoon", "night"] as const)
    .filter((s) => medicine.frequency[s] > 0)
    .map((s) => `${s.charAt(0).toUpperCase()}:${medicine.frequency[s]}`)

  return (
    <div className="grid grid-cols-[1fr_110px_90px_80px] items-center border-b border-border px-3 py-2 text-xs last:border-b-0">
      <span className="font-medium">{medicine.medicineName}</span>
      <span className="text-muted-foreground">{freqParts.join(" · ") || "—"}</span>
      <span className="text-muted-foreground">{MEDICINE_TIMING_LABEL[medicine.timing]}</span>
      <span className="whitespace-nowrap text-muted-foreground">
        {medicine.durationValue} {DURATION_UNIT_LABEL[medicine.durationUnit]}
      </span>
    </div>
  )
}

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

  const { data: prescriptionsData } = useGetPrescriptionsQuery(
    { patientId: visit?.patient._id, pageSize: 100 },
    { skip: !visit?.patient._id },
  )
  const prescriptionByVisit = (prescriptionsData?.result?.data ?? []).reduce<Record<string, Prescription>>(
    (acc, p) => {
      const visitId = typeof p.visit === "object" ? p.visit._id : p.visit
      if (visitId) acc[visitId] = p
      return acc
    },
    {},
  )

  const [updateVisit, { isLoading: isSaving }] = useUpdateVisitMutation()
  const [updateStatus, { isLoading: isCancelling }] = useUpdateVisitStatusMutation()

  const [cancelOpen, setCancelOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [medicines, setMedicines] = useState<PrescriptionMedicineInput[]>([])
  const [medicinesInitialized, setMedicinesInitialized] = useState(false)

  const isConsultation = visit?.status === VS.InConsultation
  const isClosed = visit?.status === VS.Completed || visit?.status === VS.Cancelled

  if (visit && !medicinesInitialized) {
    const existing = visit.prescription?.medicines ?? []
    setMedicines(existing.length > 0 ? existing.map((m) => ({
      medicineName: m.medicineName,
      durationValue: m.durationValue,
      durationUnit: m.durationUnit,
      frequency: m.frequency,
      timing: m.timing,
    })) : [])
    setMedicinesInitialized(true)
  }

  const addMedicine = () => setMedicines((prev) => [...prev, { ...EMPTY_MEDICINE }])

  const updateMedicine = (index: number, updated: PrescriptionMedicineInput) =>
    setMedicines((prev) => prev.map((m, i) => (i === index ? updated : m)))

  const removeMedicine = (index: number) =>
    setMedicines((prev) => prev.filter((_, i) => i !== index))

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

      const hasInvalidMedicine = medicines.some(
        (m) => m.medicineName.trim() && !m.frequency.morning && !m.frequency.afternoon && !m.frequency.night,
      )
      if (hasInvalidMedicine) {
        toast.error("Select at least one frequency (M/A/N) for each medicine.")
        return
      }

      const validMedicines = medicines.filter((m) => m.medicineName.trim())
      try {
        const res = await updateVisit({
          id,
          symptoms: values.symptoms,
          diagnosis: values.diagnosis,
          followUpDate: values.followUpDate || null,
          status: VS.Completed,
          medicines: validMedicines,
        }).unwrap()
        toast.success(res.message ?? "Visit completed successfully.")
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
      const res = await updateStatus({ id, status: VS.Cancelled }).unwrap()
      toast.success(res.message ?? "Visit cancelled.")
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
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5 rounded-lg border border-border bg-card p-4">

          {/* Symptoms + Diagnosis */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Consultation Notes</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="symptoms" className="text-xs">Symptoms</Label>
                <textarea
                  id="symptoms"
                  name="symptoms"
                  rows={3}
                  disabled={!isConsultation}
                  placeholder={isConsultation ? "Describe symptoms…" : "—"}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none disabled:cursor-not-allowed disabled:opacity-60"
                  value={formik.values.symptoms}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="diagnosis" className="text-xs">Diagnosis</Label>
                <textarea
                  id="diagnosis"
                  name="diagnosis"
                  rows={3}
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
            <div className="mt-4 flex flex-col gap-1.5 sm:w-48">
              <Label className="text-xs">Follow-up Date</Label>
              <DatePicker
                value={formik.values.followUpDate}
                onChange={(val) => formik.setFieldValue("followUpDate", val)}
                placeholder="Select date"
                disabled={!isConsultation}
                maxDate={new Date(9999, 11, 31)}
              />
            </div>
          </div>

          {/* Prescription */}
          <div className="border-t border-border pt-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md bg-primary/10">
                  <Pill className="size-3 text-primary" />
                </div>
                <h3 className="text-sm font-semibold">Prescription</h3>
                {medicines.length > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {medicines.length}
                  </span>
                )}
              </div>
              {isConsultation && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={addMedicine}
                >
                  <Plus className="size-3" />
                  Add Medicine
                </Button>
              )}
            </div>

            {medicines.length > 0 ? (
              isConsultation ? (
                <div className="flex flex-col gap-1.5">
                  <div className={`grid ${COL} gap-2 px-3 py-1 text-[10px] font-medium text-muted-foreground`}>
                    <span>Medicine</span>
                    <span>M</span>
                    <span>A</span>
                    <span>N</span>
                    <span>Timing</span>
                    <span>Duration</span>
                    <span />
                  </div>
                  {medicines.map((med, idx) => (
                    <MedicineRow
                      key={idx}
                      medicine={med}
                      index={idx}
                      onChange={updateMedicine}
                      onRemove={removeMedicine}
                      disabled={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="overflow-hidden rounded-md border border-border bg-muted/20">
                  <div className="grid grid-cols-[1fr_110px_90px_80px] border-b border-border px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    <span>Medicine</span>
                    <span>Frequency</span>
                    <span>Timing</span>
                    <span>Duration</span>
                  </div>
                  {medicines.map((med, idx) => (
                    <ReadonlyMedicineRow key={idx} medicine={med} />
                  ))}
                </div>
              )
            ) : (
              <p className="text-xs text-muted-foreground">
                {isConsultation ? "No medicines added. Click 'Add Medicine' to start." : "No prescription for this visit."}
              </p>
            )}
          </div>

          {/* Actions */}
          {!isClosed && (
            <div className="flex items-center justify-between border-t border-border pt-4">
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
          <div className="mt-4 max-h-[60vh] overflow-auto rounded-md border border-border">
            <div className="grid grid-cols-[16px_80px_100px_1fr_1fr_100px] gap-3 border-b border-border bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
              <span />
              <span>Visit #</span>
              <span>Date</span>
              <span>Symptoms</span>
              <span>Diagnosis</span>
              <span>Status</span>
            </div>
            {previousVisits.map((v) => (
              <HistoryVisitRow
                key={v._id}
                visit={v}
                prescription={prescriptionByVisit[v._id]}
              />
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
