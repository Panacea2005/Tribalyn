"use client"

import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export function TryOnShowcase() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const floatUp = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"])
  const floatDown = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"])
  const rotate = useTransform(scrollYProgress, [0, 1], ["-4deg", "4deg"])

  return (
    <section ref={ref} className="relative bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="font-[var(--font-serif)] text-4xl md:text-6xl leading-[1.05]">Virtual try‑on, authentic detail</h3>
            <p className="mt-4 text-neutral-700 font-[var(--font-sans)]">
              Upload a photo and dress in Vietnam’s ethnic costumes with realistic drape and layering. Share looks and
              learn the stories behind them.
            </p>
          </div>

          <div className="relative h-[520px]">
            {/* Phone mock */}
            <motion.div
              style={{ y: floatUp, rotate }}
              className="absolute left-1/2 -translate-x-1/2 top-6 w-[260px] h-[520px] rounded-[36px] border border-black/10 bg-white shadow-2xl overflow-hidden"
            >
              <Image
                src="/placeholder.svg?height=1000&width=600"
                alt="Try-on preview"
                width={600}
                height={1000}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Floating parallax images */}
            <motion.div style={{ y: floatDown }} className="absolute -left-6 bottom-6 w-48 rounded-xl overflow-hidden">
              <Image
                src="/placeholder.svg?height=600&width=480"
                alt="Fabric detail"
                width={480}
                height={600}
                className="w-full h-auto object-cover"
              />
            </motion.div>
            <motion.div style={{ y: floatUp }} className="absolute -right-4 top-10 w-56 rounded-xl overflow-hidden">
              <Image
                src="/placeholder.svg?height=600&width=480"
                alt="Headdress"
                width={480}
                height={600}
                className="w-full h-auto object-cover"
              />
            </motion.div>
            <motion.div
              style={{ y: floatDown }}
              className="absolute right-14 bottom-10 w-40 rounded-xl overflow-hidden"
            >
              <Image
                src="/placeholder.svg?height=600&width=480"
                alt="Ornament"
                width={480}
                height={600}
                className="w-full h-auto object-cover"
              />
            </motion.div>
            <div
              className="absolute left-[55%] top-[48%] -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
              style={{ backgroundColor: "var(--accent)" }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
