"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-cluster"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"
import { Building2, MapPin, ShieldCheck, Mail, Map as MapIcon, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

// Custom SVG Markers
const createDirectoryIcon = (isRegistered: boolean) => {
    const color = isRegistered ? '#22c55e' : '#64748b' // Green for registered, Slate for unregistered
    const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C10.48 0 6 4.48 6 10C6 17.5 16 32 16 32C16 32 26 17.5 26 10C26 4.48 21.52 0 16 0Z" fill="${color}"/>
      <circle cx="16" cy="10" r="5" fill="white"/>
      ${isRegistered ? '<path d="M14 10L15.5 11.5L18 9" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' : ''}
    </svg>
  `
    return L.divIcon({
        html: svg,
        className: "custom-marker-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    })
}

const registeredIcon = createDirectoryIcon(true)
const unregisteredIcon = createDirectoryIcon(false)

export interface DirectoryAgency {
    id: string
    name: string
    address: string
    city: string
    lat: number
    lng: number
    phone?: string
    isRegistered: boolean
}

interface DirectoryMapViewProps {
    agencies: DirectoryAgency[]
}

export function DirectoryMapView({ agencies = [] }: DirectoryMapViewProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="h-[calc(100vh-theme(spacing.24))] w-full animate-pulse rounded-2xl bg-muted/50 border border-border flex items-center justify-center">
                <p className="text-muted-foreground font-medium italic">Loading National Directory...</p>
            </div>
        )
    }

    const center: [number, number] = [31.7917, -7.0926] // Morocco Center

    const handleInvite = (agencyName: string) => {
        alert(`Invitation link ready to be sent to ${agencyName}. This would trigger an email or SMS service.`)
    }

    return (
        <div className="h-[calc(100vh-theme(spacing.24))] w-full overflow-hidden rounded-2xl border border-border bg-card shadow-lg relative isolate">
            <MapContainer
                center={center}
                zoom={6}
                scrollWheelZoom={true}
                className="h-full w-full z-0"
                zoomControl={false}
            >
                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Satellite View (Esri)">
                        <TileLayer
                            attribution='&copy; ESRI World Imagery'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Street View (OSM)">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>

                <MarkerClusterGroup
                    chunkedLoading
                    maxClusterRadius={50}
                    spiderfyOnMaxZoom={true}
                >
                    {agencies.map((agency) => (
                        <Marker key={agency.id} position={[agency.lat, agency.lng]} icon={agency.isRegistered ? registeredIcon : unregisteredIcon}>
                            <Popup className="premium-popup">
                                <div className="p-3 min-w-[240px]">
                                    <div className="mb-2">
                                        {agency.isRegistered ? (
                                            <span className="inline-flex items-center gap-1 bg-success/10 text-success text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-success/20">
                                                <ShieldCheck className="h-3 w-3" />
                                                Registered Partner
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-border">
                                                <Info className="h-3 w-3" />
                                                Not Yet Registered
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="font-bold text-base text-foreground mt-1">{agency.name}</h4>

                                    <div className="space-y-1.5 mt-2">
                                        <p className="text-xs text-foreground/80 flex items-start gap-1.5 line-clamp-2">
                                            <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                                            {agency.address}, {agency.city}
                                        </p>
                                    </div>

                                    {!agency.isRegistered && (
                                        <div className="mt-4 pt-4 border-t border-border">
                                            <Button
                                                size="sm"
                                                variant="default"
                                                className="w-full text-xs font-semibold"
                                                onClick={() => handleInvite(agency.name)}
                                            >
                                                <Mail className="h-3.5 w-3.5 mr-2" />
                                                Invite to Join
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>

            {/* Custom Control Overlays */}
            <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 pointer-events-none">
                <div className="bg-card/90 backdrop-blur-md border border-border p-2 rounded-xl shadow-xl flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <MapIcon className="h-5 w-5" />
                    </div>
                    <div className="pr-4">
                        <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground leading-none">Database Overlay</p>
                        <p className="text-sm font-bold text-foreground">National Directory</p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .leaflet-container {
                    background: #1a1a1a !important;
                }
                .premium-popup .leaflet-popup-content-wrapper {
                    background: hsl(var(--card));
                    border: 1px solid hsl(var(--border));
                    border-radius: 12px;
                    padding: 0;
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.5);
                }
                .premium-popup .leaflet-popup-content {
                    margin: 0;
                }
                .premium-popup .leaflet-popup-tip {
                    background: hsl(var(--card));
                    border: 1px solid hsl(var(--border));
                }
                /* Custom cluster colors for directory */
                .marker-cluster-small { background-color: rgba(14, 165, 233, 0.6); }
                .marker-cluster-small div { background-color: rgba(14, 165, 233, 0.9); color: white; }
                .marker-cluster-medium { background-color: rgba(139, 92, 246, 0.6); }
                .marker-cluster-medium div { background-color: rgba(139, 92, 246, 0.9); color: white; }
                .marker-cluster-large { background-color: rgba(239, 68, 68, 0.6); }
                .marker-cluster-large div { background-color: rgba(239, 68, 68, 0.9); color: white; }
            `}</style>
        </div>
    )
}
