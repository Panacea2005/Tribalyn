"use client"

import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"

const items = [
  {
    tag: "Try‑On",
    region: "Vietnam",
    title: "Wear the Áo dài in seconds",
    img: "/home/section-cards/vietnam.jpg",
  },
  {
    tag: "Try‑On",
    region: "China",
    title: "Swap Qipao and Hanfu styles",
    img: "/home/section-cards/china.jpg",
  },
  {
    tag: "Try‑On",
    region: "Germany",
    title: "Dirndl, Lederhosen, folk dresses",
    img: "/home/section-cards/germany.jpg",
  },
  {
    tag: "Try‑On",
    region: "Thailand",
    title: "Chut Thai elegance",
    img: "/home/section-cards/thailand.jpg",
  },
]

export function DiscoverCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start end", "end start"] })
  // Shift cards to the left as the section scrolls into view
  const x = useTransform(scrollYProgress, [0, 1], [0, -240])
  return (
    <section className="relative bg-neutral-950 text-white py-24 md:py-32">
      <div ref={trackRef} className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid md:grid-cols-[1fr,2fr] gap-10 items-end">
          <motion.h3
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-[var(--font-serif)] text-4xl md:text-6xl lg:text-7xl leading-[1.05]"
          >
            <span className="block">Discover the</span>
            <span className="italic underline decoration-2 underline-offset-8 text-[color:var(--accent)]">craft</span>
            <span>{" of Vietnam’s heritage"}</span>
          </motion.h3>

          <div className="relative w-screen left-1/2 -translate-x-1/2">
            <div className="flex gap-6 overflow-hidden pb-4 -mb-4">
              <motion.div className="flex gap-6" style={{ x }}>
              {items.map((card, i) => (
                <motion.article
                  key={i}
                  initial={{ y: 40, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className="relative w-[78vw] sm:w-[56vw] md:w-[36vw] lg:w-[28vw] shrink-0 snap-start"
                >
                  <div className="relative rounded-xl overflow-hidden">
                    <Image
                      src={card.img || "/placeholder.svg"}
                      alt={card.title}
                      width={900}
                      height={1200}
                      className="w-full h-[72vw] sm:h-[48vw] md:h-[44vw] lg:h-[36vw] object-cover brightness-[.85]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="text-xs tracking-widest uppercase font-[var(--font-sans)] text-white/80">Try‑On — All</div>
                      <h4 className="mt-1 font-[var(--font-serif)] text-2xl md:text-3xl">{card.title}</h4>
                      <button className="mt-3 inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/70">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
