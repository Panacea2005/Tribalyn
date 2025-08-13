"use client"

import Link from "next/link"

export function ContactFooter() {
  return (
    <footer className="bg-white pt-24 md:pt-32 pb-16 md:pb-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 text-center">
        <div className="font-playfair text-5xl md:text-7xl lg:text-8xl leading-[1.05]">
          Contact <span className="italic text-[color:var(--accent)]">with</span> Tribalyn
        </div>
        <div className="mt-8 text-[color:var(--accent)] font-[var(--font-sans)] text-xl">
          <span> · </span>
          <Link href="https://tribalyn.vercel.app" target="_blank" className="underline underline-offset-4">tribalyn.vercel.app</Link>
          <span> · </span>
        </div>

        <div className="mt-6 text-sm text-neutral-600 font-[var(--font-sans)]">
          <Link href="#" className="underline underline-offset-4">
            Instagram
          </Link>{" "}
          ·{" "}
          <Link href="#" className="underline underline-offset-4">
            Facebook
          </Link>{" "}
          ·{" "}
          <Link href="#" className="underline underline-offset-4">
            LinkedIn
          </Link>
        </div>

        <div className="mt-14 grid gap-2 text-neutral-700 font-[var(--font-sans)]">
          <div>Based in Ho Chi Minh City, Vietnam</div>
          <div className="text-xs tracking-widest uppercase text-[color:var(--accent)]">Address</div>
          <div>A35 Bach Dang Street, Ward 2, Tan Binh District, Ho Chi Minh City 730000</div>
        </div>

        <div className="mt-12 border-t border-neutral-200" />
        <div className="mt-6 text-xs text-neutral-500 font-[var(--font-sans)]">
          <Link href="#" className="underline underline-offset-4">
            Privacy Policy
          </Link>{" "}
          ·{" "}
          <Link href="#" className="underline underline-offset-4">
            Legal Notice
          </Link>{" "}
          ·{" "}
          <Link href="#" className="underline underline-offset-4">
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  )
}
