"use client"

import { useMemo } from "react"

interface RegionalMapProps {
    data: { name: string; count: number }[]
}

export function RegionalMap({ data }: RegionalMapProps) {
    const cityCounts = useMemo(() => {
        return data.reduce((acc, curr) => {
            acc[curr.name] = curr.count
            return acc
        }, {} as Record<string, number>)
    }, [data])

    const maxCount = Math.max(...data.map(d => d.count), 1)

    const getColor = (cityName: string) => {
        const count = cityCounts[cityName] || 0
        if (count === 0) return "fill-muted hover:fill-muted/80"
        const ratio = count / maxCount
        if (ratio > 0.7) return "fill-destructive hover:fill-destructive/80"
        if (ratio > 0.3) return "fill-warning hover:fill-warning/80"
        return "fill-primary hover:fill-primary/80"
    }

    // Simplified SVG map of Morocco regions/cities
    return (
        <div className="relative h-full w-full flex items-center justify-center">
            <svg
                viewBox="0 0 500 600"
                className="h-full w-auto max-w-full drop-shadow-2xl"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Improved Circle Markers with tooltips and density glowing */}

                {/* Tangier */}
                <g className="cursor-help transition-transform hover:scale-110 origin-[280px_50px]">
                    <circle cx="280" cy="50" r={cityCounts["Tangier"] ? 18 : 12}
                        className={`${getColor("Tangier")} transition-all duration-500 stroke-background stroke-2`}
                        filter={cityCounts["Tangier"] ? "url(#glow)" : ""}
                    >
                        <title>Tangier: {cityCounts["Tangier"] || 0} Incident(s)</title>
                    </circle>
                    <text x="300" y="55" className="text-[12px] font-black fill-foreground/60 select-none">TNG</text>
                </g>

                {/* Rabat */}
                <g className="cursor-help transition-transform hover:scale-110 origin-[230px_150px]">
                    <circle cx="230" cy="150" r={cityCounts["Rabat"] ? 22 : 14}
                        className={`${getColor("Rabat")} transition-all duration-500 stroke-background stroke-2`}
                        filter={cityCounts["Rabat"] ? "url(#glow)" : ""}
                    >
                        <title>Rabat: {cityCounts["Rabat"] || 0} Incident(s)</title>
                    </circle>
                    <text x="180" y="155" className="text-[12px] font-black fill-foreground/80 select-none text-right">RBT</text>
                </g>

                {/* Casablanca */}
                <g className="cursor-help transition-transform hover:scale-110 origin-[200px_200px]">
                    <circle cx="200" cy="200" r={cityCounts["Casablanca"] ? 30 : 18}
                        className={`${getColor("Casablanca")} transition-all duration-500 stroke-background stroke-2`}
                        filter={cityCounts["Casablanca"] ? "url(#glow)" : ""}
                    >
                        <title>Casablanca: {cityCounts["Casablanca"] || 0} Incident(s)</title>
                    </circle>
                    <text x="110" y="205" className="text-[14px] font-black fill-foreground select-none">CASA</text>
                </g>

                {/* Marrakech */}
                <g className="cursor-help transition-transform hover:scale-110 origin-[180px_350px]">
                    <circle cx="180" cy="350" r={cityCounts["Marrakech"] ? 26 : 16}
                        className={`${getColor("Marrakech")} transition-all duration-500 stroke-background stroke-2`}
                        filter={cityCounts["Marrakech"] ? "url(#glow)" : ""}
                    >
                        <title>Marrakech: {cityCounts["Marrakech"] || 0} Incident(s)</title>
                    </circle>
                    <text x="100" y="355" className="text-[12px] font-black fill-foreground/80 select-none">RAK</text>
                </g>

                {/* Agadir */}
                <g className="cursor-help transition-transform hover:scale-110 origin-[120px_480px]">
                    <circle cx="120" cy="480" r={cityCounts["Agadir"] ? 24 : 15}
                        className={`${getColor("Agadir")} transition-all duration-500 stroke-background stroke-2`}
                        filter={cityCounts["Agadir"] ? "url(#glow)" : ""}
                    >
                        <title>Agadir: {cityCounts["Agadir"] || 0} Incident(s)</title>
                    </circle>
                    <text x="65" y="485" className="text-[12px] font-black fill-foreground/80 select-none">AGA</text>
                </g>

                {/* Fes */}
                <g className="cursor-help transition-transform hover:scale-110 origin-[330px_150px]">
                    <circle cx="330" cy="150" r={cityCounts["Fes"] ? 20 : 14}
                        className={`${getColor("Fes")} transition-all duration-500 stroke-background stroke-2`}
                        filter={cityCounts["Fes"] ? "url(#glow)" : ""}
                    >
                        <title>Fes: {cityCounts["Fes"] || 0} Incident(s)</title>
                    </circle>
                    <text x="355" y="155" className="text-[12px] font-black fill-foreground/60 select-none">FES</text>
                </g>

                {/* Network connector lines */}
                <path d="M280 50 L230 150 M230 150 L200 200 M200 200 L180 350 M180 350 L120 480"
                    className="stroke-primary/10 stroke-[1] fill-none" />
            </svg>
        </div>
    )
}
