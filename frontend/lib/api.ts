// API types and exports for admin components
// This file provides compatibility for admin components that import from @/lib/api

export interface BackendFile {
  id: string
  name: string
  url: string
  type: 'pdf' | 'audio' | 'image' | 'musescore'
  size?: number
  uploadedAt?: string
}

// Re-export SheetMusic API for convenience
export { sheetMusicAPI, type SheetMusicEvent, type SheetMusicVersion, type SheetMusicRepertoire } from './sheetmusic-api'
