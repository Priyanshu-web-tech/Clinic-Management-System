import { useParams } from "react-router-dom"
import { UserRound } from "lucide-react"
import { format, parseISO } from "date-fns"

import { useGetPatientByIdQuery } from "@/store/api/patient-api-slice"
import { formatAge } from "@/utils/helpers"
import { useGetVisitsQuery } from "@/store/api/visit-api-slice"
import type { Visit } from "@/types/api.types"
import {
  VISIT_STATUS_LABEL,
  VISIT_STATUS_BADGE_VARIANT,
  GENDER_LABEL,
  BLOOD_GROUP_LABEL,
  VISIT_HISTORY_COLUMNS,
} from "@/constants/constants"

import { Badge } from "@/components/ui/badge"
import DataTable from "@/components/data-table"

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { data: patientRes, isLoading: isPatientLoading } =
    useGetPatientByIdQuery(id!)
  const { data: visitsRes, isLoading: isVisitsLoading } = useGetVisitsQuery(
    { patientId: id, pageSize: 50 },
    { skip: !id }
  )

  const patient = patientRes?.result?.patient
  const visits: Visit[] = visitsRes?.result?.data ?? []

  const rows = visits.map((visit) => ({
    id: visit._id,
    data: [
      <span className="font-mono text-xs text-muted-foreground">
        {visit.visitNumber}
      </span>,
      <span className="text-xs text-muted-foreground">
        {format(parseISO(visit.createdAt), "dd MMM yyyy")}
      </span>,
      <span className="max-w-40 truncate text-xs text-muted-foreground">
        {visit.symptoms || <span className="text-border">—</span>}
      </span>,
      <span className="max-w-40 truncate text-xs text-muted-foreground">
        {visit.diagnosis || <span className="text-border">—</span>}
      </span>,
      <Badge
        variant={VISIT_STATUS_BADGE_VARIANT[visit.status] ?? "outline"}
        className="capitalize"
      >
        {VISIT_STATUS_LABEL[visit.status] ?? visit.status}
      </Badge>,
    ],
  }))

  if (isPatientLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
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
            <p className="font-medium">
              {patient.firstName} {patient.lastName}
            </p>
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
            <p className="font-medium">
              {GENDER_LABEL[patient.gender] ?? patient.gender}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Age</p>
            <p className="font-medium">
              {patient.dateOfBirth ? formatAge(patient.dateOfBirth) : "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Blood Group</p>
            <p className="font-medium">
              {patient.bloodGroup
                ? (BLOOD_GROUP_LABEL[patient.bloodGroup] ?? patient.bloodGroup)
                : "—"}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <p className="text-muted-foreground">Allergies</p>
            <p className="font-medium">
              {patient.allergies?.length ? patient.allergies.join(", ") : "—"}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <p className="text-muted-foreground">Chronic Diseases</p>
            <p className="font-medium">
              {patient.chronicDiseases?.length
                ? patient.chronicDiseases.join(", ")
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Visit History */}
      <h3 className="mt-6 text-sm font-medium text-foreground">
        Visit History
      </h3>
      <DataTable
        columns={VISIT_HISTORY_COLUMNS}
        rows={rows}
        isLoading={isVisitsLoading}
        fallbackMessage="No visits found for this patient."
        className="mt-3"
      />
    </div>
  )
}

export default PatientDetail
