"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Camera, Download, ImageDown, MonitorUp, FlipHorizontal2, Grid, Eye, EyeOff, RefreshCw, RotateCw, MoveHorizontal, MoveVertical, ZoomIn, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { generateTryOn } from "@/lib/api"
import { CustomCursor } from "@/components/custom-cursor"

type Mode = "selfie" | "upload"

type Country = { name: string; items: number }
const countries: Country[] = [
  { name: "Vietnam", items: 2 },
  { name: "China", items: 2 },
  { name: "Germany", items: 2 },
  { name: "Thailand", items: 2 },
  { name: "Italy", items: 2 },
  { name: "Taiwan", items: 2 },
  { name: "Portugal", items: 2 },
]

// Outfit thumbnails per country (two each). Replace with your real clothing images as needed.
const countryOutfits: Record<string, string[]> = {
  Vietnam: [
    "/try-on/vietnam-1.jpg",
    "/try-on/vietnam-2.jpg",
  ],
  China: [
    "/try-on/china-1.png",
    "/try-on/china-2.jpg",
  ],
  Germany: [
    "/try-on/germany-1.jpg",
    "/try-on/germany-2.jpg",
  ],
  Thailand: [
    "/try-on/thailand-1.jpg",
    "/try-on/thailand-2.jpg",
  ],
  Italy: [
    "/try-on/italy-1.jpg",
    "/try-on/italy-2.jpg",
  ],
  Taiwan: [
    "/try-on/taiwan-1.jpg",
    "/try-on/taiwan-2.jpg",
  ],
  Portugal: [
    "/try-on/portugal-1.jpg",
    "/try-on/portugal-2.jpg",
  ],
}

const maleSamples = [
  "/try-on/samples/1.jpg",
  "/try-on/samples/2.jpg",
  "/try-on/samples/3.jpg",
  "/try-on/samples/4.jpg",
]

const femaleSamples = [
  "/try-on/samples/5.jpg",
  "/try-on/samples/6.jpg",
  "/try-on/samples/7.jpg",
  "/try-on/samples/8.jpg",
]

// Background images grouped by country
const backgroundsByCountry: Record<string, string[]> = {
  China: [
    "/try-on/backgrounds/China_1.png",
    "/try-on/backgrounds/China_2.jpg",
    "/try-on/backgrounds/China_3.jpg",
    "/try-on/backgrounds/China_4.jpg",
  ],
  Germany: [
    "/try-on/backgrounds/Germany_1.jpg",
    "/try-on/backgrounds/Germany_2.jpg",
  ],
  Italy: [
    "/try-on/backgrounds/Italy_1.jpg",
    "/try-on/backgrounds/Italy_2.jpg",
    "/try-on/backgrounds/Italy_3.jpg",
    "/try-on/backgrounds/Italy_4.jpg",
  ],
  Portugal: [
    "/try-on/backgrounds/Portugal_1.jpg",
    "/try-on/backgrounds/Portugal_2.jpg",
    "/try-on/backgrounds/Portugal_3.jpg",
    "/try-on/backgrounds/Portugal_4.jpg",
    "/try-on/backgrounds/Portugal_5.jpg",
  ],
  Taiwan: [
    "/try-on/backgrounds/Taiwan_1.jpg",
    "/try-on/backgrounds/Taiwan_2.jpg",
    "/try-on/backgrounds/Taiwan_3.jpg",
    "/try-on/backgrounds/Taiwan_4.jpg",
  ],
  Thailand: [
    "/try-on/backgrounds/Thailand_1.jpg",
    "/try-on/backgrounds/Thailand_2.jpg",
    "/try-on/backgrounds/Thailand_3.jpg",
    "/try-on/backgrounds/Thailand_4.jpg",
    "/try-on/backgrounds/Thailand_5.jpg",
  ],
  Vietnam: [
    "/try-on/backgrounds/Vietnam_1.jpg",
    "/try-on/backgrounds/Vietnam_2.jpg",
    "/try-on/backgrounds/Vietnam_3.jpg",
    "/try-on/backgrounds/Vietnam_4.jpg",
  ],
}

export default function TryOnPage() {
  // Page is fixed; only inner panes scroll
  useEffect(() => {
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"
    return () => {
      document.documentElement.style.overflow = prev
    }
  }, [])

  const [mode, setMode] = useState<Mode>("upload")
  // No separate sample mode; samples appear within Upload as quick picks
  const [uploaded, setUploaded] = useState<string | null>(null)
  const [mirrored, setMirrored] = useState(true)
  const [gridOn, setGridOn] = useState(false)
  const [viewMode, setViewMode] = useState<"original" | "result" | "compare">("original")
  const [comparePct, setComparePct] = useState(50)
  const stageRef = useRef<HTMLDivElement>(null)
  const [originalStillUrl, setOriginalStillUrl] = useState<string | null>(null)
  // Transform controls
  const [scalePct, setScalePct] = useState(20)
  const [rotateDeg, setRotateDeg] = useState(0)
  const [moveX, setMoveX] = useState(50)
  const [moveY, setMoveY] = useState(50)
  // Basic image adjustments
  const [exposure, setExposure] = useState(50) // brightness
  const [saturation, setSaturation] = useState(60)
  const [vibrance, setVibrance] = useState(50)
  // Backend results
  const [resultB64, setResultB64] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [bgChoice, setBgChoice] = useState<string | null>(null)
  const [uploadedBg, setUploadedBg] = useState<File | null>(null)
  const [avatarPrompt, setAvatarPrompt] = useState("")
  const [backgroundPrompt, setBackgroundPrompt] = useState("")
  const [showSampleLibrary, setShowSampleLibrary] = useState(false)
  const [showBackgroundLibrary, setShowBackgroundLibrary] = useState(false)
  const [backgroundCountry, setBackgroundCountry] = useState<string>("All")

  // Single selected clothing outfit
  const [selectedClothing, setSelectedClothing] = useState<
    { id: string; tribe: string; idx: number; label: string; image: string } | null
  >(null)

  function toggleCostume(country: Country, idx: number) {
    const id = `${country.name}-${idx}`
    setSelectedClothing((prev) => {
      if (prev && prev.id === id) return null
      const images = countryOutfits[country.name] || []
      const image = images[idx] || images[0] || "/logo.png"
      return { id, tribe: country.name, idx, label: `${country.name} #${idx + 1}`, image }
    })
  }

  // Layer reordering removed for simplified experience

  // Camera
  const videoRef = useRef<HTMLVideoElement>(null)
  const beforeVideoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [preferredCamId, setPreferredCamId] = useState<string | null>(null)
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])

  async function listVideoDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.filter((d) => d.kind === "videoinput")
    } catch {
      return []
    }
  }

  async function findCamoDeviceId(): Promise<string | null> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cam = devices.find(
        (d) => d.kind === "videoinput" && (/camo/i.test(d.label) || /reincubate/i.test(d.label) || /iphone/i.test(d.label))
      )
      return cam?.deviceId ?? null
    } catch {
      return null
    }
  }

  useEffect(() => {
    let active = true
    async function startStreamForDevice(deviceId: string | null) {
      try {
        const constraints: MediaStreamConstraints = deviceId
          ? { video: { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false }
          : { video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }

        const s = await navigator.mediaDevices.getUserMedia(constraints)
        if (!active) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        // Stop old stream if any
        if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = s
        if (videoRef.current) {
          videoRef.current.srcObject = s
          await videoRef.current.play()
        }
        if (beforeVideoRef.current) {
          beforeVideoRef.current.srcObject = s
          await beforeVideoRef.current.play()
        }
      } catch {
        // ignore
      }
    }
    function stopCam() {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      if (videoRef.current) videoRef.current.srcObject = null
    }
    async function initCam() {
      if (mode !== "selfie") {
        stopCam()
        return
      }
      // First start any stream to unlock labels, then prefer Camo
      await startStreamForDevice(preferredCamId)
      const list = await listVideoDevices()
      if (active) setVideoDevices(list)
      if (!preferredCamId) {
        const camoId = await findCamoDeviceId()
        if (camoId && active) {
          setPreferredCamId(camoId)
          await startStreamForDevice(camoId)
        }
      }
    }
    initCam()
    return () => {
      active = false
      stopCam()
    }
  }, [mode, preferredCamId])

  useEffect(() => {
    function handleDeviceChange() {
      // Refresh device list when cameras are added/removed
      listVideoDevices().then(setVideoDevices).catch(() => {})
    }
    if (navigator.mediaDevices && "ondevicechange" in navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange)
    }
    return () => {
      if (navigator.mediaDevices && "ondevicechange" in navigator.mediaDevices) {
        navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange)
      }
    }
  }, [])

  const displayImage = uploaded || null
  const afterImage = resultB64 ? `data:image/png;base64,${resultB64}` : null
  const hasAvatarImage = mode === "selfie" || (mode === "upload" && !!uploaded)
  const hasAvatarPrompt = !!avatarPrompt && avatarPrompt.trim().length > 0
  const hasAvatar = hasAvatarImage || hasAvatarPrompt
  const hasBackgroundImage = !!uploadedBg || !!bgChoice
  const hasBackgroundPrompt = !!backgroundPrompt && backgroundPrompt.trim().length > 0
  const hasBackground = hasBackgroundImage || hasBackgroundPrompt
  const scale = 0.5 + (scalePct / 100) * 1.5 // ~0.5..2.0
  const tx = (moveX - 50) * 6 // px
  const ty = (moveY - 50) * 6 // px
  const vibranceFactor = 1 + (vibrance - 50) / 100
  const filterCss = `brightness(${exposure / 50}) saturate(${(saturation / 50) * vibranceFactor}) contrast(${vibranceFactor})`

  // Helpers to convert sources to File for API
  async function urlToFile(url: string): Promise<File> {
    const res = await fetch(url)
    const blob = await res.blob()
    const name = url.split("/").pop() || "image.jpg"
    return new File([blob], name, { type: blob.type || "image/jpeg" })
  }

  async function placeholderToFile(url: string): Promise<File> {
    return urlToFile(url)
  }

  async function urlOrVideoToFile(url: string): Promise<File> {
    // If it's a blob URL from upload, fetch it; otherwise fetch static asset
    return urlToFile(url)
  }

  async function captureSelfieToFile(): Promise<File> {
    const video = videoRef.current
    if (!video) throw new Error("Camera not ready")
    const width = video.videoWidth || 1280
    const height = video.videoHeight || 720
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")!
    if (mirrored) {
      ctx.translate(width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0, width, height)
    const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), "image/jpeg", 0.92)!)
    return new File([blob], "selfie.jpg", { type: "image/jpeg" })
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-white">
      <CustomCursor />
      
      {/* Generating Animation Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            key="generating-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] grid place-items-center backdrop-blur-md bg-white/80"
          >
            <div className="relative w-[260px] h-[260px] grid place-items-center">
              {/* Logo */}
              <img src="/logo.png" alt="Tribalyn" className="h-20 w-auto" />

              {/* Progress rings */}
              <svg
                className="absolute inset-0 m-auto rotate-[-90deg]"
                width={260}
                height={260}
                viewBox="0 0 260 260"
                aria-hidden
              >
                {/* Outer track */}
                <circle
                  cx="130"
                  cy="130"
                  r="52"
                  fill="none"
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="3"
                />
                {/* Inner track */}
                <circle
                  cx="130"
                  cy="130"
                  r="44"
                  fill="none"
                  stroke="rgba(0,0,0,0.08)"
                  strokeWidth="3"
                />
                {/* Outer white progress (counter‑clockwise) */}
                <motion.circle
                  cx="130"
                  cy="130"
                  r="52"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={2 * Math.PI * 52}
                  transform="matrix(-1 0 0 1 260 0)"
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ 
                    strokeDashoffset: { 
                      duration: 2, 
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "loop"
                    } 
                  }}
                />
                {/* Inner accent progress */}
                <motion.circle
                  cx="130"
                  cy="130"
                  r="44"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 44}
                  strokeDashoffset={2 * Math.PI * 44}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ 
                    strokeDashoffset: { 
                      duration: 1.5, 
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "loop"
                    } 
                  }}
                />
              </svg>
            </div>
            
            {/* Generating text */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg font-[var(--font-serif)] text-neutral-800 mb-2"
              >
                Generating Try-On
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-sm font-[var(--font-sans)] text-neutral-600"
              >
                This may take a few moments...
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note: Brand logo is shown inside the left sidebar */}

      {/* 3 fixed columns; panes scroll internally if needed */}
      <div className="grid h-full w-full grid-cols-1 lg:grid-cols-[360px_1fr_360px]">
        {/* Left: Library */}
        <aside className="h-full border-r bg-white/70 backdrop-blur px-4 lg:px-5 py-6 overflow-y-auto">
          <Link href="/" aria-label="Tribalyn home" className="inline-block mb-4">
            <Image src="/logo.png" alt="Tribalyn" width={160} height={40} className="h-10 w-auto" />
          </Link>
          <h2 className="font-[var(--font-serif)] text-2xl mb-3">Countries</h2>
          <div className="space-y-6">
            {countries.map((c) => (
              <div key={c.name} className="border rounded-lg overflow-hidden">
                <div className="px-3 py-2 flex items-center justify-between bg-white">
                  <div className="font-[var(--font-serif)]">{c.name}</div>
                  <div className="text-xs font-[var(--font-sans)] text-neutral-500">2 outfits</div>
                </div>
                <div className="px-3 py-3 grid grid-cols-2 gap-3 bg-neutral-50/60">
                  {Array.from({ length: 2 }).map((_, i) => {
                    const id = `${c.name}-${i}`
                    const active = selectedClothing?.id === id
                    const imgSrc = (countryOutfits[c.name] && countryOutfits[c.name][i]) || (countryOutfits[c.name] && countryOutfits[c.name][0]) || "/logo.png"
                    return (
                      <button
                        key={i}
                        onClick={() => toggleCostume(c, i)}
                        className={`relative aspect-square rounded-md overflow-hidden border ${
                          active ? "ring-2 ring-[color:var(--accent)]" : ""
                        }`}
                        title={`${c.name} #${i + 1}`}
                      >
                        <Image
                          src={imgSrc}
                          alt={`${c.name} outfit ${i + 1}`}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute left-1.5 top-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/90 text-[10px] font-[var(--font-sans)]">
                          {i + 1}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Center: Stage (full-bleed) */}
        <section className="relative bg-neutral-50">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(164,22,26,0.06),transparent_60%)]" />

          {/* Full canvas */}
          <div ref={stageRef} className="absolute inset-0 overflow-hidden select-none">
            {/* Before (compare) layer */}
            {viewMode === "compare" && afterImage && (
              <div className="absolute inset-0 z-20">
                <div
                  className="absolute inset-0"
                  style={{
                    transform: `translate(${tx}px, ${ty}px) scale(${scale}) rotate(${rotateDeg}deg)`,
                    transformOrigin: "center center",
                    filter: filterCss,
                  }}
                >
                  {/* Left: original */}
                  <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - comparePct}% 0 0)` }}>
                    {originalStillUrl ? (
                      <Image src={originalStillUrl} alt="Original" fill className="object-contain" />
                    ) : mode === "selfie" ? (
                      <video ref={beforeVideoRef} className="w-full h-full object-contain" playsInline muted />
                    ) : (
                      <Image src={displayImage || "/logo.png"} alt="Original" fill className="object-contain" />
                    )}
                  </div>
                  {/* Right: result */}
                  <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${comparePct}%)` }}>
                    <Image src={afterImage} alt="Result" fill className="object-contain" />
                  </div>
                  {/* Divider and handle inside the same transformed plane */}
                  <div
                    className="absolute top-0 bottom-0 w-[2px] bg-white/95 shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
                    style={{ left: `${comparePct}%`, transform: "translateX(-1px)" }}
                  />
                  <div
                    role="slider"
                    aria-label="Drag to compare"
                    className="absolute top-1/2 -translate-y-1/2 -ml-4 h-10 w-10 rounded-full border bg-white shadow grid place-items-center cursor-ew-resize"
                    style={{ left: `${comparePct}%` }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      const start = stageRef.current
                      if (!start) return
                      const onMove = (ev: MouseEvent) => {
                        const rect = start.getBoundingClientRect()
                        const pct = Math.min(100, Math.max(0, ((ev.clientX - rect.left) / rect.width) * 100))
                        setComparePct(pct)
                      }
                      const onUp = () => {
                        window.removeEventListener("mousemove", onMove)
                        window.removeEventListener("mouseup", onUp)
                      }
                      window.addEventListener("mousemove", onMove)
                      window.addEventListener("mouseup", onUp)
                    }}
                    onTouchStart={(e) => {
                      const start = stageRef.current
                      if (!start) return
                      const onMove = (ev: TouchEvent) => {
                        const rect = start.getBoundingClientRect()
                        const x = ev.touches[0]?.clientX ?? 0
                        const pct = Math.min(100, Math.max(0, ((x - rect.left) / rect.width) * 100))
                        setComparePct(pct)
                      }
                      const onEnd = () => {
                        window.removeEventListener("touchmove", onMove)
                        window.removeEventListener("touchend", onEnd)
                        window.removeEventListener("touchcancel", onEnd)
                      }
                      window.addEventListener("touchmove", onMove)
                      window.addEventListener("touchend", onEnd)
                      window.addEventListener("touchcancel", onEnd)
                    }}
                  >
                    <span className="h-3 w-3 rounded-full bg-[color:var(--accent)]" />
                  </div>
                </div>
              </div>
            )}
            {/* Transformed main layer */}
            <div
              className="absolute inset-0 z-10"
              style={{
                transform: `translate(${tx}px, ${ty}px) scale(${scale}) rotate(${rotateDeg}deg)`,
                transformOrigin: "center center",
                filter: filterCss,
              }}
            >
              {viewMode !== "compare" && (mode === "selfie" ? (
                <video
                  ref={videoRef}
                  className={`w-full h-full object-contain transition-transform ${mirrored ? "scale-x-[-1]" : ""}`}
                  playsInline
                  muted
                />
              ) : viewMode === "result" && afterImage ? (
                <Image
                  src={afterImage}
                  alt="Preview"
                  fill
                  className={`object-contain transition-transform ${mirrored ? "scale-x-[-1]" : ""}`}
                />
              ) : viewMode !== "result" && displayImage ? (
                <Image
                  src={displayImage}
                  alt="Preview"
                  fill
                  className={`object-contain transition-transform ${mirrored ? "scale-x-[-1]" : ""}`}
                />
              ) : null)}
            </div>

            {/* Optional grid for alignment */}
            {gridOn && (
              <div className="absolute inset-0 pointer-events-none opacity-60">
                <GridOverlay />
              </div>
            )}

            {/* Placeholder holder only when there is truly no content */}
            {!afterImage && !displayImage && mode !== "selfie" && (
              <div className="absolute inset-0 grid place-items-center z-0 pointer-events-none">
                <div className="flex flex-col items-center gap-3">
                  <img src="/logo.png" alt="Tribalyn" className="h-14 w-auto opacity-90" />
                  <div className="text-sm font-[var(--font-sans)] text-neutral-600">
                    {mode === "upload" ? "Choose an image to begin" : "Pick a sample to preview"}
                  </div>
                </div>
              </div>
            )}

            {/* Selected clothing token */}
            {selectedClothing && (
            <div className="absolute left-4 top-4 right-4 flex flex-wrap gap-2 pointer-events-none">
                <span className="px-2 py-1 rounded-full bg-black/55 text-white text-xs font-[var(--font-sans)]">{selectedClothing.label}</span>
            </div>
            )}

            {/* In-canvas toolbar */}
            <div className="absolute right-3 top-3 flex gap-2 z-30">
              <ModeButton
                icon={<Camera className="w-4 h-4" />}
                active={mode === "selfie"}
                onClick={() => setMode("selfie")}
              >
                Selfie
              </ModeButton>
              <ModeButton
                icon={<ImageDown className="w-4 h-4" />}
                active={mode === "upload"}
                onClick={() => setMode("upload")}
              >
                Upload
              </ModeButton>
            </div>

            {/* Camera device picker (for Camo/iPhone) */}
            {mode === "selfie" && (
              <div className="absolute right-3 top-14 z-30">
                <select
                  value={preferredCamId ?? ""}
                  onChange={(e) => setPreferredCamId(e.target.value || null)}
                  className="h-9 px-3 rounded-full border bg-white/90 backdrop-blur text-sm font-[var(--font-sans)]"
                >
                  <option value="">Default camera</option>
                  {videoDevices.map((d, idx) => (
                    <option key={d.deviceId || idx} value={d.deviceId}>
                      {d.label || `Camera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Upload and Samples (centered) */}
            {mode === "selfie" && (
              <div className="absolute left-1/2 bottom-6 -translate-x-1/2 z-30 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg border">
                <button
                  onClick={async () => {
                    try {
                      const file = await captureSelfieToFile()
                      const url = URL.createObjectURL(file)
                      setUploaded(url)
                      setOriginalStillUrl(url)
                      setMode("upload")
                    } catch {}
                  }}
                  className="inline-flex items-center gap-2 h-9 px-3 rounded-full border text-sm font-[var(--font-sans)] hover:bg-black/5 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture</span>
                </button>
              </div>
            )}
            {/* Upload/Sample controls - redesigned */}
            {mode === "upload" && (
              <>
                {/* Upload, samples, and renew buttons - bottom bar */}
                <div className="absolute left-1/2 bottom-8 -translate-x-1/2 flex items-center gap-2 z-30 bg-white/95 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg border">
                  <label className="inline-flex items-center gap-2 h-9 px-3 rounded-full border text-sm font-[var(--font-sans)] cursor-pointer hover:bg-black/5 transition-colors">
                    <MonitorUp className="w-4 h-4" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (!f) return
                        const url = URL.createObjectURL(f)
                        setUploaded(url)
                        setMode("upload")
                      }}
                    />
                  </label>
                  
                  <button 
                    onClick={() => setShowSampleLibrary(true)}
                    className="inline-flex items-center gap-2 h-9 px-3 rounded-full border text-sm font-[var(--font-sans)] hover:bg-black/5 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Samples</span>
                  </button>

                  <button 
                    onClick={() => {
                      setUploaded(null)
                      setResultB64(null)
                      setViewMode("original")
                      setSelectedClothing(null)
                      setBgChoice(null)
                      setUploadedBg(null)
                      setAvatarPrompt("")
                      setBackgroundPrompt("")
                    }}
                    className="inline-flex items-center gap-2 h-9 px-3 rounded-full border text-sm font-[var(--font-sans)] hover:bg-black/5 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Renew</span>
                  </button>
                </div>

                {/* Sample Library Modal */}
                {showSampleLibrary && (
                  <div className="fixed inset-0 bg-black/40 backdrop-blur-lg z-[9999] flex items-center justify-center p-8" style={{ zIndex: 9999 }}>
                    <div className="bg-white rounded-2xl shadow-2xl w-[80vw] h-[80vh] overflow-hidden relative" style={{ zIndex: 10000 }}>
                      {/* Header */}
                      <div className="flex items-center justify-between p-6 border-b">
                        <h3 className="font-[var(--font-serif)] text-xl text-neutral-800">Choose a sample photo</h3>
                        <button 
                          onClick={() => setShowSampleLibrary(false)}
                          className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                        >
                          <span className="text-neutral-600">×</span>
                        </button>
                      </div>
                      
                      {/* Content - Split Layout */}
                      <div className="flex h-full">
                        {/* Left Side - Male Models */}
                        <div className="w-1/2 p-6 border-r border-neutral-200" style={{ zIndex: 10001, position: 'relative' }}>
                          <h4 className="font-[var(--font-sans)] text-sm font-medium text-neutral-600 mb-4 uppercase tracking-wider">Male Models</h4>
                          <div className="grid grid-cols-3 gap-2">
                            {maleSamples.map((sample) => (
                              <button
                                key={sample}
                                className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                                  uploaded === sample ? "border-[color:var(--accent)] ring-2 ring-[color:var(--accent)]/20" : "border-neutral-200 hover:border-neutral-300"
                                }`}
                                style={{ zIndex: 10002, position: 'relative' }}
                                onClick={() => {
                                  setUploaded(sample)
                                  setShowSampleLibrary(false)
                                }}
                              >
                                <Image
                                  src={sample}
                                  alt="Male sample"
                                  fill
                                  className="object-cover"
                                />
                                {uploaded === sample && (
                                  <div className="absolute inset-0 bg-[color:var(--accent)]/10 flex items-center justify-center">
                                    <div className="w-6 h-6 rounded-full bg-[color:var(--accent)] flex items-center justify-center">
                                      <span className="text-white text-xs">✓</span>
                                    </div>
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Right Side - Female Models */}
                        <div className="w-1/2 p-6" style={{ zIndex: 10001, position: 'relative' }}>
                          <h4 className="font-[var(--font-sans)] text-sm font-medium text-neutral-600 mb-4 uppercase tracking-wider">Female Models</h4>
                          <div className="grid grid-cols-3 gap-2">
                            {femaleSamples.map((sample) => (
                              <button
                                key={sample}
                                className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                                  uploaded === sample ? "border-[color:var(--accent)] ring-2 ring-[color:var(--accent)]/20" : "border-neutral-200 hover:border-neutral-300"
                                }`}
                                style={{ zIndex: 10002, position: 'relative' }}
                                onClick={() => {
                                  setUploaded(sample)
                                  setShowSampleLibrary(false)
                                }}
                              >
                                <Image
                                  src={sample}
                                  alt="Female sample"
                                  fill
                                  className="object-cover"
                                />
                                {uploaded === sample && (
                                  <div className="absolute inset-0 bg-[color:var(--accent)]/10 flex items-center justify-center">
                                    <div className="w-6 h-6 rounded-full bg-[color:var(--accent)] flex items-center justify-center">
                                      <span className="text-white text-xs">✓</span>
                                    </div>
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Compare overlay toggle */}
            <div className="absolute left-3 top-3 flex gap-2 z-30">
              <ModeButton icon={<Eye className="w-4 h-4" />} active={viewMode === "original"} onClick={() => setViewMode("original")}>Original</ModeButton>
              <ModeButton icon={<Eye className="w-4 h-4" />} active={viewMode === "result"} onClick={() => afterImage && setViewMode("result")}>
                Result
              </ModeButton>
              <ModeButton icon={<Eye className="w-4 h-4" />} active={viewMode === "compare"} onClick={() => afterImage && setViewMode("compare")}>
              Compare
              </ModeButton>
          </div>

            {/* Generate button moved to right panel */}
          </div>

          {/* Bottom tray removed per simplification */}
        </section>

        {/* Right: Simplified Controls */}
        <aside className="h-full border-l bg-white/70 backdrop-blur px-4 lg:px-5 py-6 overflow-y-auto">
          <h2 className="font-[var(--font-serif)] text-2xl mb-4">Controls</h2>

          <Section title="Fit & Alignment">
            <div className="grid grid-cols-2 gap-2 mb-1">
              <ActionButton icon={<RefreshCw className="w-4 h-4" />} onClick={() => { setScalePct(70); setRotateDeg(0); setMoveX(50); setMoveY(50); setExposure(50); setSaturation(60) }}>Reset</ActionButton>
              <ToggleLabeled
                label={gridOn ? "Hide Grid" : "Show Grid"}
                icon={<Grid className="w-4 h-4" />}
                active={gridOn}
                onClick={() => setGridOn((g) => !g)}
              />
                    </div>
            <ToggleLabeled
              label="Flip H"
              icon={<FlipHorizontal2 className="w-4 h-4" />}
              active={mirrored}
              onClick={() => setMirrored((m) => !m)}
            />
          </Section>

          <Section title="Background">
            <div className="space-y-2">
              {bgChoice ? (
                <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden border">
                  <Image src={bgChoice} alt="Selected background" fill className="object-cover" />
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                <ActionButton icon={<ImageDown className="w-4 h-4" />} onClick={() => setShowBackgroundLibrary(true)}>
                  Library
                </ActionButton>
                <label className="h-9 px-3 rounded-full border text-sm font-[var(--font-sans)] inline-flex items-center gap-2 hover:bg-black/5 cursor-pointer">
                  <MonitorUp className="w-4 h-4" />
                  <span>Upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    setUploadedBg(f)
                    const url = URL.createObjectURL(f)
                    setBgChoice(url)
                  }} />
                </label>
              </div>
            </div>
            {/* moved modal to root level */}
          </Section>

          <Section title="Prompts (optional)">
            <div className="grid gap-2">
              <div>
                <label className="block text-xs text-neutral-600 font-[var(--font-sans)] mb-1">Avatar prompt</label>
                <textarea value={avatarPrompt} onChange={(e) => setAvatarPrompt(e.target.value)} className="w-full min-h-[72px] rounded-md border p-2 text-sm font-[var(--font-sans)]" placeholder="Describe the avatar (e.g., 'young woman, smiling, front-facing')" />
              </div>
              <div>
                <label className="block text-xs text-neutral-600 font-[var(--font-sans)] mb-1">Background prompt</label>
                <textarea value={backgroundPrompt} onChange={(e) => setBackgroundPrompt(e.target.value)} className="w-full min-h-[72px] rounded-md border p-2 text-sm font-[var(--font-sans)]" placeholder="Describe the background (e.g., 'studio white backdrop, soft light')" />
              </div>
            </div>
          </Section>

          <Section title="Fit & Alignment (Detailed)">
            <SliderLabeled id="scale" label="Scale" icon={<ZoomIn className="w-4 h-4" />} value={scalePct} onChange={setScalePct} />
            <SliderLabeled
              id="rotate"
              label="Rotate"
              icon={<RotateCw className="w-4 h-4" />}
              value={rotateDeg}
              min={-45}
              max={45}
              onChange={setRotateDeg}
            />
            <SliderLabeled id="x" label="Move X" icon={<MoveHorizontal className="w-4 h-4" />} value={moveX} onChange={setMoveX} />
            <SliderLabeled id="y" label="Move Y" icon={<MoveVertical className="w-4 h-4" />} value={moveY} onChange={setMoveY} />
            <SliderLabeled id="vibrance" label="Vibrance" value={vibrance} onChange={setVibrance} />
          </Section>

          <div className="mt-6 border-t pt-4 space-y-3">
            <button
              onClick={async () => {
                if (!selectedClothing) return
                try {
                  setIsGenerating(true)
                  let avatarFile: File | null = null
                  if (mode === "selfie") {
                    avatarFile = await captureSelfieToFile()
                    const still = URL.createObjectURL(avatarFile)
                    setOriginalStillUrl(still)
                  } else if (mode === "upload" && uploaded) {
                    avatarFile = await urlOrVideoToFile(uploaded)
                    setOriginalStillUrl(uploaded)
                  } else if (false) {
                    // no sample mode
                  } else if (avatarPrompt.trim().length > 0) {
                    avatarFile = null
                  }
                  const clothingFile = await urlToFile(selectedClothing.image)
                  const backgroundFile = uploadedBg ? uploadedBg : bgChoice ? await urlToFile(bgChoice) : null
                  const res = await generateTryOn({
                    avatar: avatarFile ?? undefined,
                    clothing: clothingFile,
                    background: backgroundFile,
                    options: {
                      ...(avatarPrompt ? { avatar_prompt: avatarPrompt } : {}),
                      ...(backgroundPrompt ? { background_prompt: backgroundPrompt } : {}),
                    },
                  })
                  setResultB64(res.imageBase64 ?? null)
                  setViewMode("result")
                } catch (e) {
                  console.warn("Generate failed", e)
                } finally {
                  setIsGenerating(false)
                }
              }}
              className="w-full h-11 rounded-full border bg-[color:var(--accent)] text-white font-[var(--font-sans)] disabled:opacity-60"
              disabled={isGenerating || !selectedClothing || !hasAvatar}
            >
              {isGenerating ? "Generating…" : "Generate Try‑On"}
            </button>
            
            {afterImage && (
              <button
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = afterImage
                  link.download = `tribalyn-tryon-${Date.now()}.png`
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
                className="w-full h-11 rounded-full border bg-white text-neutral-700 font-[var(--font-sans)] hover:bg-neutral-50 transition-colors inline-flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Save Result
              </button>
            )}
          </div>
        </aside>

        {/* Background Library Modal (root-level) */}
      {showBackgroundLibrary && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-lg z-[9999] flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl shadow-2xl w-[80vw] h-[80vh] overflow-hidden relative">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="font-[var(--font-serif)] text-xl text-neutral-800">Choose a background</h3>
              <div className="flex items-center gap-3">
                <select
                  value={backgroundCountry}
                  onChange={(e) => setBackgroundCountry(e.target.value)}
                  className="h-9 px-3 rounded-full border bg-white text-sm font-[var(--font-sans)]"
                >
                  <option value="All">All countries</option>
                  {Object.keys(backgroundsByCountry).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button 
                  onClick={() => setShowBackgroundLibrary(false)}
                  className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                >
                  <span className="text-neutral-600">×</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="h-[calc(80vh-73px)] overflow-y-auto p-6 space-y-8">
              {(backgroundCountry === "All" ? Object.keys(backgroundsByCountry) : [backgroundCountry]).map((country) => (
                <div key={country}>
                  <h4 className="font-[var(--font-sans)] text-sm font-medium text-neutral-600 mb-3 uppercase tracking-wider">{country}</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {backgroundsByCountry[country].map((src) => (
                      <button
                        key={src}
                        className={`relative aspect-[4/3] rounded-md overflow-hidden border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                          bgChoice === src ? "border-[color:var(--accent)] ring-2 ring-[color:var(--accent)]/20" : "border-neutral-200 hover:border-neutral-300"
                        }`}
                        onClick={() => {
                          setBgChoice(src)
                          setShowBackgroundLibrary(false)
                        }}
                      >
                        <Image src={src} alt={`${country} background`} fill className="object-cover" />
                        {bgChoice === src && (
                          <div className="absolute inset-0 bg-[color:var(--accent)]/10 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-[color:var(--accent)] flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </main>
  )
}

function ModeButton({
  icon,
  children,
  active,
  onClick,
}: {
  icon: React.ReactNode
  children: React.ReactNode
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 h-9 px-3 rounded-full border text-sm font-[var(--font-sans)] ${
        active ? "bg-[color:var(--accent)] text-white border-[color:var(--accent)]" : "bg-white/90 backdrop-blur"
      }`}
    >
      {icon}
      {children}
    </button>
  )
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="font-[var(--font-sans)] text-sm text-neutral-700 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function SliderLabeled({
  id,
  label,
  icon,
  value,
  onChange,
  defaultValue = 50,
  min = 0,
  max = 100,
}: {
  id: string
  label: string
  icon?: React.ReactNode
  value?: number
  onChange?: (v: number) => void
  defaultValue?: number
  min?: number
  max?: number
}) {
  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <label htmlFor={id} className="font-[var(--font-sans)] text-sm">
            {label}
          </label>
        </div>
        <span className="text-xs text-neutral-500 font-[var(--font-sans)]">{value ?? defaultValue}</span>
      </div>
      {onChange ? (
        <input
          id={id}
          type="range"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-[color:var(--accent)]"
          min={min}
          max={max}
          step={1}
        />
      ) : (
        <input
          id={id}
          type="range"
          defaultValue={defaultValue}
          className="w-full accent-[color:var(--accent)]"
          min={min}
          max={max}
          step={1}
        />
      )}
    </div>
  )
}

function ToggleLabeled({
  label,
  icon,
  active,
  onClick,
}: {
  label: string
  icon?: React.ReactNode
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`h-9 px-3 rounded-full border text-sm font-[var(--font-sans)] inline-flex items-center gap-2 ${
        active ? "bg-[color:var(--accent)] text-white border-[color:var(--accent)]" : "bg-white hover:bg-black/5"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function ActionButton({
  icon,
  children,
  onClick,
}: { icon: React.ReactNode; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-9 px-3 rounded-full border text-sm font-[var(--font-sans)] inline-flex items-center gap-2 hover:bg-black/5"
    >
      {icon}
      {children}
    </button>
  )
}

function GridOverlay() {
  const lines = new Array(8).fill(0)
  return (
    <svg width="100%" height="100%">
      {/* vertical */}
      {lines.map((_, i) => (
        <line
          key={`v-${i}`}
          x1={`${(i + 1) * (100 / 9)}%`}
          y1="0%"
          x2={`${(i + 1) * (100 / 9)}%`}
          y2="100%"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
        />
      ))}
      {/* horizontal */}
      {lines.map((_, i) => (
        <line
          key={`h-${i}`}
          x1="0%"
          y1={`${(i + 1) * (100 / 9)}%`}
          x2="100%"
          y2={`${(i + 1) * (100 / 9)}%`}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
        />
      ))}
    </svg>
  )
}
