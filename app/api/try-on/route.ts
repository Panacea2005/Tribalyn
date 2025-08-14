export const runtime = 'nodejs'
import { NextResponse } from "next/server"
import { postTryOn } from "@/server/clients/vton"

// POST /api/try-on
// Expects multipart/form-data with fields: avatar (File), clothing (File), background (File, optional)
// Proxies to RapidAPI VTON-D /try-on-file and returns { imageBase64 }
export async function POST(req: Request) {
  try {
    const inForm = await req.formData()
    const avatar = (inForm.get("avatar") as unknown as File | null) || null
    const clothing = inForm.get("clothing") as unknown as File | null
    const background = inForm.get("background") as unknown as File | null
    const backgroundUrl = inForm.get("background_url") as string | null

    if (!clothing) {
      return NextResponse.json({ error: "Missing required file: clothing" }, { status: 400 })
    }

    const rapidKey = process.env.RAPIDAPI_KEY
    if (!rapidKey) {
      return NextResponse.json({ error: "Server missing RAPIDAPI_KEY" }, { status: 500 })
    }

    // Build options if provided
    const options: Record<string, string> = {}
    for (const key of ["clothing_prompt", "avatar_sex", "avatar_prompt", "background_prompt", "seed"]) {
      const v = inForm.get(key)
      if (typeof v === "string") options[key] = v
    }

    let bgFile: File | null = background
    if (!bgFile && backgroundUrl) {
      try {
        const res = await fetch(backgroundUrl)
        if (res.ok) {
          const blob = await res.blob()
          bgFile = new File([blob], "background.jpg", { type: blob.type || "image/jpeg" })
        }
      } catch {}
    }

    const { imageBase64, resultUrl } = await postTryOn({
      avatar: avatar ?? undefined,
      clothing,
      background: bgFile || undefined,
      options: options || undefined,
      rapidApiKey: rapidKey,
    })
    return NextResponse.json({ imageBase64, resultUrl })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("/api/try-on error", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


