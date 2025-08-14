"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Camera, ImageDown, MonitorUp, FlipHorizontal2, Grid, Eye, EyeOff, RefreshCw, RotateCw, MoveHorizontal, MoveVertical, ZoomIn } from "lucide-react"
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
    "/try-on/china-1.jpg",
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

const samples = [
  "/try-on/samples/1.jpg",
  "/try-on/samples/2.jpg",
  "/try-on/samples/3.jpg",
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
  const [scalePct, setScalePct] = useState(70)
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
              <div
                className="absolute inset-0 z-20 pointer-events-none"
              >
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
                </div>
                {/* Divider and handle */}
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-white/95 shadow-[0_0_0_1px_rgba(0,0,0,0.2)] pointer-events-none"
                  style={{ left: `${comparePct}%`, transform: "translateX(-1px)" }}
                />
                <div
                  role="slider"
                  aria-label="Drag to compare"
                  className="absolute top-1/2 -translate-y-1/2 -ml-4 h-10 w-10 rounded-full border bg-white shadow grid place-items-center cursor-ew-resize pointer-events-auto"
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

            {/* Upload and Samples (centered) */}
            {mode === "selfie" && (
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
                className="absolute left-1/2 bottom-4 -translate-x-1/2 h-10 px-4 rounded-full border bg-white/90 backdrop-blur text-sm font-[var(--font-sans)] z-30"
              >
                Capture Selfie
              </button>
            )}
            {mode === "upload" && (
              <label className={`absolute left-1/2 bottom-20 -translate-x-1/2 inline-flex items-center gap-2 rounded-full border px-4 py-2 bg-white/90 backdrop-blur shadow-sm z-30 ${hasAvatarPrompt ? "opacity-50" : "cursor-pointer"}`}>
                <MonitorUp className="w-4 h-4" />
                <span className="font-[var(--font-sans)] text-sm">Choose image…</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={hasAvatarPrompt}
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
            {mode === "upload" && (
              <div className={`absolute left-1/2 bottom-4 -translate-x-1/2 flex gap-2 bg-white/90 backdrop-blur p-2 rounded-full shadow-sm z-30 ${hasAvatarPrompt ? "opacity-50 pointer-events-none" : ""}`}>
                {samples.map((s) => (
                  <button
                    key={s}
                    className={`w-12 h-12 rounded-lg overflow-hidden border ${
                      uploaded === s ? "ring-2 ring-[color:var(--accent)]" : ""
                    }`}
                    onClick={() => {
                      if (hasAvatarPrompt) return
                      setUploaded(s)
                      setMode("upload")
                    }}
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
            <div className={`grid grid-cols-3 gap-2 ${hasBackgroundPrompt ? "opacity-50 pointer-events-none" : ""}`}>
              {["/try-on/backgrounds/1.jpg", "/try-on/backgrounds/2.jpg", "/try-on/backgrounds/3.jpg", "/try-on/backgrounds/4.jpg"].map((src) => (
                <button key={src} className={`relative aspect-[4/3] rounded-md overflow-hidden border ${bgChoice === src ? "ring-2 ring-[color:var(--accent)]" : ""}`} onClick={() => setBgChoice((s) => (s === src ? null : src))}>
                  <Image src={src} alt="Background" fill className="object-cover" />
                      </button>
                ))}
              </div>
            <label className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 bg-white/80 ${hasBackgroundPrompt ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}>
              <MonitorUp className="w-4 h-4" />
              <span className="text-sm font-[var(--font-sans)]">Upload background…</span>
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const f = e.target.files?.[0]
                if (!f) return
                setUploadedBg(f)
                const url = URL.createObjectURL(f)
                setBgChoice(url)
              }} />
            </label>
          </Section>

          <Section title="Prompts (optional)">
            <div className="grid gap-2">
              <div>
                <label className="block text-xs text-neutral-600 font-[var(--font-sans)] mb-1">Avatar prompt</label>
                <textarea value={avatarPrompt} onChange={(e) => setAvatarPrompt(e.target.value)} disabled={hasAvatarImage} className="w-full min-h-[72px] rounded-md border p-2 text-sm font-[var(--font-sans)] disabled:opacity-50" placeholder="Describe the avatar if not uploading (e.g., 'young woman, smiling, front-facing')" />
              </div>
              <div>
                <label className="block text-xs text-neutral-600 font-[var(--font-sans)] mb-1">Background prompt</label>
                <textarea value={backgroundPrompt} onChange={(e) => setBackgroundPrompt(e.target.value)} disabled={hasBackgroundImage} className="w-full min-h-[72px] rounded-md border p-2 text-sm font-[var(--font-sans)] disabled:opacity-50" placeholder="Describe the background (e.g., 'studio white backdrop, soft light')" />
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

          <div className="mt-6 border-t pt-4">
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
                      ...(!hasAvatarImage && avatarPrompt ? { avatar_prompt: avatarPrompt } : {}),
                      ...(!hasBackgroundImage && backgroundPrompt ? { background_prompt: backgroundPrompt } : {}),
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
            </div>
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
