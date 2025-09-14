export interface UploadedFile {
  id: string
  name: string
  type: "pdf"
  url: string
  scoreType: string // Melodía, Acompañamiento, Bajo
  tuning: string // Bb, Eb, C, C clave de Fa
  part: string
  themeId: string
}

export interface Theme {
  id: string
  title: string
  artist: string
  image: string
  key: string
  tempo: string
  structure: string
  description: string
  audioUrl?: string // Audio único del tema
  files: UploadedFile[] // Solo PDFs
}

// Simulated storage - in production this would be a database
const themes: Theme[] = [
  {
    id: "1",
    title: "Misirlou",
    artist: "Dick Dale",
    image: "/images/misirlou.png",
    key: "E Harmonic Minor",
    tempo: "140 BPM",
    structure: "Intro - A - B - A - Solo - A - B - Outro",
    description:
      "Un clásico del surf rock con influencias griegas y del medio oriente. Perfecto para jam sessions energéticas.",
    files: [],
  },
  {
    id: "2",
    title: "Coco",
    artist: "Pixar",
    image: "/images/coco.png",
    key: "C Major",
    tempo: "120 BPM",
    structure: "Verse - Chorus - Verse - Chorus - Bridge - Chorus",
    description: "Tema emotivo de la película de Pixar, ideal para explorar dinámicas y expresión musical.",
    files: [],
  },
  {
    id: "3",
    title: "Korobeiniki",
    artist: "Traditional Russian",
    image: "/images/korobeiniki.png",
    key: "A Minor",
    tempo: "130 BPM",
    structure: "A - B - A - C - A - B - A",
    description: "Melodía tradicional rusa popularizada por Tetris. Excelente para trabajar escalas menores.",
    files: [],
  },
  {
    id: "4",
    title: "One Step Beyond",
    artist: "Madness",
    image: "/images/one-step-beyond.png",
    key: "F Major",
    tempo: "180 BPM",
    structure: "Intro - A - B - A - B - Solo - A - B - Outro",
    description:
      "Clásico del ska británico con sección de vientos prominente. Perfecto para jam sessions de alta energía.",
    files: [],
  },
]

export const getThemes = (): Theme[] => {
  return themes
}

export const addTheme = (theme: Omit<Theme, "id">): Theme => {
  const newTheme: Theme = {
    ...theme,
    id: Date.now().toString(),
  }
  themes.push(newTheme)
  return newTheme
}

export function updateThemeAudio(themeId: string, audioUrl: string): Theme | null {
  const theme = themes.find((t) => t.id === themeId)
  if (theme) {
    theme.audioUrl = audioUrl
    return theme
  }
  return null
}

export function updateTheme(themeId: string, updates: Partial<Omit<Theme, 'id' | 'files'>>): Theme | null {
  const theme = themes.find((t) => t.id === themeId)
  if (theme) {
    Object.assign(theme, updates)
    return theme
  }
  return null
}

export function deleteTheme(themeId: string): boolean {
  const index = themes.findIndex((t) => t.id === themeId)
  if (index !== -1) {
    themes.splice(index, 1)
    return true
  }
  return false
}

export function addFileToTheme(themeId: string, file: Omit<UploadedFile, "id" | "themeId">): UploadedFile {
  const newFile: UploadedFile = {
    ...file,
    id: Date.now().toString(),
    themeId,
  }

  const theme = themes.find((t) => t.id === themeId)
  if (theme) {
    theme.files.push(newFile)
  }

  return newFile
}

export const getFilesByTheme = (themeId: string): UploadedFile[] => {
  const theme = themes.find((t) => t.id === themeId)
  if (!theme) return []

  return theme.files // Solo PDFs
}
