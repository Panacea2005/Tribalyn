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
  const yMid = useTransform(scrollYProgress, [0, 1], ["0%", "-6%"]) // first: mid
  const yLow = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]) // second: low
  const yHigh = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]) // third: high

  return (
    <section ref={ref} className="relative bg-white py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="relative">
          {/* Images behind the headline with attached content per column */}
          <div className="grid grid-cols-3 gap-4 md:gap-6 pt-56 md:pt-72 lg:pt-80">
            {/* Column 1: mid */}
            <motion.div style={{ y: yMid }} className="grid gap-2">
              <Image
                src="/home/why-tribalyn/1.jpg"
                alt="Inspiration"
                width={640}
                height={800}
                className="w-full h-auto rounded-lg"
              />
              <div className="grid gap-1 font-[var(--font-sans)]">
                <div className="text-sm tracking-widest text-neutral-800">01/</div>
                <p className="text-neutral-700">
                  Heritage deserves a modern stage — a place where anyone can step into culture and feel it come alive.
                </p>
              </div>
            </motion.div>
            {/* Column 2: low, moved further down so text stays attached */}
            <motion.div style={{ y: yLow }} className="grid gap-2 mt-12 md:mt-20">
              <Image
                src="/home/why-tribalyn/2.png"
                alt="Inspiration"
                width={640}
                height={800}
                className="w-full h-auto rounded-lg"
              />
              <div className="grid gap-1 font-[var(--font-sans)]">
                <div className="text-sm tracking-widest text-neutral-800">02/</div>
                <p className="text-neutral-700">
                  Virtual try‑on makes culture personal — dress in iconic outfits instantly and share the moment.
                </p>
              </div>
            </motion.div>
            {/* Column 3: high */}
            <motion.div style={{ y: yHigh }} className="grid gap-2">
              <Image
                src="/home/why-tribalyn/3.jpg"
                alt="Inspiration"
                width={640}
                height={800}
                className="w-full h-auto rounded-lg"
              />
              <div className="grid gap-1 font-[var(--font-sans)]">
                <div className="text-sm tracking-widest text-neutral-800">03/</div>
                <p className="text-neutral-700">
                  Every stitch tells a story — learn the meaning behind patterns, fabrics, and silhouettes.
                </p>
              </div>
            </motion.div>
          </div>

          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="pointer-events-none select-none absolute inset-x-0 -top-10 md:-top-16 lg:-top-24 text-center font-[var(--font-serif)] text-[16vw] leading-[0.9] tracking-tight text-black/90"
          >
            <span className="block">Why</span>
            <span className="block"><span className="underline decoration-2 underline-offset-8 text-[color:var(--accent)]">Tribalyn</span>?</span>
          </motion.h3>
        </div>

        {/* Reasons are attached to images above; extra spacing */}
        <div className="mt-12" />

        {/* Scrolling marquee-like big words */}
        <div className="mt-24 overflow-hidden border-t border-neutral-200 pt-8">
          <div className="relative text-[7vw] leading-none font-[var(--font-serif)] whitespace-nowrap">
            <Marquee text="VIETNAM — ITALY — CHINA — GERMANY — TAIWAN — THAILAND — PORTUGAL — " />
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
