"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import { DashboardSidebar } from "./sidebar"

interface MobileSidebarProps {
  activeView: "search" | "report"
  onViewChange: (view: "search" | "report") => void
}

export function MobileSidebar({ activeView, onViewChange }: MobileSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <DashboardSidebar activeView={activeView} onViewChange={onViewChange} />
      </SheetContent>
    </Sheet>
  )
}
