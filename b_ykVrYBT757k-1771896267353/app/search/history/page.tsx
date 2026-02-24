"use client"

import { useEffect, useState } from "react"
import { Search, Calendar, ShieldCheck, ShieldAlert, ChevronRight, Loader2, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { useAuth } from "@/components/providers/auth-provider"
import { format } from "date-fns"
import Link from "next/link"

interface SearchHistoryItem {
    id: string
    search_query: string
    has_match: boolean
    created_at: string
}

export default function SearchHistoryPage() {
    const { user } = useAuth()
    const [history, setHistory] = useState<SearchHistoryItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchHistory() {
            if (!user) return

            try {
                const { data, error } = await supabase
                    .from("search_history")
                    .select("*")
                    .eq("agency_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(20)

                if (error) throw error
                setHistory(data || [])
            } catch (error) {
                console.error("Error fetching history:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchHistory()
    }, [user])

    return (
        <div className="flex min-h-screen bg-background">
            <DashboardSidebar />
            <div className="flex flex-1 flex-col">
                <DashboardHeader title="Search History" subtitle="Track your agency's verification history" />
                <main className="p-8">
                    <div className="mx-auto max-w-5xl">
                        {loading ? (
                            <div className="flex h-[40vh] items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : history.length > 0 ? (
                            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                                <div className="border-b border-border bg-muted/30 p-4 px-6 font-semibold">
                                    Recent Verifications
                                </div>
                                <div className="divide-y divide-border">
                                    {history.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={`/search/results?q=${item.search_query}`}
                                            className="flex items-center justify-between p-4 px-6 transition-colors hover:bg-accent/50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.has_match ? 'bg-destructive/10' : 'bg-success/10'}`}>
                                                    {item.has_match ? (
                                                        <ShieldAlert className="h-5 w-5 text-destructive" />
                                                    ) : (
                                                        <ShieldCheck className="h-5 w-5 text-success" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground tracking-tight">{item.search_query}</p>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {format(new Date(item.created_at), "PP")}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {format(new Date(item.created_at), "p")}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className={`hidden md:block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${item.has_match ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                                                    {item.has_match ? 'Flagged' : 'Cleared'}
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-[50vh] flex-col items-center justify-center text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                                    <Search className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="mt-4 text-xl font-semibold">No Search History</h3>
                                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                                    You haven&apos;t performed any client verifications yet. Start searching to build your verification track record.
                                </p>
                                <Link href="/" className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90">
                                    Go to Dashboard
                                </Link>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
