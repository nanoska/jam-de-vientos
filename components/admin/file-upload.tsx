"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Volume2, X, Check } from "lucide-react"
import { addFileToTheme, type UploadedFile } from "@/lib/file-manager"

interface FileUploadProps {
  themeId: string
  onUploadComplete?: (files: UploadedFile[]) => void
}

interface FileWithProgress extends UploadedFile {
  status: "pending" | "uploading" | "completed" | "error"
  progress: number
  file?: File
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

export function FileUpload({ themeId, onUploadComplete }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileWithProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedScoreType, setSelectedScoreType] = useState<string>("")
  const [selectedTuning, setSelectedTuning] = useState<string>("")
  const [pendingFiles, setPendingFiles] = useState<FileWithProgress[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: FileWithProgress[] = acceptedFiles.map((file) => {
        const fileType: "pdf" = "pdf"

        return {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: fileType,
          url: "", // Will be set after upload
          scoreType: selectedScoreType || getScoreTypeFromFileName(file.name) || "Melodía",
          tuning: selectedTuning || getTuningFromFileName(file.name) || "C",
          part: getPartFromFileName(file.name) || "Melodía",
          themeId,
          status: "pending",
          progress: 0,
          file,
        }
      })

      setPendingFiles((prev) => [...prev, ...newFiles])
    },
    [selectedScoreType, selectedTuning, themeId],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: true,
  })

  const simulateUpload = (fileData: FileWithProgress) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 30
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)

        const fileUrl = fileData.file ? URL.createObjectURL(fileData.file) : ""

        const savedFile = addFileToTheme(themeId, {
          name: fileData.name,
          type: fileData.type,
          url: fileUrl,
          scoreType: fileData.scoreType,
          tuning: fileData.tuning,
          part: fileData.part,
        })

        setUploadedFiles((prev) =>
          prev.map((file) =>
            file.id === fileData.id
              ? { ...file, status: "completed", progress: 100, url: savedFile.url, id: savedFile.id }
              : file,
          ),
        )

        console.log("[v0] File uploaded successfully:", savedFile)

        // Check if all uploads are complete
        setTimeout(() => {
          setUploadedFiles((prev) => {
            const allCompleted = prev.every((f) => f.status === "completed")
            if (allCompleted) {
              setIsUploading(false)
              onUploadComplete?.(
                prev.map((f) => ({
                  id: f.id,
                  name: f.name,
                  type: f.type,
                  url: f.url,
                  scoreType: f.scoreType,
                  tuning: f.tuning,
                  part: f.part,
                  themeId: f.themeId,
                })),
              )
            }
            return prev
          })
        }, 500)
      } else {
        setUploadedFiles((prev) => prev.map((file) => (file.id === fileData.id ? { ...file, progress } : file)))
      }
    }, 200)
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

  const confirmUpload = () => {
    if (pendingFiles.length === 0) return
    
    setIsUploading(true)
    setUploadedFiles((prev) => [...prev, ...pendingFiles.map(f => ({ ...f, status: "uploading" as const }))])
    setPendingFiles([])
    
    // Process file uploads
    pendingFiles.forEach((fileData) => {
      simulateUpload({ ...fileData, status: "uploading" as const })
    })
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
          <CardDescription>Configura el tipo de partitura y afinación antes de subir archivos</CardDescription>
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
            <span>Subir Archivos</span>
          </CardTitle>
          <CardDescription>
            <div className="space-y-1">
              <p>Arrastra archivos aquí o haz clic para seleccionar</p>
              <p className="text-xs">
                <strong>PDFs:</strong> Partituras (máx. 10MB)
              </p>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-orange-500 bg-orange-50" : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-orange-600 font-medium">Suelta los archivos aquí...</p>
            ) : (
              <div>
                <p className="text-gray-600 font-medium mb-2">Arrastra archivos aquí o haz clic para seleccionar</p>
                <p className="text-sm text-gray-500">Soporta: Solo Partituras (PDF)</p>
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
              {pendingFiles.map((file) => (
                <div key={file.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                  <div className="flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800">
                          {file.scoreType}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                          {file.tuning}
                        </Badge>
                        <span className="text-xs text-gray-500">{file.file ? formatFileSize(file.file.size) : ""}</span>
                      </div>
                    </div>
                    <p className="text-xs text-yellow-700">Pendiente de confirmación</p>
                  </div>

                  <Button size="sm" variant="ghost" onClick={() => removeFile(file.id)} className="flex-shrink-0">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Archivos Subidos</h4>
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
                  <div className="flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {file.scoreType}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {file.tuning}
                        </Badge>
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
                        <span className="text-xs">Subido correctamente</span>
                      </div>
                    )}
                  </div>

                  <Button size="sm" variant="ghost" onClick={() => removeFile(file.id)} className="flex-shrink-0">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Status */}
          {isUploading && (
            <div className="text-center py-4">
              <div className="inline-flex items-center space-x-2 text-orange-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                <span className="text-sm font-medium">Subiendo archivos...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
