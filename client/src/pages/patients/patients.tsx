import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Pencil, Trash2, Plus, Search, UserRound } from "lucide-react"

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
import usePaginatedQuery from "@/hooks/use-paginated-query"

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

const Patients = () => {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [genderFilter, setGenderFilter] = useState<Gender | "">("")
  const [bloodGroupFilter, setBloodGroupFilter] = useState<BloodGroup | "">("")

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Patient | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

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
      await deletePatient(deleteTarget._id).unwrap()
      toast.success("Patient removed successfully.")
    } catch {
      toast.error("Failed to remove patient.")
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
      <div className="flex items-center justify-end gap-1">
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
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <UserRound className="size-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Patients</h2>
            <p className="text-xs text-muted-foreground">
              {total} {total === 1 ? "patient" : "patients"} total
            </p>
          </div>
        </div>
        <Button size="sm" onClick={openAdd} className="gap-1.5">
          <Plus className="size-3.5" />
          Add Patient
        </Button>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm min-w-48 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8 pl-8 text-xs"
            placeholder="Search by name, phone, or patient code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-32">
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
        <div className="w-36">
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
