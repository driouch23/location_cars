"use client"

import { useEffect, useState, useMemo } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { IncidentCharts } from "@/components/dashboard/incident-charts"
import { InteractiveMap } from "@/components/dashboard/interactive-map"
import { supabase } from "@/lib/supabase"
import { Loader2, TrendingUp, AlertCircle, Map as MapIcon, Info, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function InsightsPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isGlobal, setIsGlobal] = useState(false)
    const [stats, setStats] = useState<{
        trend: any[],
        types: any[],
        cities: any[],
        agencies: any[],
        totalSearches: number,
        totalIncidents: number
    } | null>(null)

    useEffect(() => {
        async function fetchInsightData() {
            if (!user) return
            setLoading(true)
            setError(null)
            try {
                const currentYear = new Date().getFullYear()
                const startOfYear = `${currentYear}-01-01T00:00:00Z`
                console.log("DEBUG: Fetching insights for User:", user.id, "Year:", currentYear)

                // 0. Fetch Registered Agencies (Profiles)
                const { data: profiles, error: profileError } = await supabase
                    .from("profiles")
                    .select("id, agency_name, city")

                if (profileError) throw profileError

                // 1. Fetch Agency-specific data
                let { data: incidents, error: incidentError } = await supabase
                    .from("blacklisted_clients")
                    .select("created_at, incident_type, city")
                    .eq("reported_by", user.id)
                    .gte("created_at", startOfYear)

                let { data: searches, error: searchError } = await supabase
                    .from("search_history")
                    .select("created_at")
                    .eq("agency_id", user.id)
                    .gte("created_at", startOfYear)

                if (incidentError) throw incidentError
                if (searchError) throw searchError

                console.log("DEBUG: Agency Incidents:", incidents?.length || 0)
                console.log("DEBUG: Agency Searches:", searches?.length || 0)

                // 2. Fallback to Global stats if Agency stats are empty
                const hasAgencyData = (incidents && incidents.length > 0) || (searches && searches.length > 0)
                console.log("DEBUG: Has Agency Data:", hasAgencyData)

                if (!hasAgencyData) {
                    setIsGlobal(true)
                    const { data: globalIncidents, error: gIError } = await supabase
                        .from("blacklisted_clients")
                        .select("created_at, incident_type, city")
                        .gte("created_at", startOfYear)

                    const { data: globalSearches, error: gSError } = await supabase
                        .from("search_history")
                        .select("created_at")
                        .gte("created_at", startOfYear)

                    if (gIError) throw gIError
                    if (gSError) throw gSError

                    incidents = globalIncidents
                    searches = globalSearches
                    console.log("DEBUG: Falling back to Global. Incidents:", incidents?.length || 0, "Searches:", searches?.length || 0)
                } else {
                    setIsGlobal(false)
                }

                if (!incidents || !searches) {
                    setStats({ trend: [], types: [], cities: [], agencies: [], totalSearches: 0, totalIncidents: 0 })
                    return
                }

                // Data Aggregation logic
                const monthlyData: Record<string, { flags: number; searches: number }> = {}
                const typeData: Record<string, number> = {}
                const cityData: Record<string, number> = {}

                // Prep months
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                const currentMonthIdx = new Date().getMonth()
                months.slice(0, currentMonthIdx + 1).forEach(m => {
                    monthlyData[m] = { flags: 0, searches: 0 }
                })

                incidents.forEach(item => {
                    if (item.created_at) {
                        const date = new Date(item.created_at)
                        const month = date.toLocaleString('default', { month: 'short' })
                        if (monthlyData[month]) {
                            monthlyData[month].flags++
                        }
                    }

                    const type = item.incident_type || "Other"
                    typeData[type] = (typeData[type] || 0) + 1

                    const city = item.city || "Other"
                    cityData[city] = (cityData[city] || 0) + 1
                })

                searches.forEach(item => {
                    if (item.created_at) {
                        const date = new Date(item.created_at)
                        const month = date.toLocaleString('default', { month: 'short' })
                        if (monthlyData[month]) {
                            monthlyData[month].searches++
                        }
                    }
                })

                const trend = Object.entries(monthlyData).map(([name, counts]) => ({
                    name,
                    total: counts.flags,
                    searches: counts.searches
                }))

                const types = Object.entries(typeData).map(([name, value]) => ({
                    name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
                    value
                }))

                const cities = Object.entries(cityData).map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)

                // Map Data Preparation
                const cityCoords: Record<string, { lat: number; lng: number }> = {
                    "Casablanca": { lat: 33.5731, lng: -7.5898 },
                    "Rabat": { lat: 34.0209, lng: -6.8416 },
                    "Marrakech": { lat: 31.6295, lng: -7.9811 },
                    "Tangier": { lat: 35.7595, lng: -5.8330 },
                    "Agadir": { lat: 30.4278, lng: -9.5981 },
                    "Fes": { lat: 34.0333, lng: -5.0000 },
                    "Meknes": { lat: 33.8935, lng: -5.5473 },
                    "Kenitra": { lat: 34.261, lng: -6.5802 },
                    "Tetouan": { lat: 35.5889, lng: -5.3626 },
                    "Oujda": { lat: 34.6867, lng: -1.9114 }
                }

                // Process Registered Agencies
                const registeredAgencies = (profiles || []).map(p => ({
                    id: p.id,
                    name: p.agency_name,
                    city: p.city,
                    lat: cityCoords[p.city]?.lat || (31.7917 + (Math.random() - 0.5) * 4),
                    lng: cityCoords[p.city]?.lng || (-7.0926 + (Math.random() - 0.5) * 4),
                    type: 'registered' as const
                }))

                // Mock General Agencies
                const mockGeneralAgencies = [
                    { id: 'g1', name: 'Elite Car Rental', city: 'Casablanca', lat: 33.585, lng: -7.63, type: 'general' as const },
                    { id: 'g2', name: 'Atlas Rent a Car', city: 'Marrakech', lat: 31.635, lng: -8.01, type: 'general' as const },
                    { id: 'g3', name: 'Rabat City Cars', city: 'Rabat', lat: 34.015, lng: -6.85, type: 'general' as const },
                    { id: 'g4', name: 'Tangier Drive', city: 'Tangier', lat: 35.77, lng: -5.8, type: 'general' as const },
                    { id: 'g5', name: 'Desert Explorer Rent', city: 'Agadir', lat: 30.41, lng: -9.58, type: 'general' as const }
                ]

                setStats({
                    trend,
                    types,
                    cities,
                    agencies: [...registeredAgencies, ...mockGeneralAgencies],
                    totalSearches: searches.length,
                    totalIncidents: incidents.length
                })
            } catch (err: any) {
                console.error("Insights Fetch Error:", err)
                setError(err.message || "Failed to load analytics data")
            } finally {
                setLoading(false)
            }
        }

        fetchInsightData()
    }, [user])

    const hasData = useMemo(() => {
        return stats && (stats.totalIncidents > 0 || stats.totalSearches > 0)
    }, [stats])

    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden bg-background font-sans">
                <DashboardSidebar />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <DashboardHeader
                        title="Agency Insights"
                        subtitle={isGlobal ? "Viewing network-wide security trends (Fallback)" : "Deep analysis of your agency's regional security performance"}
                    />

                    <main className="flex-1 overflow-y-auto p-4 md:p-8">
                        {loading ? (
                            <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <p className="text-muted-foreground font-medium">Synthesizing network data...</p>
                            </div>
                        ) : error ? (
                            <div className="flex h-[60vh] flex-col items-center justify-center space-y-4 rounded-3xl border border-destructive/20 bg-destructive/5 p-12 text-center">
                                <AlertCircle className="h-12 w-12 text-destructive" />
                                <h3 className="text-xl font-bold">Analysis Failed</h3>
                                <p className="max-w-md text-muted-foreground">{error}</p>
                            </div>
                        ) : !hasData ? (
                            <div className="flex h-[60vh] flex-col items-center justify-center space-y-6 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                                    <Info className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">No Analytics Available Yet</h3>
                                    <p className="mt-2 text-muted-foreground max-w-sm">
                                        Once the network starts reporting incidents for the current year, detailed trends and heatmaps will appear here.
                                    </p>
                                </div>
                                <Button asChild variant="outline">
                                    <Link href="/">Back to Dashboard</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {/* Summary Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Flags</p>
                                        <div className="flex items-end gap-2">
                                            <span className="text-3xl font-black text-foreground leading-none">{stats!.totalIncidents}</span>
                                            <span className="text-xs font-bold text-destructive mb-1 flex items-center gap-1">
                                                <TrendingUp className="h-3 w-3" />
                                                Live
                                            </span>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Searches</p>
                                        <div className="flex items-end gap-2">
                                            <span className="text-3xl font-black text-foreground leading-none">{stats!.totalSearches}</span>
                                            <span className="text-xs font-bold text-primary mb-1 flex items-center gap-1">
                                                <Activity className="h-3 w-3" />
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Risk Level</p>
                                        <div className="flex items-end gap-2">
                                            <span className="text-3xl font-black text-warning leading-none">
                                                {stats!.totalIncidents > 20 ? "High" : stats!.totalIncidents > 5 ? "Medium" : "Low"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Network Hub</p>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                                            <span className="text-sm font-bold text-foreground">Encrypted</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                    {/* Line Chart */}
                                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                        <div className="mb-6 flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                                <TrendingUp className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold">Incident Trends</h3>
                                                <p className="text-sm text-muted-foreground">Volume of flags per month ({new Date().getFullYear()})</p>
                                            </div>
                                        </div>
                                        <div className="h-[300px] w-full">
                                            {stats && <IncidentCharts type="line" data={stats.trend} />}
                                        </div>
                                    </div>

                                    {/* Pie Chart */}
                                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                        <div className="mb-6 flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                                                <AlertCircle className="h-5 w-5 text-destructive" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold">Risk Distribution</h3>
                                                <p className="text-sm text-muted-foreground">Breakdown by incident category</p>
                                            </div>
                                        </div>
                                        <div className="h-[300px] w-full">
                                            {stats && <IncidentCharts type="pie" data={stats.types} />}
                                        </div>
                                    </div>
                                </div>

                                {/* Heatmap Section */}
                                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                    <div className="mb-8 flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                                            <MapIcon className="h-5 w-5 text-warning" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold">Interactive Regional Map</h3>
                                            <p className="text-sm text-muted-foreground">Density heatmap of flagged identities across Morocco</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                                        <div className="lg:col-span-2 h-[500px]">
                                            {stats && <InteractiveMap agencies={stats.agencies} />}
                                        </div>
                                        <div className="space-y-6">
                                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">High-Risk Regions</h4>
                                            <div className="space-y-3">
                                                {stats?.cities.slice(0, 5).map((city: any, i: number) => (
                                                    <div key={city.name} className="flex items-center justify-between p-4 rounded-xl bg-accent/30 border border-border/50 hover:border-primary/30 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background text-xs font-black text-muted-foreground shadow-sm">
                                                                {i + 1}
                                                            </div>
                                                            <span className="font-bold text-sm">{city.name}</span>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-lg font-black text-primary leading-none">{city.count}</span>
                                                            <span className="text-[10px] uppercase font-bold text-muted-foreground mt-1">Reports</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                                <p className="text-xs text-primary/70 leading-relaxed font-medium">
                                                    <strong>Data Accuracy:</strong> This heatmap is updated in real-time as agencies report incidents to the centralized hub.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    )
}
