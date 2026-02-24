"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Shield, Loader2, KeyRound, Mail, Building2, User, MapPin } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function RegisterPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [fullName, setFullName] = useState("")
    const [agencyName, setAgencyName] = useState("")
    const [city, setCity] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Sign up with Supabase and include agency_name in metadata
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        agency_name: agencyName,
                        full_name: fullName,
                        city: city,
                    },
                },
            })

            if (error) {
                toast.error("Registration failed", {
                    description: error.message,
                })
                return
            }

            toast.success("Account created successfully", {
                description: "Welcome to RentGuard! Redirecting to dashboard...",
            })

            // Auto-login happens automatically with signUp unless 'Confirm Email' is on
            // or if we use the session returned. Supabase client handles this.
            router.push("/")
            router.refresh()
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm space-y-8">
                <div className="flex flex-col items-center text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Create Agency Account</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Join the RentGuard network to verify and report clients
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="fullName"
                                    type="text"
                                    placeholder="John Doe"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="pl-10"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="agencyName">Agency Name</Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="agencyName"
                                    type="text"
                                    placeholder="Your Rental Agency"
                                    required
                                    value={agencyName}
                                    onChange={(e) => setAgencyName(e.target.value)}
                                    className="pl-10"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@agency.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Min 6 characters"
                                    required
                                    min={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <p className="text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/login" className="font-semibold text-primary hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                    By signing up, you agree to the RentGuard Network terms.
                    <br />
                    RentGuard &copy; 2026
                </p>
            </div>
        </div>
    )
}
