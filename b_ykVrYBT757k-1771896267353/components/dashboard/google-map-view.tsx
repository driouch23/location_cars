"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import {
    APIProvider,
    Map,
    AdvancedMarker,
    InfoWindow,
    Pin,
    useMap
} from "@vis.gl/react-google-maps"
import { supabase } from "@/lib/supabase"
import { Building2, Phone, MapPin, ShieldCheck, Info, Loader2, AlertCircle } from "lucide-react"

const MAP_ID = "DEMO_MAP_ID"

const darkMapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
    { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
    { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
    { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
    { "featureType": "administrative.land_parcel", "stylers": [{ "visibility": "off" }] },
    { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#181818" }] },
    { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
    { "featureType": "poi.park", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1b1b1b" }] },
    { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
    { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a8a8a" }] },
    { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#373737" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#3c3c3c" }] },
    { "featureType": "road.highway.controlled_access", "elementType": "geometry", "stylers": [{ "color": "#4e4e4e" }] },
    { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
    { "featureType": "transit", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] },
    { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#3d3d3d" }] }
]

interface MarkerData {
    id: string
    name: string
    address: string
    phone?: string
    lat: number
    lng: number
    isPartner: boolean
    isRiskPoint?: boolean
}

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
    "Oujda": { lat: 34.6867, lng: -1.9114 },
    "Nador": { lat: 35.1667, lng: -2.9333 },
    "El Jadida": { lat: 33.2333, lng: -8.5000 }
}

function MapContent({ partners, incidents }: { partners: any[], incidents: any[] }) {
    const map = useMap()
    const [agencies, setAgencies] = useState<MarkerData[]>([])
    const [selectedAgency, setSelectedAgency] = useState<MarkerData | null>(null)
    const [loading, setLoading] = useState(false)
    const searchTimeout = useRef<NodeJS.Timeout | null>(null)

    const fetchPlaces = useCallback(async () => {
        if (!map) return

        setLoading(true)
        const service = new google.maps.places.PlacesService(map)
        const bounds = map.getBounds()

        if (!bounds) return

        const request: google.maps.places.PlaceSearchRequest = {
            bounds: bounds,
            keyword: "car rental",
            type: "car_rental"
        }

        service.nearbySearch(request, (
            results: google.maps.places.PlaceResult[] | null,
            status: google.maps.places.PlacesServiceStatus
        ) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                const mappedAgencies: MarkerData[] = results.map((place: google.maps.places.PlaceResult) => {
                    const lat = place.geometry?.location?.lat() || 0
                    const lng = place.geometry?.location?.lng() || 0

                    // Check if this place is one of our partners
                    const isPartner = partners.some(p =>
                        p.agency_name.toLowerCase().includes(place.name?.toLowerCase() || "") ||
                        (place.name?.toLowerCase().includes(p.agency_name.toLowerCase()) && p.city === (place.vicinity || ""))
                    )

                    return {
                        id: place.place_id || Math.random().toString(),
                        name: place.name || "Unknown Agency",
                        address: place.vicinity || "No address provided",
                        lat,
                        lng,
                        isPartner
                    }
                })

                // Add registered partners with precise coordinates
                const partnerMarkers: MarkerData[] = partners.map(p => {
                    const coords = cityCoords[p.city] || {
                        lat: 31.7917 + (Math.random() - 0.5) * 2,
                        lng: -7.0926 + (Math.random() - 0.5) * 2
                    }

                    return {
                        id: p.id,
                        name: p.agency_name,
                        address: `${p.city}, Morocco`,
                        lat: coords.lat,
                        lng: coords.lng,
                        isPartner: true
                    }
                }).filter(p => !mappedAgencies.some(a => a.name === p.name))

                // Add Risk Center markers based on incidents
                const riskMarkers: MarkerData[] = (incidents || []).map(c => {
                    const coords = cityCoords[c.name]
                    if (!coords) return null
                    return {
                        id: `risk-${c.name}`,
                        name: `${c.name} Risk Center`,
                        address: `${c.count} reported incidents in this region`,
                        lat: coords.lat,
                        lng: coords.lng,
                        isPartner: false,
                        isRiskPoint: true
                    }
                }).filter(m => m !== null) as MarkerData[]

                setAgencies([...mappedAgencies, ...partnerMarkers, ...riskMarkers])
            }
            setLoading(false)
        })
    }, [map, partners, incidents])

    // Fetch on bounds change with debounce
    useEffect(() => {
        if (!map) return

        const listener = map.addListener("bounds_changed", () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current)
            searchTimeout.current = setTimeout(fetchPlaces, 1000)
        })

        return () => {
            google.maps.event.removeListener(listener)
            if (searchTimeout.current) clearTimeout(searchTimeout.current)
        }
    }, [map, fetchPlaces])

    return (
        <>
            {agencies.map((agency) => (
                <AdvancedMarker
                    key={agency.id}
                    position={{ lat: agency.lat, lng: agency.lng }}
                    onClick={() => setSelectedAgency(agency)}
                >
                    <Pin
                        background={agency.isRiskPoint ? "#ef4444" : agency.isPartner ? "#22c55e" : "#0ea5e9"}
                        borderColor={agency.isRiskPoint ? "#991b1b" : agency.isPartner ? "#166534" : "#0369a1"}
                        glyphColor={"#fff"}
                    >
                        {agency.isRiskPoint ? <AlertCircle className="h-4 w-4 text-white" /> : agency.isPartner ? <ShieldCheck className="h-4 w-4 text-white" /> : <Building2 className="h-3 w-3 text-white" />}
                    </Pin>
                </AdvancedMarker>
            ))}

            {selectedAgency && (
                <InfoWindow
                    position={{ lat: selectedAgency.lat, lng: selectedAgency.lng }}
                    onCloseClick={() => setSelectedAgency(null)}
                >
                    <div className="p-3 min-w-[220px] bg-card text-foreground rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${selectedAgency.isRiskPoint ? "bg-destructive/10 text-destructive border border-destructive/20" :
                                selectedAgency.isPartner ? "bg-success/10 text-success border border-success/20" :
                                    "bg-primary/10 text-primary border border-primary/20"
                                }`}>
                                {selectedAgency.isRiskPoint ? "Risk Warning" : selectedAgency.isPartner ? "Official Partner" : "General Agency"}
                            </span>
                            {loading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                        </div>

                        <h4 className="font-bold text-sm mb-1">{selectedAgency.name}</h4>
                        <div className="space-y-1.5 mt-2">
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                                <span>{selectedAgency.address}</span>
                            </div>
                            {selectedAgency.isPartner && (
                                <div className="mt-3 pt-2 border-t border-border flex items-center gap-2">
                                    <ShieldCheck className="h-3.5 w-3.5 text-success" />
                                    <span className="text-[10px] font-bold text-success uppercase">Verified Secure</span>
                                </div>
                            )}
                        </div>
                    </div>
                </InfoWindow>
            )}
        </>
    )
}

export function GoogleMapView({ partners = [], incidents = [] }: { partners?: any[], incidents?: any[] }) {
    // Robust environment variable access
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || (typeof window !== 'undefined' ? (window as any).NEXT_PUBLIC_GOOGLE_MAPS_API_KEY : null)

    useEffect(() => {
        if (apiKey) {
            console.log("✅ Google Maps API Key found. Length:", apiKey.length, "Prefix:", apiKey.slice(0, 6));
        } else {
            console.error("❌ Google Maps API Key NOT FOUND (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is undefined)");
        }
    }, [apiKey])

    if (!apiKey) {
        return (
            <div className="h-full w-full rounded-2xl bg-muted/50 border border-dashed border-border flex flex-col items-center justify-center p-8 text-center">
                <div className="h-12 w-12 rounded-2xl bg-warning/10 flex items-center justify-center mb-4 text-warning">
                    <Info className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">Google Maps API Key Missing</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                    Please add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your <code>.env.local</code> file to enable the interactive agency map.
                </p>
            </div>
        )
    }

    return (
        <div className="h-full w-full rounded-2xl border border-border bg-card shadow-sm overflow-hidden relative">
            <APIProvider apiKey={apiKey} libraries={['places']}>
                <Map
                    defaultCenter={{ lat: 31.7917, lng: -7.0926 }}
                    defaultZoom={6}
                    mapId={MAP_ID}
                    disableDefaultUI={true}
                    zoomControl={true}
                    styles={darkMapStyle}
                    className="h-full w-full"
                >
                    <MapContent partners={partners} incidents={incidents} />
                </Map>
            </APIProvider>
        </div>
    )
}
