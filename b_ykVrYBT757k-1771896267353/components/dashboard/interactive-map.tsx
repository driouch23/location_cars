"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Building2, Phone, MapPin, ShieldCheck, Info } from "lucide-react"

// Fix for default Leaflet marker icons in Next.js
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

// Custom SVG Markers
const createCustomIcon = (type: 'registered' | 'general') => {
    const color = type === 'registered' ? '#0ea5e9' : '#94a3b8'
    const svg = `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 0C11.16 0 4 7.16 4 16C4 28 20 40 20 40C20 40 36 28 36 16C36 7.16 28.84 0 20 0Z" fill="${color}"/>
      <circle cx="20" cy="16" r="6" fill="white"/>
      ${type === 'registered' ? '<path d="M18 16L19.5 17.5L23 14" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' : ''}
    </svg>
  `
    return L.divIcon({
        html: svg,
        className: "custom-marker-icon",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
    })
}

const registeredIcon = createCustomIcon('registered')
const generalIcon = createCustomIcon('general')

interface Agency {
    id: string
    name: string
    phone?: string
    city: string
    lat: number
    lng: number
    type: 'registered' | 'general'
}

interface InteractiveMapProps {
    agencies: Agency[]
}

// Component to handle map center changes
function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap()
    map.setView(center)
    return null
}

export function InteractiveMap({ agencies }: InteractiveMapProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="h-full w-full animate-pulse rounded-2xl bg-muted flex items-center justify-center">
                <p className="text-muted-foreground font-medium">Initializing Map Engine...</p>
            </div>
        )
    }

    // Morocco center
    const center: [number, number] = [31.7917, -7.0926]

    return (
        <div className="h-full w-full overflow-hidden rounded-2xl border border-border bg-card shadow-inner relative z-0">
            <MapContainer
                center={center}
                zoom={6}
                scrollWheelZoom={false}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {agencies.map((agency) => (
                    <Marker
                        key={agency.id}
                        position={[agency.lat, agency.lng]}
                        icon={agency.type === 'registered' ? registeredIcon : generalIcon}
                    >
                        <Popup className="agency-popup">
                            <div className="p-2 min-w-[200px]">
                                <div className="mb-3 flex items-center justify-between">
                                    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${agency.type === 'registered'
                                            ? 'bg-primary/10 text-primary border border-primary/20'
                                            : 'bg-muted text-muted-foreground border border-border'
                                        }`}>
                                        {agency.type === 'registered' ? (
                                            <>
                                                <ShieldCheck className="h-2.5 w-2.5" />
                                                Partner
                                            </>
                                        ) : (
                                            <>
                                                <Info className="h-2.5 w-2.5" />
                                                General
                                            </>
                                        )}
                                    </span>
                                </div>

                                <h4 className="flex items-center gap-2 text-sm font-black text-foreground mb-1">
                                    <Building2 className="h-3.5 w-3.5 text-primary" />
                                    {agency.name}
                                </h4>

                                <div className="space-y-1.5 mt-3">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                        <MapPin className="h-3 w-3" />
                                        {agency.city}
                                    </div>
                                    {agency.phone && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                            <Phone className="h-3 w-3" />
                                            {agency.phone}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">
                                        Trusted Network
                                    </span>
                                    <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <style jsx global>{`
        .leaflet-popup-content-wrapper {
          border-radius: 16px;
          padding: 0;
          overflow: hidden;
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        }
        .leaflet-popup-content {
          margin: 0;
        }
        .leaflet-popup-tip {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
        }
      `}</style>
        </div>
    )
}
