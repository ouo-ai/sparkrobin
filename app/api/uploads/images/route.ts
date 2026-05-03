import { NextRequest, NextResponse } from "next/server"

import { ApimartRequestError, uploadApimartImage } from "@/lib/apimart"

const MAX_IMAGE_BYTES = 20 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

interface UploadResponse {
  url: string
  filename?: string
  contentType?: string
  bytes?: number
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return Boolean(
    value &&
      typeof value === "object" &&
      "arrayBuffer" in value &&
      "size" in value &&
      "type" in value &&
      "name" in value,
  )
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse | { error: string }>> {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!isUploadFile(file) || file.size === 0) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 })
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Upload a JPG, PNG, WebP, or GIF image" }, { status: 400 })
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image must be 20MB or smaller" }, { status: 413 })
    }

    const upload = await uploadApimartImage(file)

    return NextResponse.json(upload)
  } catch (error) {
    const statusCode = error instanceof ApimartRequestError ? error.statusCode : 400
    const errorMessage = error instanceof Error ? error.message : "Image upload failed"

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode >= 400 && statusCode < 500 ? statusCode : 502 },
    )
  }
}
