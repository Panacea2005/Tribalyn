"use client"

import { useEffect, useRef, useState } from "react"

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const [hover, setHover] = useState(false)
  const [down, setDown] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.matchMedia && !window.matchMedia("(pointer: fine)").matches) return // disable on touch

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let rx = x
    let ry = y

    const onMove = (e: MouseEvent) => {
      x = e.clientX
      y = e.clientY
    }
    const onDown = () => setDown(true)
    const onUp = () => setDown(false)

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null
      if (!t) return
      const clickable = t.closest("a,button,[role='button'],input,select,textarea")
      setHover(Boolean(clickable))
    }
    const onOut = () => setHover(false)

    const loop = () => {
      rx += (x - rx) * 0.18
      ry += (y - ry) * 0.18

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${x - 3}px, ${y - 3}px)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${rx - 16}px, ${ry - 16}px)`
        ringRef.current.style.width = hover ? "36px" : "32px"
        ringRef.current.style.height = hover ? "36px" : "32px"
        ringRef.current.style.boxShadow = hover ? "0 0 0 6px rgba(164,22,26,0.06)" : "0 0 0 4px rgba(164,22,26,0.04)"
        ringRef.current.style.borderColor = down ? "var(--accent)" : "var(--accent)"
        ringRef.current.style.backgroundColor = down ? "rgba(164,22,26,0.12)" : "rgba(164,22,26,0.06)"
      }

      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    window.addEventListener("mousemove", onMove, { passive: true })
    window.addEventListener("mouseover", onOver as any, { passive: true })
    window.addEventListener("mouseout", onOut as any, { passive: true })
    window.addEventListener("mousedown", onDown)
    window.addEventListener("mouseup", onUp)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseover", onOver as any)
      window.removeEventListener("mouseout", onOut as any)
      window.removeEventListener("mousedown", onDown)
      window.removeEventListener("mouseup", onUp)
    }
  }, [])

  return (
    <>
      {/* hide default cursor on desktop */}
      <style jsx global>{`
        @media (pointer: fine) {
          html,
          body,
          a,
          button,
          input,
          select,
          textarea {
            cursor: none !important;
          }
        }
      `}</style>
      <div className="hidden md:block pointer-events-none fixed inset-0 z-[99999]">
        <div
          ref={ringRef}
          className="absolute rounded-full border"
          style={{ width: 32, height: 32, borderColor: "var(--accent)" }}
        />
        <div
          ref={dotRef}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: "var(--accent)" }}
        />
      </div>
    </>
  )
}
