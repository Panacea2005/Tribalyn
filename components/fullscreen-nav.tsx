"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export function FullscreenNav({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const pathname = usePathname()
  const items = [
    { label: "Home", href: "/" },
    { label: "Try On", href: "/try-on" },
    { label: "Collections", href: "/collections" },
    { label: "Sign In", href: "/sign-in" },
    { label: "Sign Up", href: "/sign-up" },
  ]
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed inset-0 z-[90] bg-white"
          aria-modal="true"
          role="dialog"
        >
          {/* Close button at top right */}
          <button
            aria-label="Close menu"
            onClick={onClose}
            className="absolute right-6 md:right-8 top-6 md:top-8 w-12 h-12 md:w-14 md:h-14 rounded-full border border-black/20 grid place-items-center"
          >
            {/* X symbol */}
            <div className="relative w-5 h-5">
              <div className="absolute inset-0 rotate-45 bg-black h-[1px] top-1/2" />
              <div className="absolute inset-0 -rotate-45 bg-black h-[1px] top-1/2" />
            </div>
          </button>

          {/* Active tab dot now rendered inline with the active item */}

          {/* Brand at top center */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2">
            <Link href="/" onClick={onClose} aria-label="Tribalyn home">
              <Image src="/logo.png" alt="Tribalyn" width={240} height={60} className="h-16 w-auto" />
            </Link>
          </div>

          {/* Centered nav */}
          <div className="h-full grid place-items-center px-6">
            <nav className="text-center">
              <ul className="space-y-6">
                {items.map((item) => {
                  const isActive =
                    item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(item.href + "/")
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`inline-flex items-center gap-3 font-playfair text-4xl md:text-6xl lg:text-7xl leading-none ${
                          isActive ? "text-[color:var(--accent)]" : "text-black"
                        }`}
                      >
                        {item.label}
                        {isActive ? (
                          <span
                            aria-hidden
                            className="w-2 h-2 rounded-full bg-[color:var(--accent)]"
                          />
                        ) : null}
                      </Link>
                    </li>
                  )
                })}
              </ul>

              <div className="mt-16 text-sm text-neutral-700 font-[var(--font-sans)]">
                <Link href="#" className="underline underline-offset-4">
                  Instagram
                </Link>{" "}
                ·{" "}
                <Link href="#" className="underline underline-offset-4">
                  Facebook
                </Link>{" "}
                ·{" "}
                <Link href="#" className="underline underline-offset-4">
                  Youtube
                </Link>{" "}
                ·{" "}
                <Link href="#" className="underline underline-offset-4">
                  Linkedin
                </Link>
              </div>
            </nav>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
