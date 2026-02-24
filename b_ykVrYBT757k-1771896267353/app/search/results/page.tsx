"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ShieldAlert, ShieldCheck, MapPin, Calendar, Building2, ChevronLeft, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { format } from "date-fns"

interface BlacklistedClient {
    id: string
    cin_number: string
    incident_type: string
    description: string
    created_at: string
    city: string
    reported_by: string
    profiles?: {
        agency_name: string
    }
}

function SearchResultsContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const cin = searchParams.get("q")
    const [loading, setLoading] = useState(true)
    const [clientData, setClientData] = useState<BlacklistedClient | null>(null)

    useEffect(() => {
        async function fetchResults() {
            if (!cin) {
                setLoading(false)
                return
            }

            const normalizedCin = cin.trim().toUpperCase()

            try {
                const { data, error } = await supabase
                    .from("blacklisted_clients")
                    .select(`
            *,
            profiles:reported_by (
              agency_name
            )
          `)
                    .ilike("cin_number", normalizedCin)
                    .order('created_at', { ascending: false })
                    .limit(1)

                if (error) throw error
                setClientData(data && data.length > 0 ? data[0] : null)
            } catch (error) {
                console.error("Error fetching results:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchResults()
    }, [cin])

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">Analyzing database records...</p>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="group -ml-3 text-muted-foreground hover:text-foreground"
            >
                <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Dashboard
            </Button>

            <div className="flex flex-col gap-6">
                {clientData ? (
                    <div className="overflow-hidden rounded-2xl border border-destructive/20 bg-destructive/[0.02] shadow-sm">
                        {/* Alert Header */}
                        <div className="flex items-center gap-4 border-b border-destructive/10 bg-destructive/5 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15">
                                <ShieldAlert className="h-6 w-6 text-destructive" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-destructive">Flagged Client Detected</h2>
                                <p className="text-sm text-destructive/80 font-medium tracking-tight">CIN: {clientData.cin_number}</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="grid gap-6 p-8 md:grid-cols-2">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Incident Details</h3>
                                    <div className="mt-4 flex items-center gap-3">
                                        <div className="rounded-lg bg-destructive/10 px-3 py-1 text-sm font-bold text-destructive capitalize">
                                            {clientData.incident_type}
                                        </div>
                                    </div>
                                    <p className="mt-4 text-sm leading-relaxed text-card-foreground">
                                        {clientData.description}
                                    </p>
                                </div>

                                <div className="space-y-4 rounded-xl border border-border/50 bg-card p-4">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Reported By</p>
                                            <p className="text-sm font-semibold">{clientData.profiles?.agency_name || "Private Agency"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Information</h3>
                                    <div className="mt-4 space-y-4">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                                                <MapPin className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="font-medium">{clientData.city || "Unknown Location"}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                                                <Calendar className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="font-medium">Incident Date: {format(new Date(clientData.created_at), "PPP")}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 flex gap-3">
                                    <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                                    <p className="text-xs text-warning-foreground leading-tight">
                                        <strong>Notice:</strong> This report is for informational purposes. Each agency is responsible for their own rental decisions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-success/20 bg-success/[0.02] shadow-sm">
                        <div className="flex items-center gap-4 border-b border-success/10 bg-success/5 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/15">
                                <ShieldCheck className="h-6 w-6 text-success" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-success">Client Cleared</h2>
                                <p className="text-sm text-success/80 font-medium tracking-tight">CIN: {cin?.toUpperCase()}</p>
                            </div>
                        </div>

                        <div className="p-12 text-center">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                                <ShieldCheck className="h-10 w-10 text-success" />
                            </div>
                            <h3 className="mt-6 text-xl font-semibold text-foreground">No Negative Records Found</h3>
                            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                                This client has no reported incidents in the RentGuard network. You can proceed with standard verification procedures.
                            </p>
                            <Button
                                onClick={() => router.push("/")}
                                className="mt-8 bg-success hover:bg-success/90"
                            >
                                Back to Dashboard
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function SearchResultsPage() {
    return (
        <div className="flex min-h-screen bg-background">
            <DashboardSidebar />
            <div className="flex flex-1 flex-col">
                <DashboardHeader title="Verification Results" />
                <main className="p-8">
                    <Suspense fallback={<div>Loading result details...</div>}>
                        <SearchResultsContent />
                    </Suspense>
                </main>
            </div>
        </div>
    )
}
