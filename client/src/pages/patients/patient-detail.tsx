import { useState } from "react"
import { useParams } from "react-router-dom"
import { ChevronDown, ChevronRight, Pill, History } from "lucide-react"
import { format, parseISO } from "date-fns"

import { useGetPatientByIdQuery } from "@/store/api/patient-api-slice"
import { useGetVisitsQuery } from "@/store/api/visit-api-slice"
import type { Visit, PrescriptionMedicine } from "@/types/api.types"
import usePaginatedQuery from "@/hooks/use-paginated-query"
import {
  VISIT_STATUS_LABEL,
  VISIT_STATUS_BADGE_VARIANT,
  MEDICINE_TIMING_LABEL,
  DURATION_UNIT_LABEL,
  PAGE_SIZE,
} from "@/constants/constants"

import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import Pagination from "@/components/pagination"
import PatientInfoCard from "@/components/patient-info-card"

const PrescriptionDetail = ({
  prescription,
}: {
  prescription: { medicines: PrescriptionMedicine[] } | null | undefined
}) => {
  if (!prescription || prescription.medicines.length === 0) {
    return (
      <p className="py-2 text-xs text-muted-foreground">
        No prescription for this visit.
      </p>
    )
  }
  return (
    <div className="mt-2 overflow-hidden rounded-md border border-border bg-muted/20">
      {/* Desktop column header */}
      <div className="hidden grid-cols-[1fr_110px_90px_80px] border-b border-border px-3 py-1.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase md:grid">
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
          <div key={i} className="border-b border-border last:border-b-0">
            {/* Mobile card */}
            <div className="px-3 py-2.5 text-xs md:hidden">
              <p className="font-medium">{m.medicineName}</p>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-muted-foreground">
                <span>{slots.join(" · ") || "—"}</span>
                <span>·</span>
                <span>{MEDICINE_TIMING_LABEL[m.timing]}</span>
                <span>·</span>
                <span className="whitespace-nowrap">
                  {m.durationValue} {DURATION_UNIT_LABEL[m.durationUnit]}
                </span>
              </div>
            </div>
            {/* Desktop grid row */}
            <div className="hidden grid-cols-[1fr_110px_90px_80px] items-center px-3 py-2 text-xs md:grid">
              <span className="font-medium">{m.medicineName}</span>
              <span className="text-muted-foreground">
                {slots.join(" · ") || "—"}
              </span>
              <span className="text-muted-foreground">
                {MEDICINE_TIMING_LABEL[m.timing]}
              </span>
              <span className="whitespace-nowrap text-muted-foreground">
                {m.durationValue} {DURATION_UNIT_LABEL[m.durationUnit]}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const VisitRow = ({ visit }: { visit: Visit }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        className="grid w-full grid-cols-[16px_80px_100px_1fr_1fr_100px] items-center gap-3 px-3 py-2.5 text-left text-xs transition-colors hover:bg-accent/30"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="text-muted-foreground">
          {expanded ? (
            <ChevronDown className="size-3.5" />
          ) : (
            <ChevronRight className="size-3.5" />
          )}
        </span>
        <span className="font-mono text-muted-foreground">
          {visit.visitNumber}
        </span>
        <span className="text-muted-foreground">
          {format(parseISO(visit.createdAt), "dd MMM yyyy")}
        </span>
        <span className="truncate text-muted-foreground">
          {visit.symptoms || <span className="text-border">—</span>}
        </span>
        <span className="truncate text-muted-foreground">
          {visit.diagnosis || <span className="text-border">—</span>}
        </span>
        <span>
          <Badge
            variant={VISIT_STATUS_BADGE_VARIANT[visit.status] ?? "outline"}
            className="capitalize"
          >
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
          <PrescriptionDetail prescription={visit.prescription} />
        </div>
      )}
    </div>
  )
}

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>()

  const { data: patientRes, isLoading: isPatientLoading } =
    useGetPatientByIdQuery(id!, {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
    })

  const {
    items: visits,
    page: visitsPage,
    setPage: setVisitsPage,
    total: visitTotal,
    totalPages: visitTotalPages,
    isLoading: isVisitsLoading,
  } = usePaginatedQuery<Visit, { patientId: string }>(
    useGetVisitsQuery,
    { patientId: id! },
    PAGE_SIZE
  )

  const patient = patientRes?.result?.patient

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
    <div className="flex h-full flex-col p-4 sm:p-6">
      {/* Scroll container: fixed height from flex-1, scrolls as a block — children size naturally (no flex-shrink) */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-5">
          <PatientInfoCard patient={patient} />

          {/* Visit History */}
          <div className="flex flex-col overflow-hidden rounded-md border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                  <History className="size-3.5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold">Visit History</h3>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Click a row to expand prescription details.
              </p>
            </div>

            <div className="overflow-y-auto md:max-h-80">
              {/* Header */}
              <div className="grid grid-cols-[16px_80px_100px_1fr_1fr_100px] gap-3 border-b border-border bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
                <span />
                <span>Visit #</span>
                <span>Date</span>
                <span>Symptoms</span>
                <span>Diagnosis</span>
                <span>Status</span>
              </div>
              {isVisitsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner className="size-4" />
                </div>
              ) : visits.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  No visits found for this patient.
                </p>
              ) : (
                visits.map((visit) => <VisitRow key={visit._id} visit={visit} />)
              )}
            </div>
          </div>

          <Pagination
            page={visitsPage}
            totalPages={visitTotalPages}
            total={visitTotal}
            pageSize={PAGE_SIZE}
            onPageChange={setVisitsPage}
          />
        </div>
      </div>
    </div>
  )
}

export default PatientDetail
