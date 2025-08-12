"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

export function AccentRouteTransition() {
  const pathname = usePathname()
  const lastPath = useRef<string | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Only animate for non-home routes
    if (!pathname || pathname === "/") {
      lastPath.current = pathname
      return
    }
    if (lastPath.current !== pathname) {
      lastPath.current = pathname
      setShow(true)
      const t = setTimeout(() => setShow(false), 1650)
      return () => clearTimeout(t)
    }
  }, [pathname])

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key={pathname}
          initial={{ y: "-100%" }}
          animate={{ y: ["-100%", "0%", "0%", "100%"] }}
          exit={{ y: "100%" }}
          transition={{ duration: 1.6, times: [0, 0.25, 0.6, 1], ease: "easeInOut" }}
          className="fixed inset-0 z-[95] bg-[color:var(--accent)]"
        />
      ) : null}
    </AnimatePresence>
  )
}


