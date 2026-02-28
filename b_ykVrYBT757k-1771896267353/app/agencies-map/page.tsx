"use client"

import { useEffect, useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { mockAgenciesData, MockAgency } from "@/lib/mock-agencies"
import { supabase } from "@/lib/supabase"
import dynamic from "next/dynamic"
import { DirectoryAgency } from "@/components/dashboard/directory-map-view"
import { Loader2, AlertCircle } from "lucide-react"

const DirectoryMapView = dynamic(
    () => import("@/components/dashboard/directory-map-view").then((mod) => mod.DirectoryMapView),
    { ssr: false, loading: () => <div className="h-[calc(100vh-theme(spacing.24))] w-full animate-pulse rounded-2xl bg-muted/50 border border-border flex items-center justify-center"><p className="text-muted-foreground font-medium italic">Loading Map Engine...</p></div> }
)

export default function AgenciesMapPage() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [agencies, setAgencies] = useState<DirectoryAgency[]>([])

    useEffect(() => {
        async function fetchDirectoryData() {
            setLoading(true)
            setError(null)
            try {
                // Fetch registered agencies from Supabase profiles
                const { data: profiles, error: profileError } = await supabase
                    .from("profiles")
                    .select("id, agency_name, city")

                if (profileError) throw profileError

                const registeredNames = new Set(profiles?.map(p => p.agency_name?.toLowerCase()) || [])

                // Merge mock Google Places data with Supabase registration status
                // We do a simple case-insensitive name match for demo purposes
                const mergedData: DirectoryAgency[] = mockAgenciesData.map((mock: MockAgency) => {
                    const isRegistered = registeredNames.has(mock.name.toLowerCase())
                    return {
                        ...mock,
                        isRegistered
                    }
                })

                // Also inject actual registered profiles that might not be in the mock dataset
                const existingMockNames = new Set(mergedData.map(a => a.name.toLowerCase()))

                profiles?.forEach(profile => {
                    if (profile.agency_name && !existingMockNames.has(profile.agency_name.toLowerCase())) {
                        // Add some slight randomness to coordinates based on their city if they aren't in mock
                        // For a real app we'd geocode this
                        const baseLat = 31.7917 + (Math.random() - 0.5) * 5
                        const baseLng = -7.0926 + (Math.random() - 0.5) * 5

                        mergedData.push({
                            id: `db-${profile.id}`,
                            name: profile.agency_name,
                            address: "Registered Address (Hidden)",
                            city: profile.city || "Unknown",
                            lat: baseLat,
                            lng: baseLng,
                            isRegistered: true
                        })
                    }
                })

                setAgencies(mergedData)
            } catch (err: any) {
                console.error("Directory Fetch Error:", err)
                setError(err.message || "Failed to load directory data")
            } finally {
                setLoading(false)
            }
        }

        fetchDirectoryData()
    }, [])

    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden bg-background font-sans">
                <div className="hidden lg:block">
                    <DashboardSidebar />
                </div>
                <div className="flex flex-1 flex-col overflow-hidden">
                    <DashboardHeader
                        title="National Directory"
                        subtitle="Global Database of Moroccan Car Rental Agencies"
                    />

                    <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-accent/20">
                        {loading ? (
                            <div className="flex h-full flex-col items-center justify-center space-y-4">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <p className="text-muted-foreground font-medium">Syncing database...</p>
                            </div>
                        ) : error ? (
                            <div className="flex h-full flex-col items-center justify-center space-y-4 rounded-3xl border border-destructive/20 bg-destructive/5 p-12 text-center">
                                <AlertCircle className="h-12 w-12 text-destructive" />
                                <h3 className="text-xl font-bold">Sync Failed</h3>
                                <p className="max-w-md text-muted-foreground">{error}</p>
                            </div>
                        ) : (
                            <div className="mx-auto w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
                                <DirectoryMapView agencies={agencies} />
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    )
}
