"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Header } from "@/components/header"
import { CustomCursor } from "@/components/custom-cursor"

// Resolve background image from public/collections where 0.jpg is base and 1..54 map to tribes
const imageForIndex = (idx: number) => `/collections/${idx}.jpg`

const groups = [
  "Kinh",
  "Tày",
  "Thái",
  "Hoa",
  "Khmer",
  "Mường",
  "Nùng",
  "Hmông",
  "Dao",
  "Gia Rai",
  "Ngái",
  "Ê Đê",
  "Ba Na",
  "Sán Chay",
  "Chăm",
  "Cơ Ho",
  "Xơ Đăng",
  "Sán Dìu",
  "Hrê",
  "Ra Glai",
  "Mnông",
  "Thổ",
  "Stiêng",
  "Khơ Mú",
  "Bru–Vân Kiều",
  "Giáy",
  "Cơ Tu",
  "Gié–Triêng",
  "Tà Ôi",
  "Mạ",
  "Co",
  "Chơ Ro",
  "Xinh Mun",
  "Hà Nhì",
  "Chu Ru",
  "Lào",
  "La Chí",
  "Kháng",
  "Phù Lá",
  "La Hủ",
  "La Ha",
  "Pà Thẻn",
  "Chứt",
  "Lự",
  "Lô Lô",
  "Mảng",
  "Cờ Lao",
  "Bố Y",
  "Cống",
  "Si La",
  "Pu Péo",
  "Brâu",
  "Ơ Đu",
  "Rơ Măm",
]

export default function CollectionsPage() {
  const [hovered, setHovered] = useState<string | null>(null)
  const defaultBg = imageForIndex(0)
  const currentImage = useMemo(() => {
    if (!hovered) return defaultBg
    const i = groups.indexOf(hovered)
    // Map to 1..54; fallback to base if not found
    return i >= 0 ? imageForIndex(i + 1) : defaultBg
  }, [hovered])

  // Create centered rows like the reference
  const rows = [groups.slice(0, 12), groups.slice(12, 24), groups.slice(24, 36), groups.slice(36)]

  return (
    <main className="text-white min-h-screen">
      <CustomCursor />
      {/* Same navbar as landing */}
      <Header transparent />

      {/* Full viewport hero minus header height to avoid any white gap/scroll */}
      <section className="relative min-h-[100svh] overflow-hidden">
        {/* Background crossfade spans viewport and sits behind header */}
        <div className="fixed inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-0 bg-center bg-cover"
              style={{ backgroundImage: `url('${currentImage}')` }}
              aria-hidden
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full max-w-7xl mx-auto px-6">
          {/* Center monogram already shown in the navbar, so we keep only strapline + rows */}
          <div className="pt-10 md:pt-16 text-center">
            <p className="mx-auto max-w-5xl font-[var(--font-serif)] text-[clamp(22px,3vw,36px)] leading-snug text-white/95">
              Tribalyn has selected outstanding cultural wardrobes and hand‑picked try‑on experiences to make your
              journey unforgettable.
            </p>
          </div>

          {/* Headline between rows */}
          <div className="mt-8 text-center font-[var(--font-sans)] text-[color:var(--accent)] uppercase tracking-[0.3em] text-[10px]">
            Choose your ethnic group
          </div>

          {/* Rows of group names with em-dashes, centered */}
          <div className="mt-5 space-y-2 md:space-y-3">
            {rows.map((row, r) => (
              <div key={r} className="text-center">
                <div className="inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                  {row.map((g, i) => (
                    <div key={g} className="whitespace-nowrap">
                      {/* Hover to change background; no navigation */}
                      <button
                        onMouseEnter={() => setHovered(g)}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered(g)}
                        onBlur={() => setHovered(null)}
                        className={`font-playfair text-[clamp(18px,2vw,26px)] transition-colors underline-offset-4 ${
                          hovered === g ? "text-[color:var(--accent)]" : "text-white/90 hover:text-[color:var(--accent)]"
                        }`}
                      >
                        {g}
                      </button>
                      {i < row.length - 1 && <span className="mx-2 opacity-60">—</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Red accent dot */}
          <div
            className="absolute right-[12%] top-[56%] w-2 h-2 rounded-full"
            style={{ backgroundColor: "var(--accent)" }}
            aria-hidden
          />
        </div>
      </section>
    </main>
  )
}
