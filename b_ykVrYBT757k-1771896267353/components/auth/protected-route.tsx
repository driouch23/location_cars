"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, ReactNode } from "react"
import { Loader2 } from "lucide-react"

export function ProtectedRoute({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login")
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">
                        Verifying your session...
                    </p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return <>{children}</>
}
