"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar"
import { StatsBar } from "@/components/dashboard/stats-bar"
import { SearchView } from "@/components/dashboard/search-view"
import { ReportView } from "@/components/dashboard/report-view"
import { ProtectedRoute } from "@/components/auth/protected-route"

const viewConfig = {
  search: {
    title: "Agency Dashboard",
    subtitle: "Search and verify clients before renting",
  },
  report: {
    title: "Report Client",
    subtitle: "Flag a client incident for the network",
  },
}

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<"search" | "report">("search")

  const { title, subtitle } = viewConfig[activeView]

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <DashboardSidebar activeView={activeView} onViewChange={setActiveView} />
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2 lg:hidden">
              <MobileSidebar activeView={activeView} onViewChange={setActiveView} />
            </div>
            <DashboardHeader title={title} subtitle={subtitle} />
          </div>

          {/* Scrollable content area */}
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">
              {/* Stats Bar */}
              <StatsBar />

              {/* View content */}
              <div className="mt-8">
                {activeView === "search" ? <SearchView /> : <ReportView />}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
