"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-cluster"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"
import { Building2, MapPin, ShieldCheck, AlertCircle, Map as MapIcon } from "lucide-react"

// Custom SVG Markers
const createCustomIcon = (type: 'partner' | 'general' | 'risk') => {
    const color = type === 'partner' ? '#22c55e' : type === 'risk' ? '#ef4444' : '#0ea5e9'
    const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C10.48 0 6 4.48 6 10C6 17.5 16 32 16 32C16 32 26 17.5 26 10C26 4.48 21.52 0 16 0Z" fill="${color}"/>
      <circle cx="16" cy="10" r="5" fill="white"/>
      ${type === 'partner' ? '<path d="M14 10L15.5 11.5L18 9" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' : ''}
      ${type === 'risk' ? '<path d="M16 7V11M16 13H16.01" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' : ''}
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

const partnerIcon = createCustomIcon('partner')
const riskIcon = createCustomIcon('risk')

const cityCoords: Record<string, [number, number]> = {
    "Casablanca": [33.5731, -7.5898],
    "Rabat": [34.0209, -6.8416],
    "Marrakech": [31.6295, -7.9811],
    "Tangier": [35.7595, -5.8330],
    "Agadir": [30.4278, -9.5981],
    "Fes": [34.0333, -5.0000],
    "Meknes": [33.8935, -5.5473],
    "Kenitra": [34.261, -6.5802],
    "Tetouan": [35.5889, -5.3626],
    "Oujda": [34.6867, -1.9114],
    "Nador": [35.1667, -2.9333],
    "El Jadida": [33.2333, -8.5000]
}

interface MapViewProps {
    partners?: any[]
    incidents?: any[]
}

export function LeafletMapView({ partners = [], incidents = [] }: MapViewProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="h-full w-full animate-pulse rounded-2xl bg-muted/50 border border-border flex items-center justify-center">
                <p className="text-muted-foreground font-medium italic">Loading satellite systems...</p>
            </div>
        )
    }

    const center: [number, number] = [31.7917, -7.0926]

    return (
        <div className="h-full w-full overflow-hidden rounded-2xl border border-border bg-card shadow-lg relative isolate">
            <MapContainer
                center={center}
                zoom={6}
                scrollWheelZoom={true}
                className="h-full w-full"
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
                    {/* Markers for Partners */}
                    {partners.map((p) => {
                        const coords = cityCoords[p.city] || [31.7917 + (Math.random() - 0.5) * 0.1, -7.0926 + (Math.random() - 0.5) * 0.1]
                        return (
                            <Marker key={`partner-${p.id}`} position={coords} icon={partnerIcon}>
                                <Popup className="premium-popup">
                                    <div className="p-2 min-w-[200px]">
                                        <div className="mb-2">
                                            <span className="bg-success/10 text-success text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-success/20">
                                                Official Partner
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-sm text-foreground">{p.agency_name}</h4>
                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> {p.city}, Morocco
                                        </p>
                                        <div className="mt-3 pt-2 border-t border-border flex items-center gap-2">
                                            <ShieldCheck className="h-3.5 w-3.5 text-success" />
                                            <span className="text-[10px] font-bold text-success uppercase">Verified Secure</span>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    })}

                    {/* Markers for Risk Centers (Incidents) */}
                    {incidents.map((c) => {
                        const coords = cityCoords[c.name]
                        if (!coords) return null
                        return (
                            <Marker key={`risk-${c.name}`} position={coords} icon={riskIcon}>
                                <Popup className="premium-popup">
                                    <div className="p-2 min-w-[200px]">
                                        <div className="mb-2">
                                            <span className="bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-destructive/20">
                                                Risk Warning
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-sm text-foreground">{c.name} Area</h4>
                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3 text-destructive" />
                                            {c.count} Regional Incidents
                                        </p>
                                        <div className="mt-3 pt-2 border-t border-border text-[10px] font-medium text-muted-foreground italic">
                                            High alertness recommended in this region.
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    })}
                </MarkerClusterGroup>
            </MapContainer>

            {/* Custom Control Overlays */}
            <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
                <div className="bg-card/80 backdrop-blur-md border border-border p-1.5 rounded-xl shadow-xl flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <MapIcon className="h-4 w-4" />
                    </div>
                    <div className="pr-3">
                        <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground leading-none">Cluster View</p>
                        <p className="text-xs font-bold text-foreground">Morocco Security Hub</p>
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
                .marker-cluster-small { background-color: rgba(14, 165, 233, 0.6); }
                .marker-cluster-small div { background-color: rgba(14, 165, 233, 0.9); color: white; }
                .marker-cluster-medium { background-color: rgba(245, 158, 11, 0.6); }
                .marker-cluster-medium div { background-color: rgba(245, 158, 11, 0.9); color: white; }
                .marker-cluster-large { background-color: rgba(239, 68, 68, 0.6); }
                .marker-cluster-large div { background-color: rgba(239, 68, 68, 0.9); color: white; }
            `}</style>
        </div>
    )
}
