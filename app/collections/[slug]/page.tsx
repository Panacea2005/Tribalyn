"use client"

import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ArrowLeft } from "lucide-react"
import { CustomCursor } from "@/components/custom-cursor"

export default function GroupGalleryPage() {
  const { slug } = useParams<{ slug: string }>()
  const title = (slug || "").replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase())

  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"])

  const imgs = new Array(12).fill(0).map((_, i) => ({
    id: i,
    w: 1200,
    h: 900 + ((i % 3) * 100 - 100),
  }))

  return (
    <main className="min-h-screen bg-white">
      <CustomCursor />
      <section ref={ref} className="relative h-[40vh] min-h-[320px] overflow-hidden">
        <Image src="/placeholder.svg?height=1600&width=2400" alt="Hero" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/30" />
        <motion.h1
          style={{ y }}
          className="absolute inset-x-0 bottom-8 text-center text-white font-[var(--font-serif)] text-[12vw] md:text-[8vw] leading-[0.9]"
        >
          {title}
        </motion.h1>
        <Link
          href="/collections"
          className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border px-3 py-2 bg-white/80 backdrop-blur hover:bg-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-[var(--font-sans)] text-sm">Collections</span>
        </Link>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {imgs.map((it, i) => (
            <motion.div
              key={it.id}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.03 }}
              className="relative overflow-hidden rounded-xl"
            >
              <Image
                src={`/placeholder.svg?height=${it.h}&width=${it.w}`}
                alt={`${title} ${i + 1}`}
                width={it.w}
                height={it.h}
                className="w-full h-56 md:h-72 object-cover"
              />
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  )
}
