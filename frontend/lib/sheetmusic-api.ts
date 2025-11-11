// SheetMusic API Client for jamdevientos.com integration

export interface SheetMusicVersion {
  id: number
  title: string
  theme_title: string
  artist: string
  tonalidad: string
  order: number
  sheet_music_count: number
  audio?: string
  image?: string
  is_visible?: boolean
}

export interface SheetMusicRepertoire {
  id: number
  name: string
  description?: string
  versions: SheetMusicVersion[]
}

export interface SheetMusicLocation {
  name: string
  address: string
  city: string
  country: string
}

export interface SheetMusicEvent {
  id: number
  title: string
  slug?: string
  event_type: 'CONCERT' | 'REHEARSAL' | 'RECORDING' | 'WORKSHOP' | 'OTHER'
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  description?: string
  start_datetime: string
  end_datetime: string
  location?: SheetMusicLocation
  location_name?: string
  location_city?: string
  repertoire?: SheetMusicRepertoire
  is_public: boolean
  price?: string
  is_upcoming?: boolean
  is_ongoing?: boolean
}

export interface CarouselResponse {
  events: SheetMusicEvent[]
  total: number
}

export class SheetMusicAPI {
  private baseURL: string

  constructor(baseURL = process.env.NEXT_PUBLIC_SHEETMUSIC_API_URL || 'http://localhost:8000') {
    this.baseURL = baseURL.replace(/\/$/, '') // Remove trailing slash
  }

  private async fetchWithErrorHandling(url: string): Promise<any> {
    try {
      console.log(`[SheetMusic API] Fetching: ${url}`)
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log(`[SheetMusic API] Response from ${url}:`, data)
      return data
    } catch (error) {
      console.error('SheetMusic API Error:', error)
      throw error
    }
  }

  /**
   * Get events for carousel display (next 10 events)
   */
  async getEventsCarousel(): Promise<CarouselResponse> {
    const url = `${this.baseURL}/api/v1/events/jamdevientos/carousel/`
    return this.fetchWithErrorHandling(url)
  }

  /**
   * Get upcoming events with full repertoires
   */
  async getUpcomingEvents(): Promise<CarouselResponse> {
    const url = `${this.baseURL}/api/v1/events/jamdevientos/upcoming/`
    return this.fetchWithErrorHandling(url)
  }

  /**
   * Get complete repertoire for specific event
   */
  async getEventRepertoire(eventId: number): Promise<SheetMusicEvent> {
    const url = `${this.baseURL}/api/v1/events/jamdevientos/${eventId}/repertoire/`
    return this.fetchWithErrorHandling(url)
  }

  /**
   * List all public events
   */
  async getEvents(): Promise<SheetMusicEvent[]> {
    const url = `${this.baseURL}/api/v1/events/jamdevientos/`
    const response = await this.fetchWithErrorHandling(url)

    // Handle both array response and object with events property
    if (Array.isArray(response)) {
      return response
    } else if (response && Array.isArray(response.events)) {
      return response.events
    } else {
      console.warn('SheetMusic API getEvents() returned unexpected format:', response)
      return []
    }
  }

  /**
   * Get event detail with repertoire
   */
  async getEventDetail(eventId: number): Promise<SheetMusicEvent> {
    const url = `${this.baseURL}/api/v1/events/jamdevientos/${eventId}/`
    return this.fetchWithErrorHandling(url)
  }

  /**
   * Get event by slug
   */
  async getEventBySlug(slug: string): Promise<SheetMusicEvent> {
    const url = `${this.baseURL}/api/v1/events/jamdevientos/by-slug/?slug=${encodeURIComponent(slug)}`
    return this.fetchWithErrorHandling(url)
  }

  /**
   * Update version visibility (admin only)
   * This requires authentication with the SheetMusic API
   */
  async updateVersionVisibility(versionId: number, isVisible: boolean): Promise<void> {
    const url = `${this.baseURL}/api/v1/versions/${versionId}/`

    try {
      console.log(`[SheetMusic API] Updating version ${versionId} visibility to ${isVisible}`)

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication headers when auth is implemented
          // 'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ is_visible: isVisible })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      console.log(`[SheetMusic API] Successfully updated version ${versionId} visibility`)
    } catch (error) {
      console.error('SheetMusic API updateVersionVisibility error:', error)
      throw error
    }
  }

  /**
   * Update version details (admin only)
   * This requires authentication with the SheetMusic API
   */
  async updateVersion(versionId: number, updates: Partial<SheetMusicVersion>): Promise<SheetMusicVersion> {
    const url = `${this.baseURL}/api/v1/versions/${versionId}/`

    try {
      console.log(`[SheetMusic API] Updating version ${versionId}:`, updates)

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication headers when auth is implemented
          // 'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const updatedVersion = await response.json()
      console.log(`[SheetMusic API] Successfully updated version ${versionId}`)
      return updatedVersion
    } catch (error) {
      console.error('SheetMusic API updateVersion error:', error)
      throw error
    }
  }

  /**
   * Upload file for a version (admin only)
   * This requires authentication with the SheetMusic API
   */
  async uploadVersionFile(versionId: number, file: File, fileType: 'image' | 'audio' | 'sheet_music', metadata?: any): Promise<any> {
    const url = `${this.baseURL}/api/v1/versions/${versionId}/files/`

    try {
      console.log(`[SheetMusic API] Uploading ${fileType} file for version ${versionId}:`, file.name)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('file_type', fileType)

      if (metadata) {
        Object.keys(metadata).forEach(key => {
          if (metadata[key] !== undefined && metadata[key] !== null) {
            formData.append(key, metadata[key])
          }
        })
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          // TODO: Add authentication headers when auth is implemented
          // 'Authorization': `Bearer ${getAuthToken()}`
          // Note: Don't set Content-Type for FormData, browser will set it with boundary
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const uploadResult = await response.json()
      console.log(`[SheetMusic API] Successfully uploaded file for version ${versionId}`)
      return uploadResult
    } catch (error) {
      console.error('SheetMusic API uploadVersionFile error:', error)
      throw error
    }
  }

  /**
   * Delete a file from a version (admin only)
   * This requires authentication with the SheetMusic API
   */
  async deleteVersionFile(versionId: number, fileId: number): Promise<void> {
    const url = `${this.baseURL}/api/v1/versions/${versionId}/files/${fileId}/`

    try {
      console.log(`[SheetMusic API] Deleting file ${fileId} from version ${versionId}`)

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          // TODO: Add authentication headers when auth is implemented
          // 'Authorization': `Bearer ${getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      console.log(`[SheetMusic API] Successfully deleted file ${fileId}`)
    } catch (error) {
      console.error('SheetMusic API deleteVersionFile error:', error)
      throw error
    }
  }

  /**
   * Generate Google Maps URL from location data
   */
  static generateMapsUrl(location?: SheetMusicLocation | null, locationName?: string, locationCity?: string): string | null {
    if (location) {
      const query = encodeURIComponent(`${location.name}, ${location.address}, ${location.city}, ${location.country}`)
      return `https://www.google.com/maps/search/?api=1&query=${query}`
    } else if (locationName && locationCity) {
      const query = encodeURIComponent(`${locationName}, ${locationCity}`)
      return `https://www.google.com/maps/search/?api=1&query=${query}`
    }
    return null
  }

  /**
   * Format event date for display
   */
  static formatEventDate(dateString: string): string {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Date formatting error:', error)
      return dateString
    }
  }
}

// Create a singleton instance for use throughout the app
export const sheetMusicAPI = new SheetMusicAPI()