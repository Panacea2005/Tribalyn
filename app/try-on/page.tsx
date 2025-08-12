"use client"

import type React from "react"

import { useEffect, useRef, useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Camera,
  ImageDown,
  Images,
  MonitorUp,
  RotateCw,
  Scan,
  SlidersHorizontal,
  Contrast,
  Sun,
  Droplets,
  Palette,
  Wand2,
  Layers,
  FlipHorizontal2,
  FlipVertical2,
  MoveHorizontal,
  MoveVertical,
  ZoomIn,
  Share2,
  Download,
  Search,
  Grid,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react"
import { CustomCursor } from "@/components/custom-cursor"

type Mode = "selfie" | "upload" | "sample"

type Tribe = { name: string; items: number }
const tribes: Tribe[] = [
  { name: "Kinh", items: 8 },
  { name: "H’Mông", items: 7 },
  { name: "Tày", items: 6 },
  { name: "Ê Đê", items: 5 },
  { name: "Chăm", items: 6 },
  { name: "Dao", items: 4 },
]

const samples = [
  "/placeholder.svg?height=1600&width=1200",
  "/placeholder.svg?height=1600&width=1200",
  "/placeholder.svg?height=1600&width=1200",
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
  const [selectedSample, setSelectedSample] = useState<string>(samples[0])
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

  // Library
  const [query, setQuery] = useState("")
  const filteredTribes = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tribes
    return tribes.filter((t) => t.name.toLowerCase().includes(q))
  }, [query])

  // Multi-select costumes by tribe, with simple layer list
  const [selectedCostumes, setSelectedCostumes] = useState<
    { id: string; tribe: string; idx: number; label: string; visible: boolean }[]
  >([])

  function toggleCostume(tribe: Tribe, idx: number) {
    const id = `${tribe.name}-${idx}`
    setSelectedCostumes((prev) => {
      const exists = prev.find((c) => c.id === id)
      if (exists) {
        return prev.filter((c) => c.id !== id)
      }
      return [...prev, { id, tribe: tribe.name, idx, label: `${tribe.name} #${idx + 1}`, visible: true }]
    })
  }

  function moveLayer(id: string, dir: "up" | "down") {
    setSelectedCostumes((prev) => {
      const i = prev.findIndex((c) => c.id === id)
      if (i === -1) return prev
      const next = prev.slice()
      const swapWith = dir === "up" ? i - 1 : i + 1
      if (swapWith < 0 || swapWith >= next.length) return prev
      const temp = next[i]
      next[i] = next[swapWith]
      next[swapWith] = temp
      return next
    })
  }

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

  const displayImage = uploaded || selectedSample
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
          <h2 className="font-[var(--font-serif)] text-2xl mb-3">Wardrobe</h2>
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tribe…"
              className="w-full h-10 pl-9 pr-3 rounded-full border bg-white/70 font-[var(--font-sans)] text-sm"
            />
          </div>

          <div className="space-y-6">
            {filteredTribes.map((t) => (
              <div key={t.name} className="border rounded-lg overflow-hidden">
                <div className="px-3 py-2 flex items-center justify-between bg-white">
                  <div className="font-[var(--font-serif)]">{t.name}</div>
                  <div className="text-xs font-[var(--font-sans)] text-neutral-500">{t.items} pieces</div>
                </div>
                <div className="px-3 py-3 grid grid-cols-3 gap-3 bg-neutral-50/60">
                  {Array.from({ length: t.items }).map((_, i) => {
                    const id = `${t.name}-${i}`
                    const active = selectedCostumes.some((c) => c.id === id)
                    return (
                      <button
                        key={i}
                        onClick={() => toggleCostume(t, i)}
                        className={`relative aspect-square rounded-md overflow-hidden border ${
                          active ? "ring-2 ring-[color:var(--accent)]" : ""
                        }`}
                        title={`${t.name} #${i + 1}`}
                      >
                        <Image
                          src="/placeholder.svg?height=300&width=300"
                          alt={`${t.name} garment ${i + 1}`}
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

        {/* Center: Stage */}
        <section className="relative bg-neutral-50 grid place-items-center">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(164,22,26,0.06),transparent_60%)]" />

          {/* Viewport-fit stage (never too long) */}
          <div className="relative w-[90%] max-w-[980px] h-[78svh] bg-white rounded-xl shadow-2xl overflow-hidden border">
            {/* Before (compare) layer */}
            {compare && (
              <div className="absolute inset-0" style={{ clipPath: "inset(0 50% 0 0)" }}>
                {mode === "selfie" ? (
                  <video ref={beforeVideoRef} className="w-full h-full object-cover" playsInline muted />
                ) : (
                  <Image src={displayImage || "/placeholder.svg?height=1400&width=1000"} alt="Before" fill className="object-cover" />
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
              ) : (
                <Image
                  src={displayImage || "/placeholder.svg?height=1400&width=1000"}
                  alt="Preview"
                  fill
                  className={`object-cover transition-transform ${mirrored ? "scale-x-[-1]" : ""}`}
                />
              )}
            </div>
            {compare && <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black/30" />}

            {/* Optional grid for alignment */}
            {gridOn && (
              <div className="absolute inset-0 pointer-events-none opacity-60">
                <GridOverlay />
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

            {/* Upload and Samples */}
            {mode === "upload" && (
              <label className="absolute right-3 bottom-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 bg-white/85 backdrop-blur cursor-pointer">
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
              <div className="absolute right-3 bottom-3 flex gap-2 bg-white/85 backdrop-blur p-2 rounded-full">
                {samples.map((s) => (
                  <button
                    key={s}
                    className={`w-12 h-12 rounded-lg overflow-hidden border ${
                      selectedSample === s ? "ring-2 ring-[color:var(--accent)]" : ""
                    }`}
                    onClick={() => setSelectedSample(s)}
                  >
                    <Image
                      src={s || "/placeholder.svg"}
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

          {/* Bottom tray: quick actions */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/85 backdrop-blur rounded-full border px-3 py-2 flex items-center gap-2">
            <button className="h-9 px-3 rounded-full border text-sm font-[var(--font-sans)] hover:bg-black/5">
              Snapshot
            </button>
            <button className="h-9 px-3 rounded-full border text-sm font-[var(--font-sans)] hover:bg-black/5">
              Undo
            </button>
            <button className="h-9 px-3 rounded-full border text-sm font-[var(--font-sans)] hover:bg-black/5">
              Redo
            </button>
            <button className="h-9 px-3 rounded-full border text-sm font-[var(--font-sans)] hover:bg-black/5">
              Share
            </button>
          </div>
        </section>

        {/* Right: Pro Controls */}
        <aside className="h-full border-l bg-white/70 backdrop-blur px-4 lg:px-5 py-6 overflow-y-auto">
          <h2 className="font-[var(--font-serif)] text-2xl mb-4">Controls</h2>

          {/* Layers manager */}
          <Section title="Layers" icon={<Layers className="w-4 h-4" />}>
            {selectedCostumes.length === 0 ? (
              <div className="text-xs text-neutral-500 font-[var(--font-sans)]">No garments selected yet.</div>
            ) : (
              <div className="space-y-2">
                {selectedCostumes.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-2 border rounded-md px-2 py-1.5 bg-white"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setSelectedCostumes((prev) =>
                            prev.map((x) => (x.id === c.id ? { ...x, visible: !x.visible } : x)),
                          )
                        }
                        className="w-8 h-8 grid place-items-center rounded-md border hover:bg-black/5"
                        title={c.visible ? "Hide" : "Show"}
                      >
                        {c.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <div className="font-[var(--font-sans)] text-sm">{c.label}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveLayer(c.id, "up")}
                        className="w-8 h-8 grid place-items-center rounded-md border hover:bg-black/5"
                        title="Move up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveLayer(c.id, "down")}
                        className="w-8 h-8 grid place-items-center rounded-md border hover:bg-black/5"
                        title="Move down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedCostumes((prev) => prev.filter((x) => x.id !== c.id))}
                        className="w-8 h-8 grid place-items-center rounded-md border hover:bg-black/5"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Fit & Alignment" icon={<Scan className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-2 mb-1">
              <ActionButton icon={<Wand2 className="w-4 h-4" />} onClick={() => { setScalePct(100); setRotateDeg(0); setMoveX(50); setMoveY(50) }}>AI Fit</ActionButton>
              <ActionButton icon={<RefreshCw className="w-4 h-4" />} onClick={() => { setScalePct(70); setRotateDeg(0); setMoveX(50); setMoveY(50); setExposure(50); setSaturation(60) }}>Reset All</ActionButton>
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
            <div className="grid grid-cols-2 gap-2">
              <ToggleLabeled
                label="Flip H"
                icon={<FlipHorizontal2 className="w-4 h-4" />}
                active={mirrored}
                onClick={() => setMirrored((m) => !m)}
              />
              <ToggleLabeled label="Flip V" icon={<FlipVertical2 className="w-4 h-4" />} />
            </div>
            <ToggleLabeled
              label={gridOn ? "Hide Grid" : "Show Grid"}
              icon={<Grid className="w-4 h-4" />}
              active={gridOn}
              onClick={() => setGridOn((g) => !g)}
            />
          </Section>

          <Section title="Masking" icon={<Layers className="w-4 h-4" />}>
            <ToggleLabeled label="Remove Background" icon={<Wand2 className="w-4 h-4" />} />
            <SliderLabeled id="feather" label="Edge Feather" defaultValue={30} />
            <SliderLabeled id="smooth" label="Smoothness" defaultValue={40} />
          </Section>

          <Section title="Color & Tone" icon={<Palette className="w-4 h-4" />}>
            <SliderLabeled id="exposure" label="Exposure" icon={<Sun className="w-4 h-4" />} value={exposure} onChange={setExposure} />
            <SliderLabeled
              id="temperature"
              label="Temperature"
              icon={<Contrast className="w-4 h-4" />}
              defaultValue={50}
            />
            <SliderLabeled id="tint" label="Tint" icon={<Droplets className="w-4 h-4" />} defaultValue={50} />
            <SliderLabeled id="saturation" label="Saturation" icon={<SlidersHorizontal className="w-4 h-4" />} value={saturation} onChange={setSaturation} />
            <SliderLabeled id="vibrance" label="Vibrance" defaultValue={50} />
          </Section>

          <Section title="Output" icon={<Share2 className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-2">
              <ActionButton icon={<Download className="w-4 h-4" />}>Export PNG</ActionButton>
              <ActionButton icon={<Download className="w-4 h-4" />}>Export JPG</ActionButton>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {["720p", "1080p", "4K"].map((r) => (
                <button key={r} className="h-9 rounded-full border text-sm font-[var(--font-sans)] hover:bg-black/5">
                  {r}
                </button>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <ToggleLabeled label="Transparent BG" />
              <ToggleLabeled label="Watermark" />
            </div>
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
