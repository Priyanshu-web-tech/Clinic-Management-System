import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const DONUT_COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#f43f5e"]

const CustomTooltip = ({ active, payload }: {
  active?: boolean
  payload?: { name?: string; value?: number; color?: string }[]
}) => {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: 10,
      padding: "8px 12px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
      minWidth: 130,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: entry.color, flexShrink: 0, display: "inline-block" }} />
        <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{entry.name}</span>
      </div>
      <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>{entry.value} visits</p>
    </div>
  )
}

const TodayBreakdownChart = ({
  waiting, inConsultation, completed, cancelled, loading,
}: {
  waiting: number; inConsultation: number; completed: number; cancelled: number; loading: boolean
}) => {
  const data = [
    { name: "Waiting", value: waiting },
    { name: "In Consultation", value: inConsultation },
    { name: "Completed", value: completed },
    { name: "Cancelled", value: cancelled },
  ].filter((d) => d.value > 0)

  const total = waiting + inConsultation + completed + cancelled

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
      <p className="mb-1 text-sm font-semibold text-foreground">Today's Breakdown</p>
      <p className="mb-4 text-xs text-muted-foreground">
        {total > 0 ? `${total} total visits today` : "No visits recorded today"}
      </p>
      {total === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          No data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
              {data.map((_, i) => (
                <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default TodayBreakdownChart
