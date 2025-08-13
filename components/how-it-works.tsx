"use client"

import { motion } from "framer-motion"

export function HowItWorks() {
  const steps = [
    {
      k: "01/",
      title: "Upload or Selfie",
      body: "Use a selfie or upload a portrait (front‑facing). No account required.",
    },
    {
      k: "02/",
      title: "Pick a Costume",
      body: "Choose Áo dài or world outfits (Qipao, Hanfu, Dirndl, Chut Thai…).",
    },
    {
      k: "03/",
      title: "Share & Learn",
      body: "Download your look and read short notes about patterns and heritage.",
    },
  ]

  return (
    <section className="bg-white text-black py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid md:grid-cols-[1fr,1.4fr] gap-8 items-end">
          <h3 className="font-[var(--font-serif)] text-4xl md:text-6xl leading-[1.05]">
            How it <span className="underline decoration-2 underline-offset-8 text-[color:var(--accent)]">works</span>
          </h3>
          <p className="font-[var(--font-sans)] text-neutral-700">
            A smooth try‑on flow with helpful hints. Built on a simple, elegant palette of accent, white, and black.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.k}
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              whileInView={{ y: 0, opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
              className="relative rounded-2xl border border-[color:var(--accent)]/30 bg-white p-6 overflow-hidden"
            >
              <div className="text-sm tracking-widest text-neutral-800 font-[var(--font-sans)]">{s.k}</div>
              <div className="mt-2 font-[var(--font-serif)] text-2xl">{s.title}</div>
              <p className="mt-2 text-neutral-700 font-[var(--font-sans)]">{s.body}</p>
              {/* Accent sweep */}
              <motion.div
                className="absolute inset-0 bg-[color:var(--accent)]/6"
                initial={{ x: "-100%" }}
                whileInView={{ x: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.8, delay: 0.15 * (i + 1), ease: "easeOut" }}
              />
              {/* Accent dot */}
              <div className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-[color:var(--accent)]/90" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
