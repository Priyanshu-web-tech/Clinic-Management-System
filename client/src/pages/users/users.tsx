import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  Users as UsersIcon,
} from "lucide-react"

import {
  useGetUsersQuery,
  useDeleteUserMutation,
} from "@/store/api/user-api-slice"
import { DESIGNATION_OPTIONS, DESIGNATION_LABEL, USERS_TABLE_COLUMNS } from "@/constants/constants"
import type { StaffUser, Designation } from "@/types/api.types"

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
import UserModal from "./user-modal"

// ── Constants ─────────────────────────────────────────────

const PAGE_SIZE = 10

const DESIGNATION_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "success" | "warning" | "outline"
> = {
  receptionist: "success",
  chemist: "warning",
}

// ── Component ─────────────────────────────────────────────

const Users = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [designationFilter, setDesignationFilter] = useState<Designation | "">("")

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<StaffUser | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<StaffUser | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading } = useGetUsersQuery(
    {
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch || undefined,
      designation: designationFilter || undefined,
    },
    { refetchOnMountOrArgChange: true, refetchOnFocus: true }
  )

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation()

  const users = data?.result?.users ?? []
  const total = data?.result?.total ?? 0
  const totalPages = data?.result?.totalPages ?? 1

  // ── Handlers ─────────────────────────────────────────────

  const handleDesignationFilter = (value: string) => {
    setDesignationFilter(value === "all" ? "" : (value as Designation))
    setPage(1)
  }

  const openAdd = () => {
    setEditTarget(null)
    setModalOpen(true)
  }

  const openEdit = (user: StaffUser) => {
    setEditTarget(user)
    setModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await deleteUser(deleteTarget._id).unwrap()
      toast.success("Member removed successfully.")
    } catch {
      toast.error("Failed to remove member.")
    } finally {
      setDeleteOpen(false)
      setDeleteTarget(null)
    }
  }

  // ── Table rows ───────────────────────────────────────────

  const rows = users.map((user) => ({
    id: user._id,
    data: [
      <span className="font-medium">
        {user.firstName} {user.lastName}
      </span>,
      <span className="text-muted-foreground">{user.email}</span>,
      <span className="text-muted-foreground">
        {user.phone || <span className="text-border">—</span>}
      </span>,
      <Badge variant={DESIGNATION_BADGE_VARIANT[user.designation ?? ""] ?? "outline"}>
        {user.designation
          ? DESIGNATION_LABEL[user.designation]
          : <span className="text-muted-foreground">—</span>}
      </Badge>,
      <Badge variant={user.isActive ? "success" : "secondary"}>
        {user.isActive ? "Active" : "Inactive"}
      </Badge>,
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => openEdit(user)}
          title="Edit member"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          onClick={() => {
            setDeleteTarget(user)
            setDeleteOpen(true)
          }}
          title="Remove member"
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
            <UsersIcon className="size-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Team</h2>
            <p className="text-xs text-muted-foreground">
              {total} {total === 1 ? "member" : "members"} total
            </p>
          </div>
        </div>
        <Button size="sm" onClick={openAdd} className="gap-1.5">
          <Plus className="size-3.5" />
          Add Member
        </Button>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm min-w-48 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8 pl-8 text-xs"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-36">
          <Select value={designationFilter || "all"} onValueChange={handleDesignationFilter}>
            <SelectTrigger className="h-8 w-full text-xs">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {DESIGNATION_OPTIONS.map((opt) => (
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
        columns={USERS_TABLE_COLUMNS}
        rows={rows}
        isLoading={isLoading}
        fallbackMessage="No team members found."
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
      <UserModal
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
        title="Remove Member"
        confirmLabel="Remove"
        description={
          <>
            Are you sure you want to remove{" "}
            <span className="font-medium text-foreground">
              {deleteTarget?.firstName} {deleteTarget?.lastName}
            </span>{" "}
            from your team? This action cannot be undone.
          </>
        }
      />
    </div>
  )
}

export default Users
