export async function generateTryOn(params: {
  avatar?: File | null
  clothing: File
  background?: File | null
  options?: Record<string, string>
}): Promise<{ imageBase64?: string; resultUrl?: string }> {
  const form = new FormData()
  if (params.avatar) form.append("avatar", params.avatar)
  form.append("clothing", params.clothing)
  if (params.background) form.append("background", params.background)
  if (params.options) {
    for (const [k, v] of Object.entries(params.options)) form.append(k, v)
  }

  const resp = await fetch("/api/try-on", { method: "POST", body: form })
  if (!resp.ok) {
    const text = await resp.text()
    // Browser-side log for quick diagnosis
    console.warn("Try-on request failed", resp.status, text)
    throw new Error(`Try-on failed: ${resp.status} ${text}`)
  }
  return resp.json()
}


