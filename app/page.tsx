"use client"

import { useEffect, useRef, useState } from "react"

import { Header } from "@/components/header"
import { HeroScroll } from "@/components/hero-scroll"
import { DiscoverCarousel } from "@/components/section-cards"
import { WhyTribalyn } from "@/components/why-tribalyn"
import { Ambassadors } from "@/components/ambassadors"
import { ContactFooter } from "@/components/contact-footer"
import { TryOnShowcase } from "@/components/tryon-showcase"
import { EthnicMosaic } from "@/components/ethnic-mosaic"
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
            <h2 className="text-3xl md:text-5xl lg:text-6xl tracking-tight leading-[1.1]">
              {"Tribalyn brings Vietnam's heritage to life"}
            </h2>
            <p className="mt-5 text-muted-foreground text-base md:text-lg font-[var(--font-sans)]">
              {"Try on traditional costumes from all 54 ethnic groups — virtually, beautifully, instantly."}
            </p>
          </div>
        </section>
        <DiscoverCarousel />
        <WhyTribalyn />
        <TryOnShowcase />
        <EthnicMosaic />
        <JournalEditorial />
        <Ambassadors />
        <ContactFooter />
    </main>
  )
}
