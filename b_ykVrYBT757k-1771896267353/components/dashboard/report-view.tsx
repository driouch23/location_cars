"use client"

import { useState } from "react"
import { Flag, Send, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useAuth } from "@/components/providers/auth-provider"

export function ReportView() {
  const { user } = useAuth()
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cin, setCin] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [severity, setSeverity] = useState("Medium")
  const [incidentType, setIncidentType] = useState("")
  const [city, setCity] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = async () => {
    if (!cin || !incidentType || !description) {
      toast.error("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    try {
      if (!user) {
        toast.error("You must be logged in to submit a report")
        return
      }

      const { error } = await supabase
        .from("blacklisted_clients")
        .insert([
          {
            cin_number: cin.trim().toUpperCase(),
            license_number: licenseNumber.trim().toUpperCase() || null,
            severity,
            incident_type: incidentType,
            description: description,
            city: city,
          }
        ])

      if (error) throw error

      toast.success("Client successfully reported to the network")
      setSubmitted(true)
      // Reset form
      setCin("")
      setLicenseNumber("")
      setSeverity("Medium")
      setIncidentType("")
      setCity("")
      setDescription("")
    } catch (error) {
      console.error("Error submitting report:", error)
      toast.error("Failed to submit report. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-xl border border-success/30 bg-success/[0.06] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15">
            <Flag className="h-7 w-7 text-success" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-foreground">
            Report Submitted Successfully
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Your report has been submitted and will be reviewed by our team. Other agencies will be notified accordingly.
          </p>
          <Button
            onClick={() => setSubmitted(false)}
            variant="outline"
            className="mt-6"
          >
            Submit Another Report
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
          <Flag className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
          Report a Client Incident
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Flag a client for other rental agencies. Your report helps protect the entire network.
        </p>
      </div>

      {/* Form */}
      <div className="mt-8 space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div>
          <label
            htmlFor="cin"
            className="mb-1.5 block text-sm font-medium text-card-foreground"
          >
            Client CIN
          </label>
          <Input
            id="cin"
            value={cin}
            onChange={(e) => setCin(e.target.value)}
            placeholder="Enter CIN Number (e.g. AB123456)"
            className="h-11 rounded-lg"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label
            htmlFor="license"
            className="mb-1.5 block text-sm font-medium text-card-foreground"
          >
            Driver&apos;s License Number (Optional)
          </label>
          <Input
            id="license"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="Enter License Number"
            className="h-11 rounded-lg"
            disabled={isSubmitting}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="incident-type"
              className="mb-1.5 block text-sm font-medium text-card-foreground"
            >
              Incident Type
            </label>
            <Select
              value={incidentType}
              onValueChange={setIncidentType}
              disabled={isSubmitting}
            >
              <SelectTrigger id="incident-type" className="h-11 rounded-lg">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">Unpaid Fees</SelectItem>
                <SelectItem value="accident">Vehicle Accident</SelectItem>
                <SelectItem value="theft">Vehicle Theft</SelectItem>
                <SelectItem value="damage">Vehicle Damage</SelectItem>
                <SelectItem value="fraud">Fraudulent Documents</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label
              htmlFor="severity"
              className="mb-1.5 block text-sm font-medium text-card-foreground"
            >
              Severity Level
            </label>
            <Select
              value={severity}
              onValueChange={setSeverity}
              disabled={isSubmitting}
            >
              <SelectTrigger id="severity" className="h-11 rounded-lg">
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low - Minor issue</SelectItem>
                <SelectItem value="Medium">Medium - Serious concern</SelectItem>
                <SelectItem value="High">High - Critical risk / Blacklist</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label
            htmlFor="city"
            className="mb-1.5 block text-sm font-medium text-card-foreground"
          >
            Incident City
          </label>
          <Select
            value={city}
            onValueChange={setCity}
            disabled={isSubmitting}
          >
            <SelectTrigger id="city" className="h-11 rounded-lg">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Casablanca">Casablanca</SelectItem>
              <SelectItem value="Rabat">Rabat</SelectItem>
              <SelectItem value="Marrakech">Marrakech</SelectItem>
              <SelectItem value="Tangier">Tangier</SelectItem>
              <SelectItem value="Agadir">Agadir</SelectItem>
              <SelectItem value="Fes">Fes</SelectItem>
              <SelectItem value="Meknes">Meknes</SelectItem>
              <SelectItem value="Oujda">Oujda</SelectItem>
              <SelectItem value="Kenitra">Kenitra</SelectItem>
              <SelectItem value="Tetouan">Tetouan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1.5 block text-sm font-medium text-card-foreground"
          >
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide details about the incident..."
            className="min-h-[120px] rounded-lg resize-none"
            disabled={isSubmitting}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="h-11 w-full rounded-lg bg-destructive text-sm font-semibold text-destructive-foreground shadow-sm hover:bg-destructive/90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit Report
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
