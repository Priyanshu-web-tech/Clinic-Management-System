import { useState } from "react"
import { useParams } from "react-router-dom"
import { UserRound, ChevronDown, ChevronRight, Pill } from "lucide-react"
import { format, parseISO } from "date-fns"

import { useGetPatientByIdQuery } from "@/store/api/patient-api-slice"
import { useGetVisitsQuery } from "@/store/api/visit-api-slice"
import { useGetPrescriptionsQuery } from "@/store/api/prescription-api-slice"
import { formatAge } from "@/utils/helpers"
import type { Visit, Prescription } from "@/types/api.types"
import {
  VISIT_STATUS_LABEL,
  VISIT_STATUS_BADGE_VARIANT,
  GENDER_LABEL,
  BLOOD_GROUP_LABEL,
  MEDICINE_TIMING_LABEL,
  DURATION_UNIT_LABEL,
} from "@/constants/constants"

import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

const PrescriptionDetail = ({ prescription }: { prescription: Prescription | undefined }) => {
  if (!prescription || prescription.medicines.length === 0) {
    return <p className="py-2 text-xs text-muted-foreground">No prescription for this visit.</p>
  }
  return (
    <div className="mt-2 overflow-hidden rounded-md border border-border bg-muted/20">
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 border-b border-border px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
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
            className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-b border-border px-3 py-2 text-xs last:border-b-0"
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
  )
}

const VisitRow = ({
  visit,
  prescription,
}: {
  visit: Visit
  prescription: Prescription | undefined
}) => {
  const [expanded, setExpanded] = useState(false)

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
          <PrescriptionDetail prescription={prescription} />
        </div>
      )}
    </div>
  )
}

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>()

  const { data: patientRes, isLoading: isPatientLoading } = useGetPatientByIdQuery(id!)
  const { data: visitsRes, isLoading: isVisitsLoading } = useGetVisitsQuery(
    { patientId: id, pageSize: 50 },
    { skip: !id },
  )
  const { data: prescriptionsRes } = useGetPrescriptionsQuery(
    { patientId: id, pageSize: 100 },
    { skip: !id },
  )

  const patient = patientRes?.result?.patient
  const visits: Visit[] = visitsRes?.result?.data ?? []

  const prescriptionByVisit = (prescriptionsRes?.result?.data ?? []).reduce<Record<string, Prescription>>(
    (acc, p) => {
      const visitId = typeof p.visit === "object" ? p.visit._id : p.visit
      if (visitId) acc[visitId] = p
      return acc
    },
    {},
  )

  if (isPatientLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-5" />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Patient not found.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col p-6">
      {/* Patient Info Card */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
            <UserRound className="size-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Patient Info</h3>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs sm:grid-cols-3">
          <div>
            <p className="text-muted-foreground">Name</p>
            <p className="font-medium">{patient.firstName} {patient.lastName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Patient Code</p>
            <p className="font-mono font-medium">{patient.patientCode}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Phone</p>
            <p className="font-medium">{patient.phone}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Gender</p>
            <p className="font-medium">{GENDER_LABEL[patient.gender] ?? patient.gender}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Age</p>
            <p className="font-medium">{patient.dateOfBirth ? formatAge(patient.dateOfBirth) : "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Blood Group</p>
            <p className="font-medium">
              {patient.bloodGroup ? (BLOOD_GROUP_LABEL[patient.bloodGroup] ?? patient.bloodGroup) : "—"}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <p className="text-muted-foreground">Allergies</p>
            <p className="font-medium">{patient.allergies?.length ? patient.allergies.join(", ") : "—"}</p>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <p className="text-muted-foreground">Chronic Diseases</p>
            <p className="font-medium">
              {patient.chronicDiseases?.length ? patient.chronicDiseases.join(", ") : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Visit History */}
      <h3 className="mt-6 text-sm font-medium text-foreground">Visit History</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">Click a row to expand prescription details.</p>

      <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border bg-card">
        {/* Header */}
        <div className="grid shrink-0 grid-cols-[16px_80px_100px_1fr_1fr_100px] gap-3 border-b border-border bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
          <span />
          <span>Visit #</span>
          <span>Date</span>
          <span>Symptoms</span>
          <span>Diagnosis</span>
          <span>Status</span>
        </div>

        <div className="overflow-y-auto">
          {isVisitsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="size-4" />
            </div>
          ) : visits.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">No visits found for this patient.</p>
          ) : (
            visits.map((visit) => (
              <VisitRow
                key={visit._id}
                visit={visit}
                prescription={prescriptionByVisit[visit._id]}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default PatientDetail
