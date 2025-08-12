"use client"

import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export function WhyTribalyn() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"])
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "10%"])

  return (
    <section ref={ref} className="relative bg-white py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="relative">
          {/* Images behind the headline */}
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            <motion.div style={{ y: y1 }}>
              <Image
                src="/placeholder.svg?height=800&width=640"
                alt="Inspiration"
                width={640}
                height={800}
                className="w-full h-auto rounded-lg"
              />
            </motion.div>
            <motion.div style={{ y: y2 }}>
              <Image
                src="/placeholder.svg?height=800&width=640"
                alt="Inspiration"
                width={640}
                height={800}
                className="w-full h-auto rounded-lg"
              />
            </motion.div>
            <motion.div style={{ y: y1 }}>
              <Image
                src="/placeholder.svg?height=800&width=640"
                alt="Inspiration"
                width={640}
                height={800}
                className="w-full h-auto rounded-lg"
              />
            </motion.div>
          </div>

          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="pointer-events-none select-none absolute inset-x-0 -top-10 md:-top-16 lg:-top-24 text-center font-[var(--font-serif)] text-[16vw] leading-[0.9] tracking-tight text-black/90"
          >
            <span className="block">Why</span>
            <span className="block">Tribalyn?</span>
          </motion.h3>
        </div>

        {/* Reasons */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 font-[var(--font-sans)]">
          {[
            "Because heritage deserves a modern stage.",
            "Because virtual try‑on makes culture feel personal.",
            "Because every stitch tells a story worth sharing.",
          ].map((t, i) => (
            <div key={i} className="grid gap-3">
              <div className="text-sm tracking-widest text-neutral-800">{String(i + 1).padStart(2, "0")}/</div>
              <p className="text-neutral-700">{t}</p>
            </div>
          ))}
        </div>

        {/* Scrolling marquee-like big words */}
        <div className="mt-24 overflow-hidden border-t border-neutral-200 pt-8">
          <div className="relative text-[9vw] leading-none font-[var(--font-serif)] whitespace-nowrap">
            <Marquee text="HANOI — SAPA — HUE — HỘI AN — SÀI GÒN — CRAFT — CULTURE — STYLE — " />
          </div>
        </div>
      </div>
    </section>
  )
}

function Marquee({ text = "" }) {
  return (
    <div className="relative overflow-hidden">
      <div className="animate-[marquee_24s_linear_infinite] will-change-transform">
        <span>{text}</span>
        <span aria-hidden="true">{text}</span>
      </div>
      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}
