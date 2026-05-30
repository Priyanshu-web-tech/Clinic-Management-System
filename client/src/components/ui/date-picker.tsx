import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isAfter,
  isBefore,
  setMonth,
  setYear,
  getMonth,
  getYear,
} from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const DEFAULT_MIN_YEAR = 1900

type HeaderMode = "calendar" | "month" | "year"

interface DatePickerProps {
  value?: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  className?: string
  onBlur?: () => void
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  clearable?: boolean
}

function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  onBlur,
  disabled,
  minDate,
  maxDate = new Date(),
  clearable = true,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [headerMode, setHeaderMode] = React.useState<HeaderMode>("calendar")
  const selected = value ? parseISO(value) : undefined
  const [viewMonth, setViewMonth] = React.useState<Date>(selected ?? new Date())

  const minYear = minDate ? minDate.getFullYear() : DEFAULT_MIN_YEAR
  const maxYear = maxDate.getFullYear()
  const years = React.useMemo(
    () => Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i),
    [minYear, maxYear]
  )

  const yearListRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (selected) setViewMonth(selected)
  }, [value])

  // Scroll selected year into view when year picker opens
  React.useEffect(() => {
    if (headerMode === "year" && yearListRef.current) {
      const active = yearListRef.current.querySelector("[data-active='true']")
      active?.scrollIntoView({ block: "center" })
    }
  }, [headerMode])

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewMonth)),
    end: endOfWeek(endOfMonth(viewMonth)),
  })

  const handleSelect = (day: Date) => {
    if (isAfter(day, maxDate)) return
    if (minDate && isBefore(day, minDate)) return
    onChange(format(day, "yyyy-MM-dd"))
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  const handleMonthPick = (monthIndex: number) => {
    setViewMonth((m) => setMonth(m, monthIndex))
    setHeaderMode("calendar")
  }

  const handleYearPick = (year: number) => {
    setViewMonth((m) => setYear(m, year))
    setHeaderMode("calendar")
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) setHeaderMode("calendar")
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          onBlur={onBlur}
          className={cn(
            "flex h-8 w-full items-center gap-2 rounded-md border border-input bg-background px-2 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="flex-1">
            {selected ? format(selected, "dd MMM yyyy") : placeholder}
          </span>
          {selected && clearable && (
            <X
              className="size-3 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={handleClear}
            />
          )}
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className="z-50 w-70 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setViewMonth((m) => {
                  const d = new Date(m)
                  d.setMonth(d.getMonth() - 1)
                  return d
                })
              }
              className={cn(
                "flex size-7 items-center justify-center rounded-md hover:bg-accent",
                headerMode !== "calendar" && "invisible"
              )}
            >
              <ChevronLeft className="size-4" />
            </button>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setHeaderMode((m) => (m === "month" ? "calendar" : "month"))
                }
                className={cn(
                  "rounded px-1.5 py-0.5 text-sm font-medium hover:bg-accent",
                  headerMode === "month" && "bg-accent"
                )}
              >
                {format(viewMonth, "MMMM")}
              </button>
              <button
                type="button"
                onClick={() =>
                  setHeaderMode((m) => (m === "year" ? "calendar" : "year"))
                }
                className={cn(
                  "rounded px-1.5 py-0.5 text-sm font-medium hover:bg-accent",
                  headerMode === "year" && "bg-accent"
                )}
              >
                {format(viewMonth, "yyyy")}
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                setViewMonth((m) => {
                  const d = new Date(m)
                  d.setMonth(d.getMonth() + 1)
                  return d
                })
              }
              className={cn(
                "flex size-7 items-center justify-center rounded-md hover:bg-accent",
                headerMode !== "calendar" && "invisible"
              )}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Month picker */}
          {headerMode === "month" && (
            <div className="grid grid-cols-3 gap-1">
              {MONTHS.map((name, idx) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleMonthPick(idx)}
                  className={cn(
                    "rounded-md py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                    getMonth(viewMonth) === idx &&
                      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {/* Year picker */}
          {headerMode === "year" && (
            <div
              ref={yearListRef}
              className="grid grid-cols-3 gap-1 max-h-48 overflow-y-auto"
              onWheel={(e) => e.stopPropagation()}
            >
              {years.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  data-active={getYear(viewMonth) === yr}
                  onClick={() => handleYearPick(yr)}
                  className={cn(
                    "rounded-md py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                    getYear(viewMonth) === yr &&
                      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  )}
                >
                  {yr}
                </button>
              ))}
            </div>
          )}

          {/* Calendar */}
          {headerMode === "calendar" && (
            <>
              <div className="mb-1 grid grid-cols-7">
                {WEEKDAYS.map((d) => (
                  <div
                    key={d}
                    className="flex size-8 items-center justify-center text-[0.75rem] font-normal text-muted-foreground"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {days.map((day) => {
                  const isSelected = selected ? isSameDay(day, selected) : false
                  const isDisabled = isAfter(day, maxDate) || (!!minDate && isBefore(day, minDate))

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleSelect(day)}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-md text-sm transition-colors",
                        isDisabled && "cursor-not-allowed opacity-35",
                        isSelected
                          ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

export { DatePicker }
