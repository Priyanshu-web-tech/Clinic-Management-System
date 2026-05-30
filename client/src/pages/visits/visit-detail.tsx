import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useFormik } from "formik"
import * as Yup from "yup"
import {
  optionalStringValidation,
  nullableStringValidation,
} from "@/utils/validations"
import { toast } from "sonner"
import { Plus, Trash2, Pill, ClipboardList, History } from "lucide-react"

import {
  useGetVisitByIdQuery,
  useLazyGetVisitsQuery,
  useUpdateVisitMutation,
  useUpdateVisitStatusMutation,
} from "@/store/api/visit-api-slice"
import {
  VisitStatus as VS,
  DurationUnit,
  MedicineTiming,
} from "@/types/api.types"
import type { PrescriptionMedicineInput, PrescriptionMedicine } from "@/types/api.types"
import {
  VISIT_STATUS_LABEL,
  VISIT_STATUS_BADGE_VARIANT,
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
import { FreqToggle } from "@/components/ui/freq-toggle"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import DeleteConfirmDialog from "@/components/delete-confirm-dialog"
import PatientInfoCard from "@/components/patient-info-card"
import VisitHistoryModal from "./visit-history-modal"

const EMPTY_MEDICINE: PrescriptionMedicineInput = {
  medicineName: "",
  durationValue: 1,
  durationUnit: DurationUnit.Days,
  frequency: { morning: 0, afternoon: 0, night: 0 },
  timing: MedicineTiming.Anytime,
}

// Desktop grid template: medicine name | M | A | N | timing | duration | delete
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

  const nameInput = (
    <input
      type="text"
      disabled={disabled}
      value={medicine.medicineName}
      onChange={(e) => set({ medicineName: e.target.value })}
      placeholder="Medicine name"
      className="w-full min-w-0 rounded-sm border border-input bg-background px-2 py-1 text-xs placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
    />
  )

  const freqToggles = (["morning", "afternoon", "night"] as const).map((slot) => (
    <FreqToggle
      key={slot}
      value={medicine.frequency[slot]}
      disabled={disabled}
      onChange={(v) => setFreq(slot, v)}
    />
  ))

  const timingSelect = (
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
  )

  const durationInputs = (
    <div className="flex items-center gap-1">
      <input
        type="number"
        disabled={disabled}
        value={medicine.durationValue}
        min={1}
        onChange={(e) =>
          set({ durationValue: Math.max(1, parseInt(e.target.value) || 1) })
        }
        className="w-11 rounded-sm border border-input bg-background px-1.5 py-1 text-xs focus:ring-1 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
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
  )

  const deleteBtn = !disabled ? (
    <button
      type="button"
      onClick={() => onRemove(index)}
      className="flex items-center justify-center rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
    >
      <Trash2 className="size-3.5" />
    </button>
  ) : <div />

  return (
    <>
      {/* ── Mobile card (hidden on md+) ── */}
      <div className="flex flex-col gap-2 rounded-md border border-border bg-background px-3 py-2 md:hidden">
        <div className="flex items-center gap-2">
          {nameInput}
          {!disabled && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="flex items-center justify-center rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
        {/* M / A / N + Timing on one row — timing fills remaining space */}
        <div className="flex items-end gap-2">
          <div className="flex items-end gap-1.5">
            {(["morning", "afternoon", "night"] as const).map((slot) => (
              <div key={slot} className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] font-medium text-muted-foreground">
                  {slot === "morning" ? "M" : slot === "afternoon" ? "A" : "N"}
                </span>
                <div className="w-11">
                  <FreqToggle
                    value={medicine.frequency[slot]}
                    disabled={disabled}
                    onChange={(v) => setFreq(slot, v)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1">
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
          </div>
        </div>
        {/* Duration — unit select fills remaining space */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            disabled={disabled}
            value={medicine.durationValue}
            min={1}
            onChange={(e) =>
              set({ durationValue: Math.max(1, parseInt(e.target.value) || 1) })
            }
            className="w-11 rounded-sm border border-input bg-background px-1.5 py-1 text-xs focus:ring-1 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
          <div className="flex-1">
            <Select
              value={medicine.durationUnit}
              onValueChange={(val) => set({ durationUnit: val as DurationUnit })}
              disabled={disabled}
            >
              <SelectTrigger className="h-7 w-full text-xs">
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
        </div>
      </div>

      {/* ── Desktop grid (hidden below md) ── */}
      <div className={`hidden md:grid ${COL} items-center gap-2 rounded-md border border-border bg-background px-3 py-2`}>
        {nameInput}
        {freqToggles}
        {timingSelect}
        {durationInputs}
        {deleteBtn}
      </div>
    </>
  )
}

const ReadonlyMedicineRow = ({
  medicine,
}: {
  medicine: PrescriptionMedicineInput
}) => {
  const freqParts = (["morning", "afternoon", "night"] as const)
    .filter((s) => medicine.frequency[s] > 0)
    .map((s) => `${s.charAt(0).toUpperCase()}:${medicine.frequency[s]}`)

  return (
    <div className="border-b border-border px-3 py-2.5 text-xs last:border-b-0">
      <p className="font-medium">{medicine.medicineName}</p>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-muted-foreground">
        <span>{freqParts.join(" · ") || "—"}</span>
        <span>·</span>
        <span>{MEDICINE_TIMING_LABEL[medicine.timing]}</span>
        <span>·</span>
        <span className="whitespace-nowrap">
          {medicine.durationValue} {DURATION_UNIT_LABEL[medicine.durationUnit]}
        </span>
      </div>
    </div>
  )
}

const VisitDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [cancelOpen, setCancelOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [completeWarningOpen, setCompleteWarningOpen] = useState(false)
  const [fillConfirmOpen, setFillConfirmOpen] = useState(false)
  const [pendingFillMedicines, setPendingFillMedicines] = useState<PrescriptionMedicineInput[]>([])

  const { data, isLoading } = useGetVisitByIdQuery(id!, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    skip: !id,
  })
  const visit = data?.result?.visit

  const [updateVisit, { isLoading: isSaving }] = useUpdateVisitMutation()
  const [updateStatus, { isLoading: isCancelling }] =
    useUpdateVisitStatusMutation()
  const [fetchPreviousVisits, { isFetching: isFillLoading }] = useLazyGetVisitsQuery()
  const [medicines, setMedicines] = useState<PrescriptionMedicineInput[]>([])
  const [medicinesInitialized, setMedicinesInitialized] = useState(false)

  const isConsultation = visit?.status === VS.InConsultation
  const isClosed =
    visit?.status === VS.Completed || visit?.status === VS.Cancelled

  if (visit && !medicinesInitialized) {
    const existing = visit.prescription?.medicines ?? []
    setMedicines(
      existing.length > 0
        ? existing.map((m) => ({
            medicineName: m.medicineName,
            durationValue: m.durationValue,
            durationUnit: m.durationUnit,
            frequency: m.frequency,
            timing: m.timing,
          }))
        : []
    )
    setMedicinesInitialized(true)
  }

  const addMedicine = () =>
    setMedicines((prev) => [...prev, { ...EMPTY_MEDICINE }])

  const updateMedicine = (index: number, updated: PrescriptionMedicineInput) =>
    setMedicines((prev) => prev.map((m, i) => (i === index ? updated : m)))

  const removeMedicine = (index: number) =>
    setMedicines((prev) => prev.filter((_, i) => i !== index))

  const handleFillFromLastVisit = async () => {
    if (!visit) return
    try {
      const res = await fetchPreviousVisits({
        patientId: visit.patient._id,
        excludeVisitId: id,
        pageSize: 1,
      }).unwrap()
      const previous = res.result?.data?.[0]
      if (!previous) {
        toast.info("No previous visits found for this patient.")
        return
      }
      const prevMedicines: PrescriptionMedicine[] = previous.prescription?.medicines ?? []
      if (prevMedicines.length === 0) {
        toast.info("Previous visit has no prescription to fill.")
        return
      }
      const mapped = prevMedicines.map((m) => ({
        medicineName: m.medicineName,
        durationValue: m.durationValue,
        durationUnit: m.durationUnit,
        frequency: m.frequency,
        timing: m.timing,
      }))
      if (medicines.length > 0) {
        setPendingFillMedicines(mapped)
        setFillConfirmOpen(true)
      } else {
        setMedicines(mapped)
        toast.success("Prescription filled from last visit. Review and edit as needed.")
      }
    } catch {
      toast.error("Failed to fetch previous visit.")
    }
  }

  const handleFillConfirm = () => {
    setMedicines(pendingFillMedicines)
    setPendingFillMedicines([])
    setFillConfirmOpen(false)
    toast.success("Prescription filled from last visit. Review and edit as needed.")
  }

  const doComplete = async (values: { symptoms: string; diagnosis: string; followUpDate: string | null }) => {
    if (!id) return
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
    } finally {
      setCompleteWarningOpen(false)
    }
  }

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      symptoms: visit?.symptoms ?? "",
      diagnosis: visit?.diagnosis ?? "",
      followUpDate: visit?.followUpDate
        ? visit.followUpDate.substring(0, 10)
        : (null as string | null),
    },
    validationSchema: Yup.object({
      symptoms: optionalStringValidation,
      diagnosis: optionalStringValidation,
      followUpDate: nullableStringValidation,
    }),
    onSubmit: async (values) => {
      if (!id) return

      const hasInvalidMedicine = medicines.some(
        (m) =>
          m.medicineName.trim() &&
          !m.frequency.morning &&
          !m.frequency.afternoon &&
          !m.frequency.night
      )
      if (hasInvalidMedicine) {
        toast.error("Select at least one frequency (M/A/N) for each medicine.")
        return
      }

      const hasNotes = values.symptoms.trim() || values.diagnosis.trim()
      const hasMedicines = medicines.some((m) => m.medicineName.trim())

      if (!hasNotes && !hasMedicines) {
        setCompleteWarningOpen(true)
        return
      }

      await doComplete(values)
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
    <div className="flex h-full flex-col p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2.5">
          <span className="font-mono text-sm text-muted-foreground">
            {visit.visitNumber}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-sm text-muted-foreground">
            Token #{visit.tokenNumber}
          </span>
          <Badge
            variant={VISIT_STATUS_BADGE_VARIANT[visit.status] ?? "outline"}
            className="capitalize"
          >
            {VISIT_STATUS_LABEL[visit.status] ?? visit.status}
          </Badge>
        </div>
      </div>

      <div className="mt-6 flex flex-1 flex-col gap-5 overflow-auto">
        {/* Patient Info */}
        <PatientInfoCard
          patient={visit.patient}
          onViewHistory={() => setHistoryOpen(true)}
        />

        {/* Consultation Form */}
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col gap-5 rounded-lg border border-border bg-card p-4"
        >
          {/* Symptoms + Diagnosis */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                <ClipboardList className="size-3.5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold">Consultation Notes</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="symptoms" className="text-xs">
                  Symptoms
                </Label>
                <textarea
                  id="symptoms"
                  name="symptoms"
                  rows={3}
                  disabled={!isConsultation}
                  placeholder={isConsultation ? "Describe symptoms…" : "—"}
                  className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  value={formik.values.symptoms}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="diagnosis" className="text-xs">
                  Diagnosis
                </Label>
                <textarea
                  id="diagnosis"
                  name="diagnosis"
                  rows={3}
                  disabled={!isConsultation}
                  placeholder={isConsultation ? "Enter diagnosis…" : "—"}
                  className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
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
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    disabled={isFillLoading}
                    onClick={handleFillFromLastVisit}
                  >
                    {isFillLoading ? (
                      <Spinner className="size-3" />
                    ) : (
                      <History className="size-3" />
                    )}
                    Fill from last visit
                  </Button>
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
                </div>
              )}
            </div>

            {medicines.length > 0 ? (
              isConsultation ? (
                <div className="flex flex-col gap-1.5">
                  <div className={`hidden md:grid ${COL} gap-2 px-3 py-1 text-[10px] font-medium text-muted-foreground`}>
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
                  {medicines.map((med, idx) => (
                    <ReadonlyMedicineRow key={idx} medicine={med} />
                  ))}
                </div>
              )
            ) : (
              <p className="text-xs text-muted-foreground">
                {isConsultation
                  ? "No medicines added. Click 'Add Medicine' to start."
                  : "No prescription for this visit."}
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
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving}
                  className="h-8 text-xs"
                >
                  {isSaving && <Spinner className="mr-1.5 size-3" />}
                  Complete
                </Button>
              )}
            </div>
          )}
        </form>
      </div>

      <VisitHistoryModal
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        patientName={`${visit.patient.firstName} ${visit.patient.lastName}`}
        patientId={visit.patient._id}
        currentVisitId={id!}
      />

      {/* Fill from last visit — overwrite confirm */}
      <DeleteConfirmDialog
        open={fillConfirmOpen}
        onOpenChange={setFillConfirmOpen}
        onConfirm={handleFillConfirm}
        isLoading={false}
        title="Replace Current Prescription?"
        confirmLabel="Replace"
        description={`You already have ${medicines.length} medicine${medicines.length === 1 ? "" : "s"} added. Filling from the last visit will replace them. Continue?`}
      />

      {/* Complete Without Details Warning */}
      <DeleteConfirmDialog
        open={completeWarningOpen}
        onOpenChange={setCompleteWarningOpen}
        onConfirm={() => doComplete(formik.values)}
        isLoading={isSaving}
        title="Complete Without Details?"
        confirmLabel="Complete Anyway"
        description="No symptoms, diagnosis, or prescription have been added for this visit. Are you sure you want to complete it without any details?"
      />

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
