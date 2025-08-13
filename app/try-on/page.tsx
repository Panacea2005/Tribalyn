"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Camera, ImageDown, Images, MonitorUp, RotateCw, FlipHorizontal2, MoveHorizontal, MoveVertical, ZoomIn, Grid, Eye, EyeOff, RefreshCw } from "lucide-react"
import { CustomCursor } from "@/components/custom-cursor"

type Mode = "selfie" | "upload" | "sample"

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

const samples = [
  "/logo.png",
  "/logo.png",
  "/logo.png",
]

export default function TryOnPage() {
  // Page is fixed; only inner panes scroll
  useEffect(() => {
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"
    return () => {
      document.documentElement.style.overflow = prev
    }
  }, [])

  const [mode, setMode] = useState<Mode>("selfie")
  const [selectedSample, setSelectedSample] = useState<string | null>(null)
  const [uploaded, setUploaded] = useState<string | null>(null)
  const [mirrored, setMirrored] = useState(true)
  const [gridOn, setGridOn] = useState(false)
  const [compare, setCompare] = useState(false)
  // Transform controls
  const [scalePct, setScalePct] = useState(70)
  const [rotateDeg, setRotateDeg] = useState(0)
  const [moveX, setMoveX] = useState(50)
  const [moveY, setMoveY] = useState(50)
  // Basic image adjustments
  const [exposure, setExposure] = useState(50) // brightness
  const [saturation, setSaturation] = useState(60)

  // Multi-select outfits by country (simplified to 2 each)
  const [selectedCostumes, setSelectedCostumes] = useState<
    { id: string; tribe: string; idx: number; label: string; visible: boolean }[]
  >([])

  function toggleCostume(country: Country, idx: number) {
    const id = `${country.name}-${idx}`
    setSelectedCostumes((prev) => {
      const exists = prev.find((c) => c.id === id)
      if (exists) {
        return prev.filter((c) => c.id !== id)
      }
      return [...prev, { id, tribe: country.name, idx, label: `${country.name} #${idx + 1}`, visible: true }]
    })
  }

  // Layer reordering removed for simplified experience

  // Camera
  const videoRef = useRef<HTMLVideoElement>(null)
  const beforeVideoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    let active = true
    async function initCam() {
      try {
        if (mode !== "selfie") {
          stopCam()
          return
        }
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
        if (!active) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
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
    initCam()
    return () => {
      active = false
      stopCam()
    }
  }, [mode])

  const displayImage = uploaded || selectedSample || null
  const scale = 0.5 + (scalePct / 100) * 1.5 // ~0.5..2.0
  const tx = (moveX - 50) * 6 // px
  const ty = (moveY - 50) * 6 // px
  const filterCss = `brightness(${exposure / 50}) saturate(${saturation / 50})`

  return (
    <main className="h-screen w-screen overflow-hidden bg-white">
      <CustomCursor />

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
                    const active = selectedCostumes.some((x) => x.id === id)
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
                          src="/placeholder.svg?height=300&width=300"
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
          <div className="absolute inset-0 overflow-hidden">
            {/* Before (compare) layer */}
            {compare && (mode === "selfie" || !!displayImage) && (
              <div className="absolute inset-0" style={{ clipPath: "inset(0 50% 0 0)" }}>
                {mode === "selfie" ? (
                  <video ref={beforeVideoRef} className="w-full h-full object-cover" playsInline muted />
                ) : (
                  <Image src={displayImage || "/logo.png"} alt="Before" fill className="object-cover" />
                )}
              </div>
            )}
            {/* Transformed main layer */}
            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${tx}px, ${ty}px) scale(${scale}) rotate(${rotateDeg}deg)`,
                transformOrigin: "center center",
                filter: filterCss,
              }}
            >
              {mode === "selfie" ? (
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover transition-transform ${mirrored ? "scale-x-[-1]" : ""}`}
                  playsInline
                  muted
                />
              ) : displayImage ? (
                <Image
                  src={displayImage}
                  alt="Preview"
                  fill
                  className={`object-cover transition-transform ${mirrored ? "scale-x-[-1]" : ""}`}
                />
              ) : null}
            </div>
            {compare && <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black/30" />}

            {/* Optional grid for alignment */}
            {gridOn && (
              <div className="absolute inset-0 pointer-events-none opacity-60">
                <GridOverlay />
              </div>
            )}

            {/* Placeholder holder for upload/sample with no image */}
            {((mode === "upload" && !uploaded) || (mode === "sample" && !selectedSample)) && (
              <div className="absolute inset-0 grid place-items-center">
                <div className="flex flex-col items-center gap-3">
                  <img src="/logo.png" alt="Tribalyn" className="h-14 w-auto opacity-90" />
                  <div className="text-sm font-[var(--font-sans)] text-neutral-600">
                    {mode === "upload" ? "Choose an image to begin" : "Pick a sample to preview"}
                  </div>
                </div>
              </div>
            )}

            {/* Selected tokens */}
            <div className="absolute left-4 top-4 right-4 flex flex-wrap gap-2 pointer-events-none">
              {selectedCostumes.map((c) => (
                <span
                  key={c.id}
                  className="px-2 py-1 rounded-full bg-black/55 text-white text-xs font-[var(--font-sans)]"
                >
                  {c.label}
                </span>
              ))}
            </div>

            {/* In-canvas toolbar */}
            <div className="absolute right-3 top-3 flex gap-2">
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
              <ModeButton
                icon={<Images className="w-4 h-4" />}
                active={mode === "sample"}
                onClick={() => setMode("sample")}
              >
                Samples
              </ModeButton>
            </div>

            {/* Upload and Samples (centered) */}
            {mode === "upload" && (
              <label className="absolute left-1/2 bottom-4 -translate-x-1/2 inline-flex items-center gap-2 rounded-full border px-4 py-2 bg-white/90 backdrop-blur cursor-pointer shadow-sm">
                <MonitorUp className="w-4 h-4" />
                <span className="font-[var(--font-sans)] text-sm">Choose image…</span>
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
            )}

            {mode === "sample" && (
              <div className="absolute left-1/2 bottom-4 -translate-x-1/2 flex gap-2 bg-white/90 backdrop-blur p-2 rounded-full shadow-sm">
                {samples.map((s) => (
                  <button
                    key={s}
                    className={`w-12 h-12 rounded-lg overflow-hidden border ${
                      selectedSample === s ? "ring-2 ring-[color:var(--accent)]" : ""
                    }`}
                    onClick={() => setSelectedSample(s)}
                  >
                    <Image
                      src={s || "/logo.png"}
                      alt="Sample"
                      width={160}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Compare overlay toggle */}
            <button
              onClick={() => setCompare((c) => !c)}
              className="absolute left-3 top-3 inline-flex items-center gap-2 h-9 px-3 rounded-full border bg-white/85 font-[var(--font-sans)] text-sm"
            >
              {compare ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              Compare
            </button>
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
            <ToggleLabeled
              label="Flip H"
              icon={<FlipHorizontal2 className="w-4 h-4" />}
              active={mirrored}
              onClick={() => setMirrored((m) => !m)}
            />
          </Section>

          <Section title="Adjustments">
            <SliderLabeled id="exposure" label="Exposure" value={exposure} onChange={setExposure} />
            <SliderLabeled id="saturation" label="Saturation" value={saturation} onChange={setSaturation} />
          </Section>
        </aside>
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
