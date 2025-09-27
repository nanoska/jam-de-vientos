/**
 * Adapter to make the FileUpload component work with SheetMusic API
 * This bridges the local API service interface with SheetMusic API calls
 */

import { sheetMusicAPI } from './sheetmusic-api'
import type { BackendFile } from './api'

export interface SheetMusicUploadMetadata {
  score_type?: string
  tuning?: string
  part?: string
}

export class SheetMusicUploadAdapter {
  /**
   * Upload a file to a SheetMusic version
   * Adapts the local API interface to SheetMusic API calls
   */
  async uploadFile(
    versionId: string,
    file: File,
    metadata?: SheetMusicUploadMetadata
  ): Promise<BackendFile> {
    try {
      // Determine file type based on MIME type
      let fileType: 'image' | 'audio' | 'sheet_music'

      if (file.type.startsWith('image/')) {
        fileType = 'image'
      } else if (file.type.startsWith('audio/')) {
        fileType = 'audio'
      } else if (file.type === 'application/pdf') {
        fileType = 'sheet_music'
      } else {
        // Default fallback based on extension
        const extension = file.name.toLowerCase().split('.').pop()
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension || '')) {
          fileType = 'image'
        } else if (['mp3', 'wav', 'm4a', 'ogg', 'aac', 'flac'].includes(extension || '')) {
          fileType = 'audio'
        } else {
          fileType = 'sheet_music'
        }
      }

      // Upload to SheetMusic API
      const result = await sheetMusicAPI.uploadVersionFile(
        parseInt(versionId),
        file,
        fileType,
        metadata
      )

      // Adapt the response to match the BackendFile interface
      const adaptedResult: BackendFile = {
        id: result.id || Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: fileType === 'sheet_music' ? 'pdf' : fileType,
        url: result.url || result.file_url || '',
        theme_id: versionId,
        score_type: metadata?.score_type,
        tuning: metadata?.tuning,
        part: metadata?.part,
        // Add any additional fields from the SheetMusic API response
        ...result
      }

      return adaptedResult
    } catch (error) {
      console.error('SheetMusic upload adapter error:', error)
      throw error
    }
  }

  /**
   * Get files for a version (if needed)
   * This could be implemented if the SheetMusic API provides a file listing endpoint
   */
  async getVersionFiles(versionId: string): Promise<BackendFile[]> {
    // This would need to be implemented based on SheetMusic API endpoints
    // For now, return empty array as files are typically shown in the version data
    console.log(`[SheetMusic Adapter] Getting files for version ${versionId}`)
    return []
  }

  /**
   * Delete a file from a version
   */
  async deleteFile(versionId: string, fileId: string): Promise<boolean> {
    try {
      await sheetMusicAPI.deleteVersionFile(parseInt(versionId), parseInt(fileId))
      return true
    } catch (error) {
      console.error('SheetMusic delete file adapter error:', error)
      return false
    }
  }
}

// Create a singleton instance
export const sheetMusicUploadAdapter = new SheetMusicUploadAdapter()