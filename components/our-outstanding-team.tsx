"use client"

import Image from "next/image"
import { Play } from "lucide-react"
import { motion } from "framer-motion"

export function OurOutstandingTeam() {
  const instructor = {
    name: "Dr. Aiden Nguyen",
    role: "Instructor",
    quote:
      "Guiding our journey across culture, craft, and technology—so virtual try‑on honors the stories behind every stitch.",
    img: "/home/our-outstanding-team/aiden-1.jpg",
  }
  const students = [
    { name: "Nguyen Le Truong Thien", role: "Developer", img: "/home/our-outstanding-team/thien.jpg" },
    { name: "Phan Cong Hung", role: "Developer", img: "/home/our-outstanding-team/hung.png" },
    { name: "Truong Ngoc Huyen", role: "Developer", img: "/home/our-outstanding-team/huyen.png" },
    { name: "Tran Pham Thanh Truc", role: "Developer", img: "/home/our-outstanding-team/truc.jpg" },
  ]

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Full-bleed gradient background: black top, accent bottom spanning the whole section */}
      <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(to bottom, #000 0%, #000 45%, var(--accent) 45%, var(--accent) 100%)" }} />

      {/* Section title full width, white text with accent middle word */}
      <div className="text-center mb-12 px-4">
        <h2 className="font-playfair tracking-tight leading-none">
          <span className="block text-white text-5xl md:text-7xl">OUR</span>
          <span className="block text-[color:var(--accent)] text-5xl md:text-7xl">OUTSTANDING</span>
          <span className="block text-white text-5xl md:text-7xl">TEAM</span>
        </h2>
      </div>

      {/* Instructor feature */}
      <div className="relative w-full mb-20 grid place-items-center py-10 md:py-16">
        <div className="relative -mt-8 w-full max-w-md px-4">
          <div className="relative rounded-xl overflow-hidden shadow-2xl ring-1 ring-black/10">
            <Image
              src={instructor.img || "/placeholder.svg"}
              alt={instructor.name}
              width={900}
              height={1100}
              className="w-full aspect-[4/5] object-cover"
            />
          </div>
        </div>
        <div className="mt-6 text-center max-w-2xl px-4">
          <div className="font-playfair text-2xl text-white">{instructor.name}</div>
          <div className="text-sm text-white/90 -mt-0.5">{instructor.role}</div>
          <blockquote className="mt-5 font-playfair text-2xl md:text-3xl text-white italic">{`“${instructor.quote}”`}</blockquote>
        </div>
      </div>

      {/* Students grid in container over accent background */}
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          {students.map((p, i) => (
            <motion.article
              key={i}
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.03 }}
              className="text-center"
            >
              <div className="relative">
                <Image
                  src={p.img || "/placeholder.svg"}
                  alt={p.name}
                  width={700}
                  height={900}
                  className="w-full aspect-[4/5] object-cover rounded-lg"
                />
              </div>
              <div className="mt-4">
                <div className="font-playfair text-lg text-white">{p.name}</div>
                <div className="text-sm text-white/90 font-[var(--font-sans)]">{p.role}</div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
