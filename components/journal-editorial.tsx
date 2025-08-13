"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useMemo, useRef } from "react"

export function JournalEditorial() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 20%"] })

  const lines = useMemo(
    () => [
      (
        <>
          Wear <span className="underline decoration-2 underline-offset-8 text-[color:var(--accent)]" style={{ textDecorationColor: "var(--accent)" }}>culture</span>, not just clothes.
        </>
      ),
      (
        <>
          Try on <em>Áo dài</em>, Qipao, Hanfu — in seconds.
        </>
      ),
      (
        <>
          Share your look. <span className="underline decoration-2 underline-offset-8 text-[color:var(--accent)]" style={{ textDecorationColor: "var(--accent)" }}>Learn the story</span> behind it.
        </>
      ),
      (
        <>
          A modern stage for heritage — elegant, respectful, personal.
        </>
      ),
    ],
    [],
  )

  return (
    <section ref={ref} className="relative bg-white py-28 md:py-36">
      <div className="mx-auto max-w-5xl px-4 md:px-6" style={{ perspective: "1200px" }}>
        <h3 className="text-center font-[var(--font-serif)] text-[15vw] md:text-8xl lg:text-9xl tracking-tight text-black mb-12 select-none leading-[0.9]">
          <span className="italic">Stories</span> of
          {" "}
          <span
            className="underline decoration-4 underline-offset-[12px] italic text-[color:var(--accent)]"
            style={{ textDecorationColor: "var(--accent)" }}
          >
            Style
          </span>
        </h3>
        <div className="space-y-6 md:space-y-8">
          {lines.map((content, i) => {
            const t0 = i / (lines.length + 1)
            const t1 = (i + 1) / (lines.length + 1)
            // Fade in quickly and then stay visible (no fade out)
            const opacity = useTransform(scrollYProgress, [t0, t0 + 0.12], [0, 1])
            const y = useTransform(scrollYProgress, [t0, t1], [14, 0])
            const rotateX = useTransform(scrollYProgress, [t0, t1], [5, 0])
            return (
              <motion.p
                key={i}
                style={{ opacity, y, rotateX }}
                className="text-2xl md:text-4xl lg:text-5xl leading-tight font-[var(--font-serif)] text-black"
              >
                {content}
              </motion.p>
            )
          })}
        </div>
      </div>
    </section>
  )
}
