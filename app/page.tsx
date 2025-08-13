"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

import { Header } from "@/components/header"
import { HeroScroll } from "@/components/hero-scroll"
import { DiscoverCarousel } from "@/components/section-cards"
import { WhyTribalyn } from "@/components/why-tribalyn"
import { OurOutstandingTeam } from "@/components/our-outstanding-team"
import { ContactFooter } from "@/components/contact-footer"
import { HowItWorks } from "@/components/how-it-works"
import { JournalEditorial } from "@/components/journal-editorial"
import { CustomCursor } from "@/components/custom-cursor"

export default function Page() {
  const [muted, setMuted] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", "#a4161a")
  }, [])

  useEffect(() => {
    // Create audio element on mount (home only)
    const audio = new Audio("/audio/background-music.mp3")
    audio.loop = true
    audio.volume = 0.4
    audio.muted = muted
    audioRef.current = audio
    // Autoplay policies may block; only play if not muted
    if (!muted) audio.play().catch(() => {})
    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.muted = muted
    if (muted) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(() => {})
    }
  }, [muted])

  return (
    <main>
      <CustomCursor />
      {/* Ambient music toggle (discreet) */}
      <button
        aria-label={muted ? "Enable background music" : "Disable background music"}
        onClick={() => setMuted((m) => !m)}
        className="fixed z-40 right-4 bottom-4 md:right-6 md:bottom-6 h-10 px-3 rounded-full border bg-white/85 backdrop-blur text-sm font-[var(--font-sans)] hover:bg-white/95"
      >
        {muted ? "Sound: Off" : "Sound: On"}
      </button>
        <Header />
        <HeroScroll />
        <section className="relative bg-white">
          <div className="mx-auto max-w-6xl px-4 md:px-6 py-24 md:py-32 text-center">
            <h2 className="font-playfair text-3xl md:text-5xl lg:text-6xl tracking-tight leading-[1.1]">
              Tribalyn brings
              <span className="mx-2 text-[color:var(--accent)] underline decoration-2 underline-offset-8">Vietnam</span>
              &
              <span className="mx-2 text-[color:var(--accent)] underline decoration-2 underline-offset-8">world costumes</span>
              to life
            </h2>
            <p className="mt-5 text-base md:text-lg font-[var(--font-sans)] text-neutral-700">
              Try on <em className="italic">Áo dài</em>, <em className="italic">Qipao</em>, <em className="italic">Hanfu</em>,
              <em className="italic"> Dirndl</em>, <em className="italic">Lederhosen</em>, <em className="italic">Chut Thai </em>
              and more — virtually, beautifully, instantly.
            </p>
            <div className="mt-8 inline-flex items-center">
              <Link
                href="/try-on"
                className="inline-flex items-center h-11 px-6 rounded-full bg-[color:var(--accent)] text-white font-[var(--font-sans)] hover:opacity-95"
              >
                Start Try‑On
              </Link>
            </div>
          </div>
        </section>
        <DiscoverCarousel />
        <WhyTribalyn />
        <HowItWorks />
        <JournalEditorial />
        <OurOutstandingTeam />
        <ContactFooter />
    </main>
  )
}
