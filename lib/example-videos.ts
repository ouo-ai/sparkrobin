export type ExampleVideoStyle = "cinematic" | "artistic" | "anime" | "realistic" | "minimalist"
export type ExampleVideoAspectRatio = "16:9" | "9:16"
export type ExampleVideoDuration = 4 | 8

export interface ExampleVideo {
  id: string
  prompt: string
  style: ExampleVideoStyle
  styleLabel: string
  duration: ExampleVideoDuration
  aspectRatio: ExampleVideoAspectRatio
  videoSrc: string
  posterSrc: string
}

export const EXAMPLE_VIDEOS: ExampleVideo[] = [
  {
    id: "misty-mountains",
    prompt: "A golden sunrise over misty mountains with eagles soaring",
    style: "cinematic",
    styleLabel: "Cinematic",
    duration: 4,
    aspectRatio: "16:9",
    videoSrc: "/videos/examples/misty-mountains.mp4",
    posterSrc: "/videos/examples/posters/misty-mountains.jpg",
  },
  {
    id: "neon-city",
    prompt: "Cyberpunk city street at night with neon reflections on wet pavement",
    style: "artistic",
    styleLabel: "Artistic",
    duration: 8,
    aspectRatio: "16:9",
    videoSrc: "/videos/examples/neon-city.mp4",
    posterSrc: "/videos/examples/posters/neon-city.jpg",
  },
  {
    id: "cherry-blossom",
    prompt: "Cherry blossom petals falling in slow motion, anime style",
    style: "anime",
    styleLabel: "Anime",
    duration: 4,
    aspectRatio: "9:16",
    videoSrc: "/videos/examples/cherry-blossom.mp4",
    posterSrc: "/videos/examples/posters/cherry-blossom.jpg",
  },
  {
    id: "storm-cliffs",
    prompt: "Ocean waves crashing on rocky cliffs during a thunderstorm",
    style: "realistic",
    styleLabel: "Realistic",
    duration: 8,
    aspectRatio: "16:9",
    videoSrc: "/videos/examples/storm-cliffs.mp4",
    posterSrc: "/videos/examples/posters/storm-cliffs.jpg",
  },
  {
    id: "geometric-flow",
    prompt: "Abstract geometric shapes morphing and flowing",
    style: "minimalist",
    styleLabel: "Minimalist",
    duration: 4,
    aspectRatio: "16:9",
    videoSrc: "/videos/examples/geometric-flow.mp4",
    posterSrc: "/videos/examples/posters/geometric-flow.jpg",
  },
  {
    id: "winter-cabin",
    prompt: "A cozy cabin interior with fireplace and falling snow outside",
    style: "cinematic",
    styleLabel: "Cinematic",
    duration: 8,
    aspectRatio: "9:16",
    videoSrc: "/videos/examples/winter-cabin.mp4",
    posterSrc: "/videos/examples/posters/winter-cabin.jpg",
  },
]
