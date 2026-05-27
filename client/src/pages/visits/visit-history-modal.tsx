import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { ChevronDown, ChevronRight, Pill } from "lucide-react"
import type { PrescriptionMedicine, Visit } from "@/types/api.types"
import { useGetVisitsQuery } from "@/store/api/visit-api-slice"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Pagination from "@/components/pagination"

const HistoryVisitRow = ({
  visit,
}: {
  visit: {
    _id: string
    visitNumber: string
    createdAt: string
    status: string
    symptoms: string
    diagnosis: string
    prescription: { medicines: PrescriptionMedicine[] } | null
  }
}) => {
  const [expanded, setExpanded] = useState(false)
  const { prescription } = visit
  const hasPrescription = prescription && prescription.medicines.length > 0

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        className="grid min-w-130 w-full grid-cols-[16px_80px_100px_1fr_1fr_100px] items-center gap-3 px-3 py-2.5 text-left text-xs transition-colors hover:bg-accent/30"
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
          {hasPrescription ? (
            <div className="overflow-x-auto rounded-md border border-border bg-muted/20">
              <div className="grid min-w-96 grid-cols-[1fr_110px_90px_80px] border-b border-border px-3 py-1.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
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
                    className="grid min-w-96 grid-cols-[1fr_110px_90px_80px] items-center border-b border-border px-3 py-2 text-xs last:border-b-0"
                  >
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
                )
              })}
            </div>
          ) : (
            <p className="py-2 text-xs text-muted-foreground">
              No prescription for this visit.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

interface VisitHistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientName: string
  patientId: string
  currentVisitId: string
}

const VisitHistoryModal = ({
  open,
  onOpenChange,
  patientName,
  patientId,
  currentVisitId,
}: VisitHistoryModalProps) => {
  const { items, page, setPage, total, isLoading } = usePaginatedQuery<
    Visit,
    { patientId: string }
  >(useGetVisitsQuery, { patientId }, PAGE_SIZE, !open || !patientId)

  useEffect(() => {
    if (!open) setPage(1)
  }, [open, setPage])

  const previousVisits = items.filter((v) => v._id !== currentVisitId)
  const adjustedTotal = Math.max(0, total - 1)
  const totalPages = Math.ceil(adjustedTotal / PAGE_SIZE) || 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Previous Visits — {patientName}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner className="size-5" />
          </div>
        ) : previousVisits.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No previous visits found.
          </p>
        ) : (
          <>
            <div className="mt-4 max-h-[60vh] overflow-auto rounded-md border border-border">
              <div className="grid min-w-130 grid-cols-[16px_80px_100px_1fr_1fr_100px] gap-3 border-b border-border bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
                <span />
                <span>Visit #</span>
                <span>Date</span>
                <span>Symptoms</span>
                <span>Diagnosis</span>
                <span>Status</span>
              </div>
              {previousVisits.map((v) => (
                <HistoryVisitRow key={v._id} visit={v} />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={adjustedTotal}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default VisitHistoryModal
