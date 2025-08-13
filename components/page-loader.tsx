"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export function PageLoader() {
  const pathname = usePathname()
  const isHome = pathname === "/"
  const [show, setShow] = useState(false)
  const [progressDone, setProgressDone] = useState(false)

  // Timings for a more gradual progress experience
  const PROGRESS_DURATION_MS = 2200
  const HIDE_AFTER_MS = PROGRESS_DURATION_MS + 800

  // Circle geometry (consistent across renders)
  const { radius, circumference, innerRadius, innerCircumference } = useMemo(() => {
    const r = 52
    const ri = r - 8
    return {
      radius: r,
      circumference: 2 * Math.PI * r,
      innerRadius: ri,
      innerCircumference: 2 * Math.PI * ri,
    }
  }, [])

  useEffect(() => {
    if (!isHome) {
      // Ensure loader is hidden on non-home pages
      setShow(false)
      setProgressDone(false)
      return
    }
    setShow(true)
    const prevOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"

    const progressTimer = setTimeout(() => setProgressDone(true), PROGRESS_DURATION_MS)
    const hideTimer = setTimeout(() => {
      setShow(false)
      document.documentElement.style.overflow = prevOverflow
    }, HIDE_AFTER_MS)

    return () => {
      clearTimeout(progressTimer)
      clearTimeout(hideTimer)
      document.documentElement.style.overflow = prevOverflow
    }
  }, [isHome])

  return (
    <AnimatePresence>
      {isHome && show ? (
        <motion.div
          key="page-loader"
          initial={{ opacity: 1, y: 0 }}
          animate={progressDone ? { y: "-100%" } : { opacity: 1, y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] grid place-items-center bg-black"
        >
          <div className="relative w-[260px] h-[260px] grid place-items-center">
            {/* Logo */}
            <img src="/logo.png" alt="Tribalyn" className="h-20 w-auto" />

            {/* Progress rings */}
            <svg
              className="absolute inset-0 m-auto rotate-[-90deg]"
              width={260}
              height={260}
              viewBox="0 0 260 260"
              aria-hidden
            >
              {/* Outer track */}
              <circle
                cx="130"
                cy="130"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="3"
              />
              {/* Inner track */}
              <circle
                cx="130"
                cy="130"
                r={innerRadius}
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="3"
              />
              {/* Outer white progress (counter‑clockwise) */}
              <motion.circle
                cx="130"
                cy="130"
                r={radius}
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference}
                transform="matrix(-1 0 0 1 260 0)"
                animate={{ strokeDashoffset: 0 }}
                transition={{ strokeDashoffset: { duration: PROGRESS_DURATION_MS / 1000, ease: "easeInOut" } }}
              />
              {/* Inner accent progress */}
              <motion.circle
                cx="130"
                cy="130"
                r={innerRadius}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={innerCircumference}
                strokeDashoffset={innerCircumference}
                animate={{ strokeDashoffset: 0 }}
                transition={{ strokeDashoffset: { duration: PROGRESS_DURATION_MS / 1000, ease: "easeInOut" } }}
              />
            </svg>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}


