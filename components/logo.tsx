"use client"

export function BrandMark({ size = 28, onDark = false }: { size?: number; onDark?: boolean }) {
  // Circular monogram with a stylized T to match the cloned aesthetic
  return (
    <div
      className="relative grid place-items-center rounded-full"
      style={{
        width: size + 16,
        height: size + 16,
        border: `1px solid ${onDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}`,
      }}
      aria-hidden
    >
      <div
        className={onDark ? "font-[var(--font-serif)] text-white" : "font-[var(--font-serif)] text-black"}
        style={{ fontSize: size }}
      >
        T
      </div>
      {/* subtle accent stroke */}
      <div
        className="absolute"
        style={{
          width: size / 2,
          height: 1,
          backgroundColor: onDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
          transform: "rotate(-18deg)",
          top: "40%",
        }}
      />
    </div>
  )
}

export function BrandLockup() {
  return (
    <div className="flex flex-col items-center -space-y-1 select-none">
      <BrandMark />
      <div className="font-[var(--font-serif)] text-2xl tracking-wide">Tribalyn</div>
    </div>
  )
}
