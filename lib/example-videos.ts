export type ExampleVideoStyle = "cinematic" | "artistic" | "anime" | "realistic" | "minimalist"
export type ExampleVideoAspectRatio = "16:9" | "9:16" | "1:1"
export type ExampleVideoDuration = 5 | 10

export interface ExampleVideo {
  id: string
  prompt: string
  style: ExampleVideoStyle
  styleLabel: string
  duration: ExampleVideoDuration
  aspectRatio: ExampleVideoAspectRatio
}

export const EXAMPLE_VIDEOS: ExampleVideo[] = [
  {
    id: "misty-mountains",
    prompt: "A golden sunrise over misty mountains with eagles soaring",
    style: "cinematic",
    styleLabel: "Cinematic",
    duration: 5,
    aspectRatio: "16:9",
  },
  {
    id: "neon-city",
    prompt: "Cyberpunk city street at night with neon reflections on wet pavement",
    style: "artistic",
    styleLabel: "Artistic",
    duration: 10,
    aspectRatio: "16:9",
  },
  {
    id: "cherry-blossom",
    prompt: "Cherry blossom petals falling in slow motion, anime style",
    style: "anime",
    styleLabel: "Anime",
    duration: 5,
    aspectRatio: "9:16",
  },
  {
    id: "storm-cliffs",
    prompt: "Ocean waves crashing on rocky cliffs during a thunderstorm",
    style: "realistic",
    styleLabel: "Realistic",
    duration: 10,
    aspectRatio: "16:9",
  },
  {
    id: "geometric-flow",
    prompt: "Abstract geometric shapes morphing and flowing",
    style: "minimalist",
    styleLabel: "Minimalist",
    duration: 5,
    aspectRatio: "1:1",
  },
  {
    id: "winter-cabin",
    prompt: "A cozy cabin interior with fireplace and falling snow outside",
    style: "cinematic",
    styleLabel: "Cinematic",
    duration: 10,
    aspectRatio: "1:1",
  },
]

export function getExampleVideoById(id: string): ExampleVideo | undefined {
  return EXAMPLE_VIDEOS.find((example) => example.id === id)
}
