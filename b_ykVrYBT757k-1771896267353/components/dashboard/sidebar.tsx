"use client"

import { Search, Flag, ShieldCheck, Car } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeView: "search" | "report"
  onViewChange: (view: "search" | "report") => void
}

const navItems = [
  { id: "search" as const, label: "Search Client", icon: Search },
  { id: "report" as const, label: "Report Client", icon: Flag },
]

export function DashboardSidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <ShieldCheck className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight text-sidebar-foreground">
            RentGuard
          </h1>
          <p className="text-xs text-sidebar-foreground/50">Client Verification</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-widest text-sidebar-foreground/40">
          Navigation
        </p>
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="mx-4 h-px bg-sidebar-border" />
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 px-3 py-3">
          <Car className="h-5 w-5 text-sidebar-primary" />
          <div>
            <p className="text-xs font-medium text-sidebar-foreground/90">Agency Plan</p>
            <p className="text-[11px] text-sidebar-foreground/50">Pro License Active</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
