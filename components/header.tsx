"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { FullscreenNav } from "./fullscreen-nav"

export function Header({ transparent = false }: { transparent?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showBar, setShowBar] = useState(true)
  const [showCircle, setShowCircle] = useState(false)
  const lastY = useRef(0)
  const pathname = usePathname()

  useEffect(() => {
    lastY.current = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const goingDown = y > lastY.current + 1
      const goingUp = y < lastY.current - 1
      const atTop = y <= 8

      if (atTop) {
        setShowBar(true)
        setShowCircle(false)
      } else {
        setShowBar(false)
        if (goingUp) setShowCircle(true)
        if (goingDown) setShowCircle(false)
      }
      lastY.current = y
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : ""
  }, [menuOpen])

  return (
    <>
      {/* Desktop header shows only at top */}
      <header
        className={`hidden md:block sticky top-0 z-50 transition-transform duration-300 ${
          showBar && !menuOpen ? "translate-y-0" : "-translate-y-full"
        } ${transparent ? "bg-transparent" : "bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60"}`}
      >
        <div className="mx-auto max-w-7xl px-6 h-[92px] grid grid-cols-3 items-center">
          {/* Left nav */}
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/try-on"
              aria-current={pathname === "/try-on" ? "page" : undefined}
              className={`font-playfair transition-colors ${
                pathname?.startsWith("/try-on")
                  ? "text-[color:var(--accent)] underline underline-offset-8 decoration-2"
                  : "hover:text-[color:var(--accent)]"
              }`}
            >
              Try On
            </Link>
            <Link
              href="/collections"
              aria-current={pathname === "/collections" ? "page" : undefined}
              className={`font-playfair transition-colors ${
                pathname?.startsWith("/collections")
                  ? "text-[color:var(--accent)] underline underline-offset-8 decoration-2"
                  : "hover:text-[color:var(--accent)]"
              }`}
            >
              Collections
            </Link>
          </nav>

          {/* Center brand: image logo */}
          <div className="justify-self-center">
            <Link href="/" className="inline-block" aria-label="Tribalyn home">
              <Image src="/logo.png" alt="Tribalyn" width={280} height={70} className="h-16 w-auto md:h-18" priority />
            </Link>
          </div>

          {/* Right nav */}
          <nav className="flex justify-end items-center gap-6 text-sm">
            <Link
              href="/sign-in"
              aria-current={pathname === "/sign-in" ? "page" : undefined}
              className={`font-playfair transition-colors ${
                pathname?.startsWith("/sign-in")
                  ? "text-[color:var(--accent)] underline underline-offset-8 decoration-2"
                  : "hover:text-[color:var(--accent)]"
              }`}
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              aria-current={pathname === "/sign-up" ? "page" : undefined}
              className={`inline-flex items-center h-9 px-4 rounded-full border transition-colors font-playfair ${
                pathname?.startsWith("/sign-up")
                  ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white underline underline-offset-8 decoration-2"
                  : "border-[color:var(--accent)] text-[color:var(--accent)] hover:bg-[color:var(--accent)] hover:text-white"
              }`}
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* Circle launcher when scrolling up but not at top */}
      {showCircle && !menuOpen && (
        <button
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
          className="hidden md:grid fixed z-[80] top-5 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white border border-black/20 place-items-center"
        >
          <div className="relative w-5 h-5">
            <div className="absolute left-0 right-0 top-[35%] h-[1px] bg-black" />
            <div className="absolute left-0 right-0 bottom-[35%] h-[1px] bg-black" />
          </div>
        </button>
      )}

      {/* Mobile header: brand left, hamburger right with monogram above brand not necessary on small */}
      <header
        className={`md:hidden fixed top-0 left-0 right-0 z-50 ${
          transparent ? "bg-transparent" : "bg-white/80 backdrop-blur"
        }`}
      >
        <div className="px-4 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center" aria-label="Tribalyn home">
            <Image src="/logo.png" alt="Tribalyn" width={180} height={52} className="h-12 w-auto" />
          </Link>
          <button
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="w-11 h-11 rounded-full bg-white border border-black/20 grid place-items-center"
          >
            <div className="relative w-5 h-5">
              <div className="absolute left-0 right-0 top-[25%] h-[1px] bg-black" />
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-black" />
              <div className="absolute left-0 right-0 bottom-[25%] h-[1px] bg-black" />
            </div>
          </button>
        </div>
      </header>

      <FullscreenNav open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
