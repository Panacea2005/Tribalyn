"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

const items = [
  {
    tag: "Try‑On",
    region: "H’Mông",
    title: "Layer vivid brocade instantly",
    img: "/placeholder.svg?height=1200&width=900",
  },
  {
    tag: "Try‑On",
    region: "Ê Đê",
    title: "Swap patterns and jewelry",
    img: "/placeholder.svg?height=1200&width=900",
  },
  {
    tag: "Collection",
    region: "Hue",
    title: "Imperial silhouettes",
    img: "/placeholder.svg?height=1200&width=900",
  },
  {
    tag: "Learn",
    region: "Sapa",
    title: "Decode motifs and stories",
    img: "/placeholder.svg?height=1200&width=900",
  },
]

export function DiscoverCarousel() {
  return (
    <section className="relative bg-neutral-950 text-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid md:grid-cols-[1fr,2fr] gap-10 items-end">
          <motion.h3
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-[var(--font-serif)] text-4xl md:text-6xl lg:text-7xl leading-[1.05]"
          >
            <span className="block">Discover the</span>
            <span className="italic text-[color:var(--accent)]">craft</span>
            <span>{" of Vietnam’s heritage"}</span>
          </motion.h3>

          <div className="relative">
            <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mb-4">
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
                      <div className="text-xs tracking-widest uppercase font-[var(--font-sans)] text-white/80">
                        {card.tag} — {card.region}
                      </div>
                      <h4 className="mt-1 font-[var(--font-serif)] text-2xl md:text-3xl">{card.title}</h4>
                      <button className="mt-3 inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/70">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div
                      className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                      style={{ backgroundColor: "var(--accent)" }}
                    />
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
