"use client"

import { useState, useEffect } from "react"
import { Search, ShieldAlert, ShieldCheck, Activity, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function StatsBar() {
  const [flaggedCount, setFlaggedCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchesToday, setSearchesToday] = useState<number | null>(null)
  const [isSearchesLoading, setIsSearchesLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(true)
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)

  useEffect(() => {
    async function checkConnection() {
      try {
        const { error } = await supabase
          .from("blacklisted_clients")
          .select("*", { head: true, count: 'exact' })
          .limit(1)

        setIsOnline(!error)
      } catch (error) {
        setIsOnline(false)
      } finally {
        setIsCheckingStatus(false)
      }
    }

    async function fetchFlaggedCount() {
      try {
        const { count, error } = await supabase
          .from("blacklisted_clients")
          .select("*", { count: "exact", head: true })

        if (error) throw error
        setFlaggedCount(count || 0)
      } catch (error) {
        console.error("Error fetching flagged clients count:", error)
        setFlaggedCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    async function fetchSearchesCount() {
      try {
        // NOTE: This assumes a 'search_logs' table exists with a 'created_at' column.
        // TODO: REMINDER - Create the 'search_logs' table in Supabase to enable this stat.
        const today = new Date().toISOString().split('T')[0]
        const { count, error } = await supabase
          .from("search_logs")
          .select("*", { count: "exact", head: true })
          .gte("created_at", `${today}T00:00:00Z`)

        if (error) {
          // If table doesn't exist (error code 42P01 in Postgres), default to 0
          if (error.code === '42P01') {
            console.warn("Table 'search_logs' does not exist. Defaulting to 0 searches today.")
            setSearchesToday(0)
          } else {
            throw error
          }
        } else {
          setSearchesToday(count || 0)
        }
      } catch (error) {
        console.error("Error fetching searches today count:", error)
        setSearchesToday(0)
      } finally {
        setIsSearchesLoading(false)
      }
    }

    checkConnection()
    fetchFlaggedCount()
    fetchSearchesCount()
  }, [])

  const stats = [
    {
      label: "Searches Today",
      value: isSearchesLoading ? "loading" : (searchesToday?.toString() || "0"),
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
      value: isLoading ? "loading" : (flaggedCount?.toString() || "0"),
      icon: ShieldAlert,
      color: "text-destructive" as const,
      bg: "bg-destructive/10" as const,
    },
    {
      label: "Network Status",
      value: isCheckingStatus ? "loading" : (isOnline ? "Online" : "Offline"),
      icon: Activity,
      color: isOnline ? "text-success" as const : "text-destructive" as const,
      bg: isOnline ? "bg-success/10" as const : "bg-destructive/10" as const,
      showDot: true
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        const isStatLoading = stat.value === "loading"

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
              <div className="flex items-center gap-2">
                <div className="text-lg font-semibold text-card-foreground">
                  {isStatLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    stat.value
                  )}
                </div>
                {stat.showDot && !isStatLoading && (
                  <div
                    className={`h-2 w-2 rounded-full ${isOnline ? 'bg-success' : 'bg-destructive'} animate-pulse`}
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
