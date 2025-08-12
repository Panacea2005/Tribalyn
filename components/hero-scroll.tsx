"use client"

import Image from "next/image"
import { motion, useScroll, useTransform, useSpring, type MotionValue, AnimatePresence } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { Play, X } from "lucide-react"

export function HeroScroll() {
  const ref = useRef<HTMLDivElement>(null)
  const [playerOpen, setPlayerOpen] = useState(false)
  const playerRef = useRef<HTMLVideoElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  // Smoother progress
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.35 })

  // Side images fly away with subtle vertical drift and rotation
  const leftX = useTransform(smooth, [0, 0.45, 1], ["0%", "-30%", "-120%"])
  const rightX = useTransform(smooth, [0, 0.45, 1], ["0%", "30%", "120%"])
  const sidesOpacity = useTransform(smooth, [0, 0.35, 0.7], [1, 0.9, 0])
  const sideY = useTransform(smooth, [0, 1], ["0%", "-6%"])
  const sideRot = useTransform(smooth, [0, 1], [0, -3])

  // Center video spreads to fullscreen
  const videoScale = useTransform(smooth, [0, 1], [0.5, 1.12])
  const radius = useTransform(smooth, [0, 0.7, 1], [40, 14, 0])
  const vignetteAmt = useTransform(smooth, [0, 1], [0.1, 0.28])
  const vignetteBg = useTransform(vignetteAmt, (v) => {
    const v2 = Math.min(1, v + 0.2)
    return `radial-gradient(ellipse at center, rgba(0,0,0,${v}) 0%, rgba(0,0,0,${v}) 60%, rgba(0,0,0,${v2}) 100%)`
  })

  return (
    <section ref={ref} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-white">
        {/* 3D space for nicer depth */}
        <div className="absolute inset-0 [perspective:1200px] [transform-style:preserve-3d]">
          {/* Scatter layer behind video (random-feel layout) */}
          <ScatterLayer progress={smooth} />

          {/* Left column images */}
          <motion.div
            style={{ x: leftX, opacity: sidesOpacity, y: sideY, rotate: sideRot }}
            className="absolute left-[4vw] top-1/2 -translate-y-1/2 w-[24vw] hidden md:block will-change-transform"
          >
            <Column images={[2, 4]} />
          </motion.div>

          {/* Right column images */}
          <motion.div
            style={{ x: rightX, opacity: sidesOpacity, y: sideY, rotate: useTransform(sideRot, (r) => -r) }}
            className="absolute right-[4vw] top-1/2 -translate-y-1/2 w-[24vw] hidden md:block will-change-transform"
          >
            <Column images={[3, 5]} />
          </motion.div>

          {/* Top headline in whitespace above the video (not overlaid on video) */}
          <div className="absolute left-0 right-0 top-4 md:top-8 text-center px-6 z-[30] pointer-events-none">
            <div className="font-playfair text-neutral-900 text-2xl md:text-2xl tracking-tight leading-tight mb-3">
              <span className="block">Virtual try‑on for Vietnam</span>
              <span className="block">and 54 ethnic costumes.</span>
            </div>
            <h1 className="font-playfair text-[color:var(--accent)] text-[12vw] md:text-[9vw] leading-[0.9]">VIETNAM</h1>
            <div className="font-playfair text-neutral-900 text-[7vw] md:text-[5vw] italic text-white/95">&amp; ETHNIC GROUPS</div>
          </div>

          {/* Center video frame spreads to fullscreen */}
          <div className="absolute inset-0 grid place-items-center will-change-transform">
            <motion.div
              style={{ scale: videoScale, borderRadius: radius }}
              className="relative w-screen aspect-[16/9] bg-black overflow-hidden shadow-2xl"
            >
              <video
                className="absolute inset-0 w-full h-full object-cover"
                src="/home/hero/hero.mp4"
                autoPlay
                muted
                loop
                playsInline
                poster="/placeholder.svg?height=720&width=1280"
              />
              <motion.div style={{ background: vignetteBg }} className="absolute inset-0 pointer-events-none" />


              {/* Center play ring */}
              <div className="absolute inset-0 grid place-items-center">
                <button
                  aria-label="Play hero video"
                  onClick={() => {
                    setPlayerOpen(true)
                    // reset to start on open
                    requestAnimationFrame(() => {
                      if (playerRef.current) {
                        playerRef.current.currentTime = 0
                        playerRef.current.play().catch(() => {})
                      }
                    })
                  }}
                  className="relative mt-[36vh] w-14 h-14 md:w-16 md:h-16 rounded-full border border-white/80 grid place-items-center bg-black/20 hover:bg-black/30 transition-colors"
                >
                  <Play className="w-6 h-6 text-white" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Fullscreen video player overlay */}
      <AnimatePresence>
        {playerOpen ? (
          <motion.div
            key="hero-player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-[95] bg-black/95"
          >
            {/* Close button */}
            <button
              aria-label="Close video"
              onClick={() => {
                setPlayerOpen(false)
                if (playerRef.current) playerRef.current.pause()
              }}
              className="absolute right-4 top-4 md:right-6 md:top-6 w-11 h-11 md:w-12 md:h-12 rounded-full border border-white/30 grid place-items-center hover:bg-white/10"
            >
              <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </button>

            {/* Centered video with controls */}
            <div className="w-full h-full grid place-items-center p-4">
              <div className="w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
                <video
                  ref={playerRef}
                  src="/home/hero/hero.mp4"
                  className="w-full h-full object-contain bg-black"
                  controls
                  playsInline
                  autoPlay
                />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}

/**
 * A layer of scattered images behind the video to create depth.
 * Each item gets its own depth, drift and slight rotation.
 */
function ScatterLayer({ progress }: { progress: MotionValue<number> }) {
  const items: ScatterItemConfig[] = [
    // left cluster
    { left: "6vw", top: "14vh", w: "18vw", h: 360, depth: 0.08, rot: -4, tall: true },
    { left: "12vw", top: "58vh", w: "14vw", h: 260, depth: 0.12, rot: 3 },
    // right cluster
    { right: "8vw", top: "12vh", w: "16vw", h: 280, depth: 0.1, rot: 2, tall: true },
    { right: "14vw", top: "52vh", w: "20vw", h: 340, depth: 0.06, rot: -2 },
    // mid smalls
    { left: "22vw", top: "24vh", w: "10vw", h: 200, depth: 0.16, rot: -6 },
    { right: "24vw", top: "36vh", w: "12vw", h: 220, depth: 0.15, rot: 5 },
  ]
  return (
    <>
      {items.map((cfg, i) => (
        <ScatterItem key={i} cfg={cfg} progress={progress} />
      ))}
    </>
  )
}

type ScatterItemConfig = {
  left?: string
  right?: string
  top: string
  w: string
  h: number
  depth: number // 0..1 smaller is deeper
  rot?: number
  tall?: boolean
}

function ScatterItem({ cfg, progress }: { cfg: ScatterItemConfig; progress: MotionValue<number> }) {
  // Translate more for shallower depth; scale slightly in
  const driftX = useTransform(progress, [0, 1], ["0vw", `${(1 - cfg.depth) * 18}vw`])
  const driftY = useTransform(progress, [0, 1], ["0vh", `${(1 - cfg.depth) * -10}vh`])
  const scale = useTransform(progress, [0, 1], [1, 1 + (1 - cfg.depth) * 0.08])
  const rotate = useTransform(progress, [0, 1], [cfg.rot ?? 0, (cfg.rot ?? 0) + (1 - cfg.depth) * 2])
  const opacity = useTransform(progress, [0, 0.2, 0.75, 1], [0, 0.7, 0.5, 0.25])

  return (
    <motion.div style={{ x: driftX, y: driftY, scale, rotate, opacity }} className="absolute will-change-transform">
      <div
        style={{
          position: "absolute",
          left: cfg.left,
          right: cfg.right,
          top: cfg.top,
          width: cfg.w,
        }}
      >
        <div className="relative overflow-hidden rounded-xl bg-neutral-100 shadow-lg">
          <Image
            src={`/placeholder.svg?height=${cfg.h}&width=900&query=random%20heritage%20texture`}
            alt="Backdrop"
            width={900}
            height={cfg.h}
            className={`w-full ${cfg.tall ? "aspect-[3/4]" : "h-auto"} object-cover`}
            priority={false}
          />
        </div>
      </div>
    </motion.div>
  )
}

function Column({ images = [2, 3] as number[] }) {
  return (
    <div className="grid gap-8">
      {images.map((i) => (
        <div key={i} className="relative rounded-xl overflow-hidden bg-neutral-100 will-change-transform">
          <Image
            src={`/home/hero/hero-${i}.jpg`}
            alt={`Gallery ${i}`}
            width={900}
            height={i % 2 ? 800 : 620}
            className="w-full h-auto object-cover"
          />
        </div>
      ))}
    </div>
  )
}
