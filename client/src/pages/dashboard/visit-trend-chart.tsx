import { format, parseISO } from "date-fns"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { VisitTrendDay } from "@/types/api.types"

const TREND_COLORS = {
  completed: "var(--color-emerald, #10b981)",
  cancelled: "var(--color-rose, #f43f5e)",
}

const VisitTrendChart = ({ data, loading }: { data: VisitTrendDay[]; loading: boolean }) => {
  const formatted = data.map((d) => ({
    ...d,
    label: format(parseISO(d.date), "EEE"),
  }))

  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl border bg-card p-6 shadow-sm">
        <div className="mb-4 h-4 w-40 rounded-lg bg-muted" />
        <div className="h-48 rounded-lg bg-muted" />
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="mb-1 text-sm font-semibold text-foreground">7-Day Visit Trend</p>
      <p className="mb-4 text-xs text-muted-foreground">Completed vs Cancelled visits over the last 7 days</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={formatted} margin={{ top: 4, right: 20, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={TREND_COLORS.completed} stopOpacity={0.25} />
              <stop offset="95%" stopColor={TREND_COLORS.completed} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradCancelled" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={TREND_COLORS.cancelled} stopOpacity={0.25} />
              <stop offset="95%" stopColor={TREND_COLORS.cancelled} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
            labelStyle={{ fontWeight: 600 }}
          />
          <Area type="monotone" dataKey="completed" name="Completed" stroke={TREND_COLORS.completed} strokeWidth={2} fill="url(#gradCompleted)" dot={false} activeDot={{ r: 4 }} />
          <Area type="monotone" dataKey="cancelled" name="Cancelled" stroke={TREND_COLORS.cancelled} strokeWidth={2} fill="url(#gradCancelled)" dot={false} activeDot={{ r: 4 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default VisitTrendChart
