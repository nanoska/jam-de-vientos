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
  status: "uploading" | "completed" | "error"
  progress: number
  file?: File
}

export function FileUpload({ themeId, onUploadComplete }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileWithProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedKey, setSelectedKey] = useState<string>("")
  const [selectedInstrument, setSelectedInstrument] = useState<string>("")

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: FileWithProgress[] = acceptedFiles.map((file) => {
        let fileType: "audio" | "pdf" = "pdf"

        if (file.type.startsWith("audio/")) {
          fileType = "audio"
        }

        return {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: fileType,
          url: "", // Will be set after upload
          tonality: selectedKey || getKeyFromFileName(file.name) || "C",
          instrument: selectedInstrument || getInstrumentFromFileName(file.name) || "C",
          part: getPartFromFileName(file.name) || "Melodía",
          themeId,
          status: "uploading",
          progress: 0,
          file,
        }
      })

      setUploadedFiles((prev) => [...prev, ...newFiles])
      setIsUploading(true)

      // Process file uploads
      newFiles.forEach((fileData) => {
        simulateUpload(fileData)
      })
    },
    [selectedKey, selectedInstrument, themeId],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".ogg"],
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
          tonality: fileData.tonality,
          instrument: fileData.instrument,
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
                  tonality: f.tonality,
                  instrument: f.instrument,
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

  const getKeyFromFileName = (fileName: string): string | undefined => {
    const name = fileName.toLowerCase()
    const keys = [
      { pattern: "bb", key: "Bb" },
      { pattern: "eb", key: "Eb" },
      { pattern: "c", key: "C" },
      { pattern: "f", key: "F" },
      { pattern: "g", key: "G" },
      { pattern: "d", key: "D" },
      { pattern: "a", key: "A" },
      { pattern: "e", key: "E" },
      { pattern: "b", key: "B" },
    ]
    for (const { pattern, key } of keys) {
      if (name.includes(pattern)) return key
    }
    return undefined
  }

  const getInstrumentFromFileName = (fileName: string): string | undefined => {
    const name = fileName.toLowerCase()
    if (name.includes("bb") || name.includes("sib")) return "Bb"
    if (name.includes("eb") || name.includes("mib")) return "Eb"
    if (name.includes("bass") || name.includes("bajo")) return "Bajo"
    if (name.includes("c") && !name.includes("eb")) return "C"
    if (name.includes("fa") || name.includes("clef")) return "Clave de Fa"
    if (name.includes("trompet") || name.includes("trumpet")) return "Trompeta"
    if (name.includes("sax") || name.includes("saxo")) return "Saxofón"
    if (name.includes("trombon") || name.includes("trombone")) return "Trombón"
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
          <CardDescription>Configura la tonalidad e instrumento antes de subir archivos</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="key-select">Tonalidad</Label>
            <Select value={selectedKey} onValueChange={setSelectedKey}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tonalidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="C">C (Do Mayor)</SelectItem>
                <SelectItem value="Db">Db (Re♭ Mayor)</SelectItem>
                <SelectItem value="D">D (Re Mayor)</SelectItem>
                <SelectItem value="Eb">Eb (Mi♭ Mayor)</SelectItem>
                <SelectItem value="E">E (Mi Mayor)</SelectItem>
                <SelectItem value="F">F (Fa Mayor)</SelectItem>
                <SelectItem value="F#">F# (Fa# Mayor)</SelectItem>
                <SelectItem value="G">G (Sol Mayor)</SelectItem>
                <SelectItem value="Ab">Ab (La♭ Mayor)</SelectItem>
                <SelectItem value="A">A (La Mayor)</SelectItem>
                <SelectItem value="Bb">Bb (Si♭ Mayor)</SelectItem>
                <SelectItem value="B">B (Si Mayor)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="instrument-select">Instrumento</Label>
            <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona instrumento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bb">Bb (Trompeta, Saxo Tenor)</SelectItem>
                <SelectItem value="Eb">Eb (Saxo Alto, Barítono)</SelectItem>
                <SelectItem value="C">C (Piano, Guitarra)</SelectItem>
                <SelectItem value="Bajo">Bajo</SelectItem>
                <SelectItem value="Clave de Fa">Clave de Fa (Trombón)</SelectItem>
                <SelectItem value="Batería">Batería</SelectItem>
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
                <strong>Audio:</strong> MP3, WAV (máx. 50MB) | <strong>PDFs:</strong> Partituras (máx. 10MB)
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
                <p className="text-sm text-gray-500">Soporta: Audio (MP3, WAV), Partituras (PDF)</p>
              </div>
            )}
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Archivos Subidos</h4>
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
                  <div className="flex-shrink-0">
                    {file.type === "audio" && <Volume2 className="w-5 h-5 text-green-500" />}
                    {file.type === "pdf" && <FileText className="w-5 h-5 text-blue-500" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {file.tonality}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {file.instrument}
                        </Badge>
                        <span className="text-xs text-gray-500">{file.file ? formatFileSize(file.file.size) : ""}</span>
                      </div>
                    </div>

                    {file.status === "uploading" && <Progress value={file.progress} className="h-2" />}

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
