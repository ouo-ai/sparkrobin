import { NextRequest, NextResponse } from 'next/server'

interface GenerateRequest {
  prompt: string
  style?: string
  aspectRatio?: string
  duration?: number
}

interface GenerateResponse {
  id: string
  status: 'demo' | 'processing' | 'completed' | 'error'
  prompt: string
  style: string
  duration: number
  aspectRatio: string
  estimatedSeconds: number
  previewTitle: string
  frames: number
  message: string
  demoMode: boolean
}

// Deterministic hash function for consistent demo results
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export async function POST(request: NextRequest): Promise<NextResponse<GenerateResponse | { error: string }>> {
  try {
    const body: GenerateRequest = await request.json()
    
    const { prompt, style = 'cinematic', aspectRatio = '16:9', duration = 4 } = body

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    if (prompt.trim().length < 3) {
      return NextResponse.json(
        { error: 'Prompt must be at least 3 characters long' },
        { status: 400 }
      )
    }

    if (prompt.length > 500) {
      return NextResponse.json(
        { error: 'Prompt must be 500 characters or less' },
        { status: 400 }
      )
    }

    // Validate duration
    const validDurations = [2, 4, 6, 8]
    const validatedDuration = validDurations.includes(duration) ? duration : 4

    // Validate aspect ratio
    const validAspectRatios = ['16:9', '9:16', '1:1', '4:3']
    const validatedAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : '16:9'

    // Validate style
    const validStyles = ['cinematic', 'anime', 'realistic', 'artistic', 'minimalist']
    const validatedStyle = validStyles.includes(style) ? style : 'cinematic'

    // Generate deterministic demo response based on prompt hash
    const promptHash = hashString(prompt.trim().toLowerCase())
    const id = `demo_${promptHash.toString(36)}_${Date.now().toString(36)}`
    
    // Calculate frames based on duration (24fps)
    const frames = validatedDuration * 24

    // Generate preview title from prompt
    const previewTitle = prompt.trim().length > 50 
      ? `${prompt.trim().substring(0, 47)}...` 
      : prompt.trim()

    // Estimated generation time (demo mode shows instant)
    const estimatedSeconds = Math.ceil(validatedDuration * 2.5)

    const response: GenerateResponse = {
      id,
      status: 'demo',
      prompt: prompt.trim(),
      style: validatedStyle,
      duration: validatedDuration,
      aspectRatio: validatedAspectRatio,
      estimatedSeconds,
      previewTitle,
      frames,
      message: 'This is a demo preview. Connect a video generation provider to create real AI videos.',
      demoMode: true,
    }

    return NextResponse.json(response)
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

export async function GET(): Promise<NextResponse<{ message: string; endpoints: { POST: string } }>> {
  return NextResponse.json({
    message: 'Spark Robin AI Video Generator API',
    endpoints: {
      POST: 'Generate a demo video response with prompt, style, aspectRatio, and duration',
    },
  })
}
