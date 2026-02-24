"use client"

import { Search, Flag, ShieldCheck, Car, History, Home, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
  activeView?: "search" | "report"
  onViewChange?: (view: "search" | "report") => void
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, href: "/" },
  { id: "history", label: "Search History", icon: History, href: "/search/history" },
  { id: "insights", label: "Agency Insights", icon: Activity, href: "/insights" },
]

const mainActions = [
  { id: "search" as const, label: "Search Client", icon: Search },
  { id: "report" as const, label: "Report Client", icon: Flag },
]

export function DashboardSidebar({ activeView, onViewChange }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <ShieldCheck className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight text-sidebar-foreground">
            RentGuard
          </h1>
          <p className="text-xs text-sidebar-foreground/50 font-medium">Client Verification</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6">
        <div>
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-widest text-sidebar-foreground/30">
            Main Menu
          </p>
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {onViewChange && (
          <div>
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-widest text-sidebar-foreground/30">
              Actions
            </p>
            <ul className="flex flex-col gap-1">
              {mainActions.map((item) => {
                const Icon = item.icon
                const isActive = activeView === item.id
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onViewChange(item.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
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
          </div>
        )}
      </nav>

      {/* Bottom section */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/50 px-3 py-3 border border-sidebar-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary/10">
            <Car className="h-4 w-4 text-sidebar-primary" />
          </div>
          <div>
            <p className="text-xs font-bold text-sidebar-foreground/90 tracking-tight">Agency Plan</p>
            <p className="text-[10px] text-sidebar-foreground/40 font-medium">Pro License Active</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
