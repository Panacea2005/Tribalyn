export async function postTryOn(params: {
  avatar?: File | null
  clothing: File
  background?: File | null
  options?: Record<string, string>
  rapidApiKey: string
}): Promise<{ imageBase64?: string; resultUrl?: string }> {
  const form = new FormData()
  // Use only the documented fields
  if (params.avatar) form.append("avatar_image", params.avatar)
  form.append("clothing_image", params.clothing)
  if (params.background) form.append("background_image", params.background)
  if (params.options) {
    const allowed = new Set([
      "clothing_prompt",
      "avatar_sex",
      "avatar_prompt",
      "background_prompt",
      "seed",
    ])
    for (const [k, v] of Object.entries(params.options)) if (allowed.has(k)) form.append(k, v)
  }
  // Garment category hint (upper, lower, dress) if provided
  if (params.options?.category) {
    form.append("category", params.options.category)
  }

  if (params.options) {
    for (const [k, v] of Object.entries(params.options)) form.append(k, v)
  }

  const url = "https://try-on-diffusion.p.rapidapi.com/try-on-file"
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "X-RapidAPI-Key": params.rapidApiKey,
      "X-RapidAPI-Host": "try-on-diffusion.p.rapidapi.com",
    } as HeadersInit,
    body: form as unknown as BodyInit,
  })

  if (!resp.ok) {
    const text = await resp.text()
    // Basic server-side log for troubleshooting
    console.error("VTON-D request failed", { status: resp.status, text })
    throw new Error(`Upstream error ${resp.status}: ${text}`)
  }

  const contentType = resp.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    const data = await resp.json()
    const b64 = data.image_base64 || data.result_base64 || null
    const url = data.result_url || data.url || null
    return { imageBase64: b64 || undefined, resultUrl: url || undefined }
  }

  const blob = await resp.blob()
  const arrayBuffer = await blob.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString("base64")
  return { imageBase64: base64 }
}


