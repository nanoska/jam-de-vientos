"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Volume2, Image, X, Check, AlertCircle } from "lucide-react"
import { sheetMusicUploadAdapter, type SheetMusicUploadMetadata } from "@/lib/sheetmusic-upload-adapter"
import type { BackendFile } from "@/lib/api"

interface SheetMusicFileUploadProps {
  versionId: string
  onUploadComplete?: (files: BackendFile[]) => void
}

interface FileWithProgress extends Partial<BackendFile> {
  id: string
  name: string
  type: 'image' | 'pdf' | 'audio'
  status: "pending" | "uploading" | "completed" | "error"
  progress: number
  file?: File
  error?: string
  // Metadata for PDFs
  score_type?: string
  tuning?: string
  part?: string
}

const scoreTypeOptions = [
  { value: "Melodía", label: "Melodía Principal" },
  { value: "Armonía", label: "Armonía/Contrapunto" },
  { value: "Bajo", label: "Línea de Bajo" },
]

const tuningOptions = [
  { value: "Bb", label: "Bb (Trompeta, Tenor Sax, Clarinete)" },
  { value: "Eb", label: "Eb (Alto Sax, Barítono)" },
  { value: "C", label: "C (Flauta, Oboe)" },
  { value: "F", label: "F (Corno)" },
  { value: "Clave de Fa", label: "Clave de Fa (Trombón, Tuba, Fagot)" },
]

export function SheetMusicFileUpload({ versionId, onUploadComplete }: SheetMusicFileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileWithProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedScoreType, setSelectedScoreType] = useState<string>("")
  const [selectedTuning, setSelectedTuning] = useState<string>("")
  const [pendingFiles, setPendingFiles] = useState<FileWithProgress[]>([])

  const getFileType = (file: File): 'image' | 'pdf' | 'audio' => {
    const mimeType = file.type.toLowerCase()
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType === 'application/pdf') return 'pdf'
    if (mimeType.startsWith('audio/')) return 'audio'

    // Fallback to extension
    const extension = file.name.toLowerCase().split('.').pop()
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension || '')) return 'image'
    if (extension === 'pdf') return 'pdf'
    if (['mp3', 'wav', 'm4a', 'ogg', 'aac', 'flac'].includes(extension || '')) return 'audio'

    return 'pdf' // Default fallback
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: FileWithProgress[] = acceptedFiles.map((file) => {
        const fileType = getFileType(file)

        return {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: fileType,
          url: "", // Will be set after upload
          score_type: fileType === 'pdf' ? (selectedScoreType || getScoreTypeFromFileName(file.name) || "Melodía") : undefined,
          tuning: fileType === 'pdf' ? (selectedTuning || getTuningFromFileName(file.name) || "C") : undefined,
          part: fileType === 'pdf' ? (getPartFromFileName(file.name) || "Melodía") : undefined,
          theme_id: versionId,
          status: "pending",
          progress: 0,
          file,
        }
      })

      setPendingFiles((prev) => [...prev, ...newFiles])
    },
    [selectedScoreType, selectedTuning, versionId],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"],
      "audio/*": [".mp3", ".wav", ".m4a", ".ogg", ".aac", ".flac"],
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB max
  })

  const uploadFile = async (fileData: FileWithProgress) => {
    if (!fileData.file) return

    try {
      // Update progress to show upload starting
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === fileData.id ? { ...file, progress: 10 } : file
        )
      )

      const metadata: SheetMusicUploadMetadata = {}
      if (fileData.type === 'pdf') {
        if (fileData.score_type) metadata.score_type = fileData.score_type
        if (fileData.tuning) metadata.tuning = fileData.tuning
        if (fileData.part) metadata.part = fileData.part
      }

      // Simulate progress during upload
      const progressInterval = setInterval(() => {
        setUploadedFiles((prev) =>
          prev.map((file) => {
            if (file.id === fileData.id && file.progress < 90) {
              return { ...file, progress: file.progress + Math.random() * 20 }
            }
            return file
          })
        )
      }, 500)

      const uploadedFile = await sheetMusicUploadAdapter.uploadFile(versionId, fileData.file, metadata)

      clearInterval(progressInterval)

      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === fileData.id
            ? {
                ...file,
                ...uploadedFile,
                status: "completed",
                progress: 100,
                url: uploadedFile.url
              }
            : file,
        ),
      )

      console.log("File uploaded successfully to SheetMusic API:", uploadedFile)

    } catch (error) {
      console.error("SheetMusic upload failed:", error)
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'

      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === fileData.id
            ? { ...file, status: "error", error: errorMessage }
            : file,
        ),
      )
    }
  }

  const getScoreTypeFromFileName = (fileName: string): string | undefined => {
    const name = fileName.toLowerCase()
    if (name.includes("melody") || name.includes("melodia")) return "Melodía"
    if (name.includes("accomp") || name.includes("acompañ")) return "Acompañamiento"
    if (name.includes("bass") || name.includes("bajo")) return "Bajo"
    return undefined
  }

  const getTuningFromFileName = (fileName: string): string | undefined => {
    const name = fileName.toLowerCase()
    if (name.includes("bb") || name.includes("sib")) return "Bb"
    if (name.includes("eb") || name.includes("mib")) return "Eb"
    if (name.includes("fa") || name.includes("clef")) return "C clave de Fa"
    if (name.includes("c") && !name.includes("eb")) return "C"
    return undefined
  }

  const getPartFromFileName = (fileName: string): string | undefined => {
    const name = fileName.toLowerCase()
    if (name.includes("melody") || name.includes("melodia")) return "Melodía"
    if (name.includes("harmony") || name.includes("armonia")) return "Armonía"
    if (name.includes("bass") || name.includes("bajo")) return "Bajo"
    if (name.includes("drum") || name.includes("bateria")) return "Batería"
    return undefined
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))
    setPendingFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  const confirmUpload = async () => {
    if (pendingFiles.length === 0) return

    setIsUploading(true)
    const filesToUpload = pendingFiles.map(f => ({ ...f, status: "uploading" as const }))
    setUploadedFiles((prev) => [...prev, ...filesToUpload])
    setPendingFiles([])

    // Process file uploads
    const uploadPromises = filesToUpload.map(uploadFile)

    try {
      await Promise.all(uploadPromises)

      // Check if all uploads completed successfully
      setTimeout(() => {
        setUploadedFiles((prev) => {
          const completedFiles = prev.filter(f => f.status === "completed")
          const hasErrors = prev.some(f => f.status === "error")

          if (!hasErrors && completedFiles.length > 0) {
            onUploadComplete?.(completedFiles as BackendFile[])
          }

          setIsUploading(false)
          return prev
        })
      }, 1000)

    } catch (error) {
      console.error("SheetMusic upload batch failed:", error)
      setIsUploading(false)
    }
  }

  const clearPendingFiles = () => {
    setPendingFiles([])
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Archivos</CardTitle>
          <CardDescription>Configura el tipo de partitura y afinación antes de subir archivos al SheetMusic API</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="score-type-select">Tipo de Partitura</Label>
            <Select value={selectedScoreType} onValueChange={setSelectedScoreType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo de partitura" />
              </SelectTrigger>
              <SelectContent>
                {scoreTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tuning-select">Afinación</Label>
            <Select value={selectedTuning} onValueChange={setSelectedTuning}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona afinación" />
              </SelectTrigger>
              <SelectContent>
                {tuningOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Subir Archivos al SheetMusic API</span>
          </CardTitle>
          <CardDescription>
            <div className="space-y-1">
              <p>Arrastra archivos aquí o haz clic para seleccionar</p>
              <p className="text-xs">
                <strong>PDFs:</strong> Partituras • <strong>Imágenes:</strong> JPG, PNG, etc. • <strong>Audio:</strong> MP3, WAV, etc. (máx. 50MB)
              </p>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-orange-500 bg-orange-50 dark:bg-orange-950" : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-orange-600 font-medium">Suelta los archivos aquí...</p>
            ) : (
              <div>
                <p className="text-gray-600 font-medium mb-2">Arrastra archivos aquí o haz clic para seleccionar</p>
                <p className="text-sm text-gray-500">Soporta: PDFs, Imágenes (JPG, PNG, etc.), Audio (MP3, WAV, etc.)</p>
              </div>
            )}
          </div>

          {/* Pending Files List */}
          {pendingFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Archivos Pendientes</h4>
                <div className="flex gap-2">
                  <Button onClick={clearPendingFiles} variant="outline" size="sm">
                    Limpiar
                  </Button>
                  <Button onClick={confirmUpload} size="sm" className="bg-orange-500 hover:bg-orange-600">
                    Confirmar Subida ({pendingFiles.length})
                  </Button>
                </div>
              </div>
              {pendingFiles.map((file) => {
                const getFileIcon = (type: string) => {
                  switch (type) {
                    case 'image': return <Image className="w-5 h-5 text-green-500" />
                    case 'audio': return <Volume2 className="w-5 h-5 text-purple-500" />
                    case 'pdf': return <FileText className="w-5 h-5 text-blue-500" />
                    default: return <FileText className="w-5 h-5 text-gray-500" />
                  }
                }

                return (
                  <div key={file.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                    <div className="flex-shrink-0">
                      {getFileIcon(file.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {file.type.toUpperCase()}
                          </Badge>
                          {file.type === 'pdf' && file.score_type && (
                            <Badge variant="outline" className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                              {file.score_type}
                            </Badge>
                          )}
                          {file.type === 'pdf' && file.tuning && (
                            <Badge variant="outline" className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                              {file.tuning}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">{file.file ? formatFileSize(file.file.size) : ""}</span>
                        </div>
                      </div>
                      <p className="text-xs text-yellow-700">Pendiente de confirmación</p>
                    </div>

                    <Button size="sm" variant="ghost" onClick={() => removeFile(file.id)} className="flex-shrink-0">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Archivos Subidos</h4>
              {uploadedFiles.map((file) => {
                const getFileIcon = (type: string) => {
                  switch (type) {
                    case 'image': return <Image className="w-5 h-5 text-green-500" />
                    case 'audio': return <Volume2 className="w-5 h-5 text-purple-500" />
                    case 'pdf': return <FileText className="w-5 h-5 text-blue-500" />
                    default: return <FileText className="w-5 h-5 text-gray-500" />
                  }
                }

                return (
                  <div key={file.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
                    <div className="flex-shrink-0">
                      {getFileIcon(file.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {file.type.toUpperCase()}
                          </Badge>
                          {file.type === 'pdf' && file.score_type && (
                            <Badge variant="outline" className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                              {file.score_type}
                            </Badge>
                          )}
                          {file.type === 'pdf' && file.tuning && (
                            <Badge variant="outline" className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                              {file.tuning}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">{file.file ? formatFileSize(file.file.size) : ""}</span>
                        </div>
                      </div>

                      {file.status === "uploading" && <Progress value={file.progress} className="h-2" />}
                      {file.status === "pending" && (
                        <div className="flex items-center space-x-1 text-yellow-600">
                          <span className="text-xs">Pendiente de confirmación</span>
                        </div>
                      )}

                      {file.status === "completed" && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <Check className="w-4 h-4" />
                          <span className="text-xs">Subido correctamente al SheetMusic API</span>
                        </div>
                      )}

                      {file.status === "error" && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs">{file.error || "Error al subir al SheetMusic API"}</span>
                        </div>
                      )}
                    </div>

                    <Button size="sm" variant="ghost" onClick={() => removeFile(file.id)} className="flex-shrink-0">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Upload Status */}
          {isUploading && (
            <div className="text-center py-4">
              <div className="inline-flex items-center space-x-2 text-orange-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                <span className="text-sm font-medium">Subiendo archivos al SheetMusic API...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}