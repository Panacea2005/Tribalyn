"use client"

import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export function JournalEditorial() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const yHeadline = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"])

  return (
    <section ref={ref} className="relative bg-white py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="relative">
          <motion.h3
            style={{ y: yHeadline }}
            className="pointer-events-none select-none font-[var(--font-serif)] text-[14vw] md:text-[12vw] leading-[0.9] tracking-tight text-black/90 text-center"
          >
            Stories of Style
          </motion.h3>

          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <article className="relative rounded-xl overflow-hidden">
              <Image
                src="/placeholder.svg?height=1100&width=1400"
                alt="Feature"
                width={1400}
                height={1100}
                className="w-full h-[360px] md:h-[440px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="text-xs tracking-widest uppercase text-white/80 font-[var(--font-sans)]">
                  JOURNAL — TECH
                </div>
                <h4 className="font-[var(--font-serif)] text-2xl">How virtual try‑on learns your silhouette</h4>
              </div>
            </article>
            <article className="relative rounded-xl overflow-hidden">
              <Image
                src="/placeholder.svg?height=1100&width=1400"
                alt="Feature"
                width={1400}
                height={1100}
                className="w-full h-[360px] md:h-[440px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="text-xs tracking-widest uppercase text-white/80 font-[var(--font-sans)]">
                  HERITAGE — DESIGN
                </div>
                <h4 className="font-[var(--font-serif)] text-2xl">Decoding motifs from the highlands</h4>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}
