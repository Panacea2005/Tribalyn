"use client"

import Image from "next/image"
import { motion } from "framer-motion"

const tiles = new Array(8).fill(0).map((_, i) => ({
  id: i,
  img: `/placeholder.svg?height=${i % 2 === 0 ? 900 : 700}&width=${i % 3 === 0 ? 1100 : 900}`,
  title: ["Tày", "Thái", "Mường", "Kinh", "Dao", "H’Mông", "Ê Đê", "Chăm"][i],
}))

export function EthnicMosaic() {
  return (
    <section className="bg-neutral-950 text-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid md:grid-cols-[1fr,2fr] gap-10 items-end">
          <h3 className="font-[var(--font-serif)] text-4xl md:text-6xl lg:text-7xl leading-[1.05]">
            A mosaic of 54 identities
          </h3>
          <p className="text-white/80 font-[var(--font-sans)]">
            Explore groups, then use virtual try‑on to wear signature outfits. Compare patterns, colors, and jewelry in
            context.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {tiles.map((t, i) => (
            <motion.figure
              key={t.id}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.03 }}
              className="group relative overflow-hidden rounded-xl"
            >
              <Image
                src={t.img || "/placeholder.svg"}
                alt={t.title}
                width={1100}
                height={900}
                className="w-full h-64 object-cover"
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-3 text-sm bg-gradient-to-t from-black/50 to-transparent">
                <span className="font-[var(--font-serif)]">{t.title}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}
