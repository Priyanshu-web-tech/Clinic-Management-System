import type { ReactNode } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export interface TableColumn {
  name: string
  className?: string
}

export interface TableRow {
  id: string | number
  data: ReactNode[]
}

interface DataTableProps {
  columns: TableColumn[]
  rows: TableRow[]
  isLoading?: boolean
  fallbackMessage?: string
  className?: string
}

const DataTable = ({
  columns,
  rows,
  isLoading = false,
  fallbackMessage = "No data found.",
  className,
}: DataTableProps) => {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-auto rounded-lg border border-border bg-card",
        className
      )}
    >
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.name} className={col.className}>
                {col.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-40 text-center">
                <Spinner className="mx-auto size-5" />
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-40 text-center text-sm text-muted-foreground"
              >
                {fallbackMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.data.map((cell, idx) => (
                  <TableCell key={idx}>{cell}</TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default DataTable
