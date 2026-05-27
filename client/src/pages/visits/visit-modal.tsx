import { useState } from "react"
import { toast } from "sonner"

import { useCreateVisitMutation } from "@/store/api/visit-api-slice"
import type { Patient } from "@/types/api.types"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// ── Types ─────────────────────────────────────────────────

interface VisitModalProps {
  open: boolean
  onClose: () => void
  patient: Patient | null
}

// ── Component ─────────────────────────────────────────────

const VisitModal = ({ open, onClose, patient }: VisitModalProps) => {
  const [createVisit, { isLoading }] = useCreateVisitMutation()
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!patient || submitted) return
    setSubmitted(true)
    try {
      const res = await createVisit({ patientId: patient._id }).unwrap()
      toast.success(res.message ?? "Patient moved to queue successfully.")
      onClose()
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Something went wrong. Please try again."
      toast.error(message)
    } finally {
      setSubmitted(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Move to Visit Queue</DialogTitle>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Patient</Label>
            <div className="flex h-8 items-center rounded-md border border-input bg-muted px-3 text-xs text-muted-foreground">
              {patient
                ? `${patient.firstName} ${patient.lastName} (${patient.patientCode})`
                : "—"}
            </div>
          </div>

          <DialogFooter className="mt-1">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </button>
            <Button size="sm" disabled={isLoading} className="h-8 text-xs" onClick={handleSubmit}>
              {isLoading && <Spinner className="mr-1.5 size-3" />}
              Move to Queue
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default VisitModal
