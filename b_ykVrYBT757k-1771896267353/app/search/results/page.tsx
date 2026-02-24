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
    license_number?: string
    incident_type: string
    severity?: 'High' | 'Medium' | 'Low'
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
    const [error, setError] = useState<string | null>(null)
    const [allIncidents, setAllIncidents] = useState<BlacklistedClient[]>([])

    useEffect(() => {
        async function fetchResults() {
            if (!cin) {
                setLoading(false)
                return
            }

            // Strict normalization: trim and uppercase
            const normalizedCin = cin.trim().toUpperCase()

            try {
                setError(null)
                const { data, error: supabaseError } = await supabase
                    .from("blacklisted_clients")
                    .select("*")
                    .ilike("cin_number", normalizedCin)
                    .order('created_at', { ascending: false })
                    .limit(1)

                if (supabaseError) throw supabaseError

                if (data && data.length > 0) {
                    const client = data[0]

                    // Fetch profile separately to avoid "Relationship not found" errors
                    if (client.reported_by) {
                        const { data: profileData } = await supabase
                            .from("profiles")
                            .select("agency_name")
                            .eq("id", client.reported_by)
                            .maybeSingle()

                        if (profileData) {
                            client.profiles = profileData
                        }
                    }
                    setClientData(client)
                } else {
                    setClientData(null)
                }
            } catch (err: any) {
                console.error("Error fetching results:", err)
                setError(err.message || "Failed to query the blacklist database.")
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
                <p className="text-muted-foreground font-medium">Verifying global security database...</p>
            </div>
        )
    }

    if (error) {
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

                <div className="overflow-hidden rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-foreground">Database Query Failed</h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                        We couldn't verify this CIN due to a database error. Please ensure the global search policy is applied.
                    </p>
                    <div className="mt-6 rounded-lg bg-destructive/10 p-3 text-xs font-mono text-destructive">
                        Error: {error}
                    </div>
                </div>
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
                {allIncidents.length > 0 ? (
                    <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="overflow-hidden rounded-2xl border border-destructive/20 bg-destructive/[0.02] shadow-sm">
                            <div className="flex items-center justify-between border-b border-destructive/10 bg-destructive/5 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15">
                                        <ShieldAlert className="h-6 w-6 text-destructive" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-destructive">Client Flagged: {allIncidents.length} Incident(s)</h2>
                                        <p className="text-sm text-destructive/80 font-medium tracking-tight">
                                            Search Query: {cin?.toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                                <div className="rounded-full bg-destructive/10 px-4 py-1.5 text-xs font-bold text-destructive uppercase tracking-wider">
                                    Awaiting Deep Review
                                </div>
                            </div>

                            {/* Header Info */}
                            <div className="bg-card p-6 border-b border-border/50 grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Primary CIN</p>
                                    <p className="text-sm font-bold">{allIncidents[0].cin_number}</p>
                                </div>
                                {allIncidents[0].license_number && (
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Permis de conduire</p>
                                        <p className="text-sm font-bold">{allIncidents[0].license_number}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Risk Status</p>
                                    <p className={`text-sm font-bold ${allIncidents.some(i => i.severity === 'High') ? 'text-destructive' : 'text-warning'}`}>
                                        {allIncidents.some(i => i.severity === 'High') ? 'CRITICAL RISK' : 'MODERATE RISK'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Timeline / Technical Card */}
                        <div className="rounded-2xl border border-border bg-card shadow-lg p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <ShieldAlert className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-bold">Historical Incident Timeline</h3>
                            </div>

                            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                                {allIncidents.map((incident, index) => (
                                    <div key={incident.id} className="relative flex items-start gap-8 group">
                                        {/* Timeline Dot */}
                                        <div className={`mt-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-background transition-shadow group-hover:shadow-md ${incident.severity === 'High' ? 'bg-destructive' :
                                                incident.severity === 'Medium' ? 'bg-warning' : 'bg-primary'
                                            }`}>
                                            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                        </div>

                                        {/* Incident Content */}
                                        <div className="flex-1 rounded-xl border border-border/50 bg-accent/30 p-5 transition-colors hover:bg-accent/50">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className={`rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-white ${incident.severity === 'High' ? 'bg-destructive shadow-sm' :
                                                            incident.severity === 'Medium' ? 'bg-warning' : 'bg-primary'
                                                        }`}>
                                                        {incident.severity || 'Medium'}
                                                    </span>
                                                    <h4 className="text-sm font-bold capitalize">{incident.incident_type}</h4>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {format(new Date(incident.created_at), "PPP")}
                                                </div>
                                            </div>

                                            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                                                {incident.description}
                                            </p>

                                            <div className="grid grid-cols-2 gap-4 border-t border-border/30 pt-4">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <div className="text-[11px]">
                                                        <span className="text-muted-foreground uppercase font-bold mr-1 tracking-tighter">Agency:</span>
                                                        <span className="font-bold">{incident.profiles?.agency_name || "Private Agent"}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <div className="text-[11px]">
                                                        <span className="text-muted-foreground uppercase font-bold mr-1 tracking-tighter">City:</span>
                                                        <span className="font-bold">{incident.city}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Verification Disclaimer */}
                        <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 flex gap-3">
                            <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                            <p className="text-xs text-warning-foreground leading-tight">
                                <strong>Technical Notice:</strong> This timeline is generated from global signals. Agencies should perform their own due diligence before concluding rental agreements.
                            </p>
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
