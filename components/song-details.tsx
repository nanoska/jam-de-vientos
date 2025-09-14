"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getFilesByTheme, type UploadedFile } from "@/lib/file-manager"
import { PlayIcon, PauseIcon, DownloadIcon, MusicIcon, ClockIcon, KeyIcon, SkipBackIcon } from "@/components/icons"

interface Song {
  id: number
  title: string
  artist: string
  image: string
  key: string
  tempo: string
  structure: string
  description: string
  audioUrl?: string
}

interface SongDetailsProps {
  song: Song
  isDarkMode: boolean
  isPlaying: boolean
  onTogglePlayPause: () => void
  onRestart: () => void
}

const instrumentOptions = [
  { id: "Bb", label: "Bb (Trompeta, Tenor Sax, Clarinete)", transposition: "Bb" },
  { id: "Eb", label: "Eb (Alto Sax, Barítono)", transposition: "Eb" },
  { id: "C", label: "C (Flauta, Violín, Piano)", transposition: "C" },
  { id: "Clave de Fa", label: "Clave de Fa (Trombón, Tuba, Fagot)", transposition: "Bass Clef" },
]

const partOptions = [
  { id: "Melodía", label: "Melodía Principal" },
  { id: "Armonía", label: "Armonía/Contrapunto" },
  { id: "Bajo", label: "Línea de Bajo" },
]

export function SongDetails({ song, isDarkMode, isPlaying, onTogglePlayPause, onRestart }: SongDetailsProps) {
  const [selectedInstrument, setSelectedInstrument] = useState("Bb")
  const [selectedPart, setSelectedPart] = useState("Melodía")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  useEffect(() => {
    const files = getFilesByTheme(song.id.toString())
    setUploadedFiles(files)
    console.log("[v0] Loaded files for song:", song.title, files)
  }, [song.id])


  const handleDownload = () => {
    const instrument = instrumentOptions.find((i) => i.id === selectedInstrument)
    const part = partOptions.find((p) => p.id === selectedPart)

    const matchingFile = uploadedFiles.find(
      (f) => f.type === "pdf" && f.tuning === selectedInstrument && f.scoreType === selectedPart,
    )

    console.log("[v0] Looking for file:", { selectedInstrument, selectedPart, availableFiles: uploadedFiles })

    if (matchingFile) {
      console.log("[v0] Downloading file:", matchingFile)
      const link = document.createElement("a")
      link.href = matchingFile.url
      link.download = `${song.title}-${instrument?.label}-${part?.label}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      const availablePdfs = uploadedFiles.filter((f) => f.type === "pdf")
      console.log("[v0] Available PDF files:", availablePdfs)
      alert(
        `No hay archivo disponible para ${instrument?.label} - ${part?.label}.\nArchivos disponibles: ${availablePdfs.length}`,
      )
    }
  }

  const isDownloadAvailable = () => {
    return uploadedFiles.some((f) => f.type === "pdf" && f.tuning === selectedInstrument && f.scoreType === selectedPart)
  }

  const hasAudio = !!song.audioUrl

  return (
    <Card
      className={`max-w-4xl mx-auto shadow-xl mt-4 sm:mt-8 ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">{song.title}</CardTitle>
            <p className="text-lg sm:text-xl text-orange-100">{song.artist}</p>
          </div>
          {hasAudio && (
            <div className="flex gap-2">
              <Button
                onClick={onRestart}
                size="sm"
                variant="secondary"
                className="w-10 h-10 p-0 bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <SkipBackIcon className="w-4 h-4" />
              </Button>
              <Button
                onClick={onTogglePlayPause}
                size="sm"
                variant="secondary"
                className="w-10 h-10 p-0 bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                {isPlaying ? (
                  <PauseIcon className="w-4 h-4" />
                ) : (
                  <PlayIcon className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <KeyIcon className="w-5 h-5 text-orange-500" />
            <div>
              <p className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Tonalidad</p>
              <p className={`text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>{song.key}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ClockIcon className="w-5 h-5 text-orange-500" />
            <div>
              <p className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Tempo</p>
              <p className={`text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>{song.tempo}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MusicIcon className="w-5 h-5 text-orange-500" />
            <div>
              <p className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Standard</p>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                Jam Session
              </Badge>
            </div>
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <h3 className={`text-lg sm:text-xl font-semibold mb-3 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
            Descripción
          </h3>
          <p className={`leading-relaxed text-sm sm:text-base ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            {song.description}
          </p>
        </div>

        <div className="mb-6 sm:mb-8">
          <h3 className={`text-lg sm:text-xl font-semibold mb-3 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
            Estructura
          </h3>
          <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
            <p className={`font-mono text-xs sm:text-sm break-all ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              {song.structure}
            </p>
          </div>
        </div>

        <div className={`border-t pt-6 sm:pt-8 ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}>
          <h3
            className={`text-lg sm:text-xl font-semibold mb-4 sm:mb-6 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
          >
            Descargar Partituras
          </h3>

          {uploadedFiles.length > 0 ? (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm text-green-800 font-medium">
                Archivos disponibles: {uploadedFiles.filter((f) => f.type === "pdf").length} partituras
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {uploadedFiles
                  .filter((f) => f.type === "pdf")
                  .map((file, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {file.tuning} - {file.scoreType}
                    </span>
                  ))}
              </div>
            </div>
          ) : (
            <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <p className="text-sm text-yellow-800 font-medium">
                No hay archivos subidos para este tema. Los administradores pueden subir archivos desde el panel de
                administración.
              </p>
            </div>
          )}

          <div className="mb-4 sm:mb-6">
            <p className={`font-medium mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Selecciona tu instrumento:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {instrumentOptions.map((instrument) => (
                <button
                  key={instrument.id}
                  onClick={() => setSelectedInstrument(instrument.id)}
                  className={cn(
                    "p-3 rounded-lg border-2 text-left transition-all duration-200",
                    selectedInstrument === instrument.id
                      ? "border-orange-500 bg-orange-50 text-orange-800"
                      : isDarkMode
                        ? "border-gray-600 hover:border-gray-500 text-gray-300 bg-gray-700/50"
                        : "border-gray-200 hover:border-gray-300 text-gray-700",
                  )}
                >
                  <div className="font-medium text-sm sm:text-base">{instrument.label}</div>
                  <div className="text-xs sm:text-sm opacity-75">Afinación: {instrument.transposition}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <p className={`font-medium mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Selecciona la parte:</p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              {partOptions.map((part) => (
                <button
                  key={part.id}
                  onClick={() => setSelectedPart(part.id)}
                  className={cn(
                    "px-4 py-2 rounded-full border-2 transition-all duration-200 text-sm sm:text-base",
                    selectedPart === part.id
                      ? "border-orange-500 bg-orange-500 text-white"
                      : isDarkMode
                        ? "border-gray-600 hover:border-gray-500 text-gray-300"
                        : "border-gray-300 hover:border-gray-400 text-gray-700",
                  )}
                >
                  {part.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleDownload}
            size="lg"
            className={cn(
              "w-full sm:w-auto",
              isDownloadAvailable()
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-gray-400 cursor-not-allowed text-gray-200",
            )}
            disabled={!isDownloadAvailable()}
          >
            <DownloadIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            {isDownloadAvailable() ? "Descargar Partitura" : "No Disponible"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
