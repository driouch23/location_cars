"use client"

import {
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Building2,
  FileWarning,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react"

export function SuccessCard() {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-success/30 bg-success/[0.06]">
      {/* Card header */}
      <div className="flex items-center gap-3 border-b border-success/20 bg-success/[0.08] px-5 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success">
          <ShieldCheck className="h-4 w-4 text-success-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-success">Verified - Safe to Rent</p>
          <p className="text-xs text-success/70">Background check completed</p>
        </div>
      </div>

      {/* Card body */}
      <div className="flex items-start gap-4 p-5">
        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-success" />
        <div>
          <p className="text-base font-medium text-foreground">
            Clear! No incidents reported for this CIN.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Safe to rent. This client has a clean record across all participating agencies.
          </p>
        </div>
      </div>

      {/* Card footer */}
      <div className="border-t border-success/15 bg-success/[0.04] px-5 py-3">
        <p className="text-xs text-muted-foreground" suppressHydrationWarning>
          Last checked: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  )
}

interface AlertCardProps {
  incident_type: string
  description: string
  created_at: string
}

export function AlertCard({ incident_type, description, created_at }: AlertCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-destructive/30 bg-destructive/[0.05]">
      {/* Card header */}
      <div className="flex items-center gap-3 border-b border-destructive/20 bg-destructive/[0.08] px-5 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive">
          <ShieldAlert className="h-4 w-4 text-destructive-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-destructive">
            High Risk Client Found!
          </p>
          <p className="text-xs text-destructive/70">Immediate attention required</p>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-destructive" />
          <div className="flex-1">
            <p className="text-base font-medium text-foreground">
              This client has been flagged with reported incidents.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        {/* Incident details */}
        <div className="mt-4 space-y-2.5 rounded-lg border border-destructive/15 bg-card p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Incident Details
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <FileWarning className="h-4 w-4 text-destructive/80" />
              <span className="text-sm text-foreground">
                <span className="font-medium">Incident:</span> {incident_type}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-destructive/80" />
              <span className="text-sm text-foreground">
                <span className="font-medium">Date:</span> {new Date(created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Building2 className="h-4 w-4 text-destructive/80" />
              <span className="text-sm text-foreground">
                <span className="font-medium">Reported by:</span> Central Database
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card footer */}
      <div className="border-t border-destructive/15 bg-destructive/[0.04] px-5 py-3">
        <p className="text-xs text-muted-foreground" suppressHydrationWarning>
          Last checked: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  )
}

