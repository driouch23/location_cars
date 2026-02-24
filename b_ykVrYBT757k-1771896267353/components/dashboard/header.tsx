"use client"

import { Bell, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  title: string
  subtitle?: string
}

export function DashboardHeader({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-card-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
          aria-label="View notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </Button>

        {/* Divider */}
        <div className="h-8 w-px bg-border" />

        {/* User profile */}
        <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="User avatar" />
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
              KM
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left md:block">
            <p className="text-sm font-medium text-card-foreground">Karim M.</p>
            <p className="text-[11px] text-muted-foreground">Agency Admin</p>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
        </button>
      </div>
    </header>
  )
}
