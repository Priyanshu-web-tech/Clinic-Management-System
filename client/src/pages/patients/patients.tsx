import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Pencil, Trash2, Plus, Search, UserRound, CalendarPlus, Eye } from "lucide-react"

import {
  useGetPatientsQuery,
  useDeletePatientMutation,
} from "@/store/api/patient-api-slice"
import {
  PATIENTS_TABLE_COLUMNS,
  PAGE_SIZE,
  GENDER_OPTIONS,
  GENDER_LABEL,
  BLOOD_GROUP_OPTIONS,
  BLOOD_GROUP_LABEL,
} from "@/constants/constants"
import type { Patient, Gender, BloodGroup } from "@/types/api.types"
import { VisitStatus } from "@/types/api.types"
import { VISIT_STATUS_LABEL, VISIT_STATUS_BADGE_VARIANT } from "@/constants/constants"
import usePaginatedQuery from "@/hooks/use-paginated-query"
import { useVisitEvents } from "@/hooks/use-visit-events"
import { useAppSelector } from "@/store/hook"
import { UserType, Designation } from "@/types/api.types"

import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import DataTable from "@/components/data-table"
import DeleteConfirmDialog from "@/components/delete-confirm-dialog"
import Pagination from "@/components/pagination"
import PatientModal from "./patient-modal"
import VisitModal from "@/pages/visits/visit-modal"

const Patients = () => {
  useVisitEvents()

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [genderFilter, setGenderFilter] = useState<Gender | "">("")
  const [bloodGroupFilter, setBloodGroupFilter] = useState<BloodGroup | "">("")

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Patient | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [visitTarget, setVisitTarget] = useState<Patient | null>(null)
  const [visitOpen, setVisitOpen] = useState(false)

  const navigate = useNavigate()
  const currentUser = useAppSelector((state) => state.userData)
  const canCreateVisit =
    currentUser.userType === UserType.Admin ||
    currentUser.userType === UserType.Doctor ||
    (currentUser.userType === UserType.Staff &&
      currentUser.designation === Designation.Receptionist)
  const canViewDetail =
    currentUser.userType === UserType.Admin ||
    currentUser.userType === UserType.Doctor

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  const {
    items: patients,
    page,
    setPage,
    total,
    totalPages,
    isLoading,
  } = usePaginatedQuery<
    Patient,
    { search?: string; gender?: Gender; bloodGroup?: BloodGroup }
  >(
    useGetPatientsQuery,
    {
      search: debouncedSearch || undefined,
      gender: genderFilter || undefined,
      bloodGroup: bloodGroupFilter || undefined,
    },
    PAGE_SIZE
  )

  const [deletePatient, { isLoading: isDeleting }] = useDeletePatientMutation()

  // ── Handlers ─────────────────────────────────────────────

  const openAdd = () => {
    setEditTarget(null)
    setModalOpen(true)
  }

  const openEdit = (patient: Patient) => {
    setEditTarget(patient)
    setModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      const res = await deletePatient(deleteTarget._id).unwrap()
      toast.success(res.message ?? "Patient removed successfully.")
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Failed to remove patient."
      toast.error(message)
    } finally {
      setDeleteOpen(false)
      setDeleteTarget(null)
    }
  }

  // ── Table rows ───────────────────────────────────────────

  const rows = patients.map((patient) => ({
    id: patient._id,
    data: [
      <span className="font-mono text-xs text-muted-foreground">
        {patient.patientCode}
      </span>,
      <span className="font-medium">
        {patient.firstName} {patient.lastName}
      </span>,
      <span className="text-muted-foreground">
        {patient.phone}
      </span>,
      <Badge variant="outline" className="capitalize">
        {GENDER_LABEL[patient.gender] ?? patient.gender}
      </Badge>,
      <span className="text-muted-foreground">
        {patient.bloodGroup
          ? BLOOD_GROUP_LABEL[patient.bloodGroup] ?? patient.bloodGroup
          : <span className="text-border">—</span>}
      </span>,
      patient.activeVisitStatus &&
      (patient.activeVisitStatus === VisitStatus.Waiting ||
        patient.activeVisitStatus === VisitStatus.InConsultation) ? (
        <Badge
          variant={VISIT_STATUS_BADGE_VARIANT[patient.activeVisitStatus]}
          className="capitalize"
        >
          {VISIT_STATUS_LABEL[patient.activeVisitStatus]}
        </Badge>
      ) : (
        <span className="text-border">—</span>
      ),
      <div className="flex items-center justify-end gap-1">
        {canViewDetail && (
          <button
            onClick={() => navigate(`/patients/${patient._id}`)}
            title="View patient details"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Eye className="size-3.5" />
          </button>
        )}
        {canCreateVisit && (
          <button
            onClick={() => {
              setVisitTarget(patient)
              setVisitOpen(true)
            }}
            title={
              patient.activeVisitStatus === VisitStatus.Waiting
                ? "Patient is already in queue"
                : patient.activeVisitStatus === VisitStatus.InConsultation
                  ? "Patient is already in consultation"
                  : "Move to visit queue"
            }
            disabled={
              patient.activeVisitStatus === VisitStatus.Waiting ||
              patient.activeVisitStatus === VisitStatus.InConsultation
            }
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CalendarPlus className="size-3.5" />
          </button>
        )}
        <button
          onClick={() => openEdit(patient)}
          title="Edit patient"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          onClick={() => {
            setDeleteTarget(patient)
            setDeleteOpen(true)
          }}
          title="Remove patient"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>,
    ],
  }))

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex shrink-0 size-8 items-center justify-center rounded-lg bg-primary/10">
            <UserRound className="size-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">Patients</h2>
            <p className="text-xs text-muted-foreground">
              {total} {total === 1 ? "patient" : "patients"} total
            </p>
          </div>
        </div>
        <Button size="sm" onClick={openAdd} className="shrink-0 gap-1.5">
          <Plus className="size-3.5" />
          Add Patient
        </Button>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8 w-full pl-8 text-xs"
            placeholder="Search by name, phone, or patient code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-32">
          <Select
            value={genderFilter || "all"}
            onValueChange={(v) => setGenderFilter(v === "all" ? "" : (v as Gender))}
          >
            <SelectTrigger className="h-8 w-full text-xs">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All genders</SelectItem>
              {GENDER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-36">
          <Select
            value={bloodGroupFilter || "all"}
            onValueChange={(v) => setBloodGroupFilter(v === "all" ? "" : (v as BloodGroup))}
          >
            <SelectTrigger className="h-8 w-full text-xs">
              <SelectValue placeholder="Blood group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All blood groups</SelectItem>
              {BLOOD_GROUP_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={PATIENTS_TABLE_COLUMNS}
        rows={rows}
        isLoading={isLoading}
        fallbackMessage="No patients found."
        className="mt-5"
      />

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      {/* Add / Edit Modal */}
      <PatientModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditTarget(null)
        }}
        editTarget={editTarget}
      />

      {/* Move to Visit Modal */}
      <VisitModal
        open={visitOpen}
        onClose={() => {
          setVisitOpen(false)
          setVisitTarget(null)
        }}
        patient={visitTarget}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Remove Patient"
        confirmLabel="Remove"
        description={
          <>
            Are you sure you want to remove{" "}
            <span className="font-medium text-foreground">
              {deleteTarget?.firstName} {deleteTarget?.lastName}
            </span>{" "}
            from the records? This action cannot be undone.
          </>
        }
      />
    </div>
  )
}

export default Patients
