import { UserRound, History } from "lucide-react"

import { formatAge } from "@/utils/helpers"
import { GENDER_LABEL, BLOOD_GROUP_LABEL } from "@/constants/constants"
import type { Gender, BloodGroup } from "@/types/api.types"

interface PatientInfoCardProps {
  patient: {
    firstName: string
    lastName: string
    patientCode: string
    phone?: string
    email?: string | null
    gender?: Gender
    dateOfBirth?: string | null
    bloodGroup?: BloodGroup | null
    allergies?: string[]
    chronicDiseases?: string[]
  }
  onViewHistory?: () => void
}

const PatientInfoCard = ({ patient, onViewHistory }: PatientInfoCardProps) => {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex shrink-0 size-7 items-center justify-center rounded-md bg-primary/10">
            <UserRound className="size-3.5 text-primary" />
          </div>
          <h3 className="whitespace-nowrap text-sm font-semibold">Patient Info</h3>
        </div>
        {onViewHistory && (
          <button
            type="button"
            onClick={onViewHistory}
            className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <History className="size-3.5" />
            <span className="whitespace-nowrap">Visit History</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs sm:grid-cols-3 sm:gap-x-6">
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
        {patient.phone && (
          <div>
            <p className="text-muted-foreground">Phone</p>
            <p className="font-medium">{patient.phone}</p>
          </div>
        )}
        {patient.email && (
          <div className="min-w-0">
            <p className="text-muted-foreground">Email</p>
            <p className="break-all font-medium">{patient.email}</p>
          </div>
        )}
        {patient.gender && (
          <div>
            <p className="text-muted-foreground">Gender</p>
            <p className="font-medium capitalize">
              {GENDER_LABEL[patient.gender] ?? patient.gender}
            </p>
          </div>
        )}
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
  )
}

export default PatientInfoCard
