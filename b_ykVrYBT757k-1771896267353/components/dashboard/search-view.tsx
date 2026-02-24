"use client"

import { useState } from "react"
import { Search, ScanLine, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SuccessCard, AlertCard } from "./result-cards"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/providers/auth-provider"

interface BlacklistedClient {
  id: string
  cin_number: string
  incident_type: string
  description: string
  created_at: string
}

export function SearchView() {
  const { user } = useAuth()
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [clientData, setClientData] = useState<BlacklistedClient | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsLoading(true)
    const cinUpper = query.trim().toUpperCase()

    try {
      const { data, error } = await supabase
        .from("blacklisted_clients")
        .select("id")
        .eq("cin_number", cinUpper)
        .maybeSingle()

      const hasMatch = !!data

      // Log the search in history
      if (user) {
        await supabase.from("search_history").insert([
          {
            agency_id: user.id,
            search_query: cinUpper,
            has_match: hasMatch,
          }
        ])
      }

      // Redirect to results page
      window.location.href = `/search/results?q=${cinUpper}`
    } catch (error) {
      console.error("Unexpected error:", error)
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Search Section */}
      <div className="text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <ScanLine className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
          Client Verification
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Search for a client by CIN or driver&apos;s license number to verify their rental history.
        </p>
      </div>

      {/* Search Input */}
      <div className="mt-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter CIN or Driver's License Number"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch()
              }}
              className="h-12 rounded-xl border-border bg-card pl-11 text-sm text-card-foreground shadow-sm placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/20"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isLoading}
            className="h-12 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </div>
        <p className="mt-2.5 text-xs text-muted-foreground">
          Example: AB123456 or DL-2025-789012
        </p>
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="mt-10">
          <div className="mb-5 flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Search Results
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col gap-5">
            {clientData ? (
              <AlertCard
                incident_type={clientData.incident_type}
                description={clientData.description}
                created_at={clientData.created_at}
              />
            ) : (
              <SuccessCard />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

