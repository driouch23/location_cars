"use client"

import { useState, useRef, useCallback } from "react"
import { Camera, X, Check, Loader2, ScanFace, ScanLine } from "lucide-react"
import { createWorker } from "tesseract.js"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface OCRScannerProps {
    isOpen: boolean
    onClose: () => void
    onScanComplete: (cin: string, fullName?: string) => void
}

export function OCRScanner({ isOpen, onClose, onScanComplete }: OCRScannerProps) {
    const [isCapturing, setIsCapturing] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
            })
            setStream(mediaStream)
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
            }
            setIsCapturing(true)
        } catch (err) {
            console.error("Camera access error:", err)
            toast.error("Could not access camera", {
                description: "Please ensure you have granted camera permissions.",
            })
        }
    }

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop())
            setStream(null)
        }
        setIsCapturing(false)
    }, [stream])

    const processImage = async () => {
        if (!videoRef.current || !canvasRef.current) return

        setIsProcessing(true)
        const video = videoRef.current
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")

        if (context) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            context.drawImage(video, 0, 0, canvas.width, canvas.height)

            const imageData = canvas.toDataURL("image/png")

            try {
                const worker = await createWorker('fra+ara') // French and Arabic for Moroccan cards
                const { data: { text } } = await worker.recognize(imageData)
                await worker.terminate()

                console.log("OCR Result:", text)

                // Regex for Moroccan CIN: 1 or 2 letters followed by 6 or 7 digits
                const cinMatch = text.match(/[A-Z]{1,2}\d{5,7}/i)

                // Heuristic for Full Name:
                // 1. Split text into lines
                // 2. Filter out short lines, lines with digits, and common labels
                // 3. Take the first line that looks like a name (mostly uppercase letters)
                const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
                const candidateNames = lines.filter(l =>
                    l.length > 5 &&
                    !/\d/.test(l) &&
                    !/ROYAUME|MAROC|CARTE|NATIONALE|IDENTITE/i.test(l) &&
                    l === l.toUpperCase()
                )

                const detectedName = candidateNames[0] || ""

                if (cinMatch) {
                    const detectedCin = cinMatch[0].toUpperCase()
                    toast.success("ID Scanned successfully", {
                        description: `Detected: ${detectedCin}${detectedName ? ` - ${detectedName}` : ""}`,
                    })
                    onScanComplete(detectedCin, detectedName)
                    handleClose()
                } else {
                    toast.error("CIN not detected", {
                        description: "Please try holding the card closer or in better lighting.",
                    })
                }
            } catch (err) {
                console.error("OCR error:", err)
                toast.error("Processing failed", {
                    description: "There was an error reading the image.",
                })
            } finally {
                setIsProcessing(false)
            }
        }
    }

    const handleClose = () => {
        stopCamera()
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ScanFace className="h-5 w-5 text-primary" />
                        CIN Card Scanner
                    </DialogTitle>
                </DialogHeader>

                <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-xl bg-muted ring-1 ring-border">
                    {isCapturing ? (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 border-2 border-primary/40 pointer-events-none">
                                <div className="absolute inset-[15%] border-2 border-dashed border-white/60 rounded-lg">
                                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/40 animate-scan" />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center space-y-4">
                            <Camera className="h-12 w-12 text-muted-foreground/40" />
                            <Button onClick={startCamera}>Start Camera</Button>
                        </div>
                    )}

                    {isProcessing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white backdrop-blur-sm">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="mt-4 text-sm font-bold tracking-widest uppercase">Analyzing Identity Card...</p>
                        </div>
                    )}
                </div>

                <canvas ref={canvasRef} className="hidden" />

                <div className="mt-6 flex gap-3">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1"
                        disabled={isProcessing}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={processImage}
                        disabled={!isCapturing || isProcessing}
                        className="flex-1 bg-primary text-primary-foreground"
                    >
                        {isProcessing ? "Processing..." : "Capture & Scan"}
                    </Button>
                </div>

                <p className="mt-4 text-center text-[10px] text-muted-foreground">
                    Align the CIN card within the frame. Processing happens securely on your device.
                </p>
            </DialogContent>
        </Dialog>
    )
}
