import { Search, ShieldAlert, ShieldCheck, Activity } from "lucide-react"

const stats = [
  {
    label: "Searches Today",
    value: "24",
    icon: Search,
    color: "text-primary" as const,
    bg: "bg-primary/10" as const,
  },
  {
    label: "Cleared Clients",
    value: "18",
    icon: ShieldCheck,
    color: "text-success" as const,
    bg: "bg-success/10" as const,
  },
  {
    label: "Flagged Clients",
    value: "6",
    icon: ShieldAlert,
    color: "text-destructive" as const,
    bg: "bg-destructive/10" as const,
  },
  {
    label: "Network Status",
    value: "Online",
    icon: Activity,
    color: "text-success" as const,
    bg: "bg-success/10" as const,
  },
]

export function StatsBar() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}
            >
              <Icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-lg font-semibold text-card-foreground">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
