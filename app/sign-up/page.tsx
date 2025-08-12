"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { CustomCursor } from "@/components/custom-cursor"

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-white relative">
      <CustomCursor />
      {/* Back to Home */}
      <Link
        href="/"
        className="fixed left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border px-3 py-2 bg-white/80 backdrop-blur hover:bg-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-[var(--font-sans)] text-sm">Home</span>
      </Link>

      <div className="grid md:grid-cols-10 min-h-screen">
        {/* Left 30%: Auth card with logo */}
        <div className="col-span-10 md:col-span-3 px-6 md:px-8 py-10 md:py-14 flex items-center">
          <Card className="w-full shadow-none border-0">
            <Link href="/" aria-label="Tribalyn home" className="block mb-8 mx-auto">
              <Image src="/logo.png" alt="Tribalyn" width={320} height={86} className="h-16 w-auto" />
            </Link>
            <CardHeader className="space-y-2">
              <CardTitle className="font-[var(--font-serif)] text-3xl">Create your account</CardTitle>
              <p className="text-sm text-neutral-600 font-[var(--font-sans)]">
                Join Tribalyn and try on Vietnam’s 54 ethnic costumes.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="font-[var(--font-sans)]">
                  Name
                </Label>
                <Input id="name" type="text" placeholder="Your name" className="font-[var(--font-sans)]" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="font-[var(--font-sans)]">
                  Email
                </Label>
                <Input id="email" type="email" placeholder="you@example.com" className="font-[var(--font-sans)]" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="font-[var(--font-sans)]">
                  Password
                </Label>
                <Input id="password" type="password" placeholder="••••••••" className="font-[var(--font-sans)]" />
              </div>
              <Button className="w-full bg-[color:var(--accent)] hover:bg-[color:var(--accent)]/90 text-white">
                Create account
              </Button>
              <p className="text-sm text-neutral-600 font-[var(--font-sans)]">
                Already have an account?{" "}
                <Link href="/sign-in" className="underline underline-offset-4">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right 70%: Image with vertical big type on the right */}
        <div className="col-span-10 md:col-span-7 relative overflow-hidden">
          <Image
            src="/home/sign-up/1.jpg"
            alt="Sign up background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/10" />
          {/* Accent ribbon at bottom edge for branding */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[color:var(--accent)]/80" />
          <div className="absolute inset-y-0 right-4 md:right-8 lg:right-10 grid place-items-end">
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-white/95 font-playfair drop-shadow-[0_2px_16px_rgba(0,0,0,0.35)]"
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                letterSpacing: "0.02em",
                lineHeight: 1,
                fontSize: "clamp(48px, 10vw, 120px)",
              }}
            >
              BEGIN YOUR HERITAGE
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}
