"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PlayIcon, PauseIcon, DownloadIcon, MusicIcon, ClockIcon, KeyIcon, SkipBackIcon } from "@/components/icons"
import type { SheetMusicFiles } from "@/lib/sheetmusic-api"

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
  sheet_music_files?: SheetMusicFiles
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
  { id: "C", label: "C (Flauta, Oboe)", transposition: "C" },
  { id: "F", label: "F (Corno)", transposition: "F" },
  { id: "C_BASS", label: "Clave de Fa (Trombón, Tuba, Fagot)", transposition: "Bass Clef" },
]

const partOptions = [
  { id: "MELODIA_PRINCIPAL", label: "Melodía Principal" },
  { id: "ARMONIA", label: "Armonía/Contrapunto" },
  { id: "BAJO", label: "Línea de Bajo" },
]

export function SongDetails({ song, isDarkMode, isPlaying, onTogglePlayPause, onRestart }: SongDetailsProps) {
  const [selectedInstrument, setSelectedInstrument] = useState<keyof SheetMusicFiles>("Bb")
  const [selectedPart, setSelectedPart] = useState<"MELODIA_PRINCIPAL" | "ARMONIA" | "BAJO">("MELODIA_PRINCIPAL")

  const handleDownload = () => {
    const instrument = instrumentOptions.find((i) => i.id === selectedInstrument)
    const part = partOptions.find((p) => p.id === selectedPart)

    // Get the file URL from sheet_music_files
    const fileUrl = song.sheet_music_files?.[selectedInstrument]?.[selectedPart]

    console.log("[JDV] Looking for file:", { selectedInstrument, selectedPart, fileUrl })

    if (fileUrl) {
      console.log("[JDV] Downloading file:", fileUrl)
      const link = document.createElement("a")
      link.href = fileUrl
      link.download = `${song.title}-${instrument?.label}-${part?.label}.pdf`
      link.target = "_blank"  // Open in new tab as fallback
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      alert(
        `No hay archivo disponible para ${instrument?.label} - ${part?.label}.`
      )
    }
  }

  const isDownloadAvailable = (instrument: keyof SheetMusicFiles, part: "MELODIA_PRINCIPAL" | "ARMONIA" | "BAJO") => {
    return !!(song.sheet_music_files?.[instrument]?.[part])
  }

  const getAvailableInstruments = () => {
    return instrumentOptions.map(instrument => ({
      ...instrument,
      isAvailable: isDownloadAvailable(instrument.id as keyof SheetMusicFiles, selectedPart)
    }))
  }

  const getAvailableFilesCount = () => {
    if (!song.sheet_music_files) return 0

    let count = 0
    Object.keys(song.sheet_music_files).forEach((tuning) => {
      const tuningFiles = song.sheet_music_files![tuning as keyof SheetMusicFiles]
      Object.values(tuningFiles).forEach((fileUrl) => {
        if (fileUrl) count++
      })
    })
    return count
  }

  const hasAudio = !!song.audioUrl

  return (
    <Card
      className={`max-w-4xl mx-auto shadow-xl mt-4 sm:mt-8 ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 pr-2">{song.title}</CardTitle>
            <p className="text-lg sm:text-xl text-orange-100">{song.artist}</p>
          </div>
          {hasAudio && (
            <div className="flex gap-2 flex-shrink-0">
              <Button
                onClick={onRestart}
                size="sm"
                variant="secondary"
                className="w-9 h-9 sm:w-10 sm:h-10 p-0 bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <SkipBackIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button
                onClick={onTogglePlayPause}
                size="sm"
                variant="secondary"
                className="w-9 h-9 sm:w-10 sm:h-10 p-0 bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                {isPlaying ? (
                  <PauseIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <PlayIcon className="w-3 h-3 sm:w-4 sm:h-4" />
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

          {getAvailableFilesCount() > 0 ? (
            <div className={`mb-4 p-3 rounded-lg border ${
              isDarkMode
                ? "bg-green-900/30 border-green-800 text-green-300"
                : "bg-green-50 border-green-200 text-green-800"
            }`}>
              <p className="text-sm font-medium">
                ✓ Archivos disponibles: {getAvailableFilesCount()} partituras
              </p>
            </div>
          ) : (
            <div className={`mb-4 p-3 rounded-lg border ${
              isDarkMode
                ? "bg-yellow-900/30 border-yellow-800 text-yellow-300"
                : "bg-yellow-50 border-yellow-200 text-yellow-800"
            }`}>
              <p className="text-sm font-medium">
                ⚠ No hay archivos subidos para este tema. Contacta al admin para solicitar partituras.
              </p>
            </div>
          )}

          <div className="mb-4 sm:mb-6">
            <p className={`font-medium mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Selecciona tu instrumento:
            </p>
            <div className="flex flex-wrap gap-2">
              {getAvailableInstruments().map((instrument) => {
                const isSelected = selectedInstrument === instrument.id
                const isAvailable = instrument.isAvailable
                
                return (
                  <button
                    key={instrument.id}
                    onClick={() => isAvailable && setSelectedInstrument(instrument.id as keyof SheetMusicFiles)}
                    disabled={!isAvailable}
                    className={cn(
                      "px-3 py-2 rounded-lg border transition-all duration-200 text-sm",
                      isSelected && isAvailable
                        ? "border-blue-500 bg-blue-500 text-white shadow-md"
                        : isAvailable
                          ? isDarkMode
                            ? "border-gray-600 hover:border-blue-400 text-gray-300 bg-gray-800 hover:bg-gray-700"
                            : "border-gray-300 hover:border-blue-400 text-gray-700 bg-white hover:bg-blue-50"
                          : isDarkMode
                            ? "border-gray-700 text-gray-600 bg-gray-800/30 cursor-not-allowed opacity-50"
                            : "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed opacity-50",
                    )}
                  >
                    <div className="font-medium">{instrument.label.split(" ")[0]}</div>
                    {isAvailable && (
                      <div className="text-xs opacity-75 mt-0.5">{instrument.label.split(" (")[1]?.replace(")", "")}</div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <p className={`font-medium mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Selecciona la parte:</p>
            <div className="flex flex-wrap gap-2">
              {partOptions.map((part) => (
                <button
                  key={part.id}
                  onClick={() => setSelectedPart(part.id as "MELODIA_PRINCIPAL" | "ARMONIA" | "BAJO")}
                  className={cn(
                    "px-3 py-2 rounded-lg border transition-all duration-200 text-sm",
                    selectedPart === part.id
                      ? "border-blue-500 bg-blue-500 text-white shadow-md"
                      : isDarkMode
                        ? "border-gray-600 hover:border-blue-400 text-gray-300 bg-gray-800 hover:bg-gray-700"
                        : "border-gray-300 hover:border-blue-400 text-gray-700 bg-white hover:bg-blue-50",
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
              isDownloadAvailable(selectedInstrument, selectedPart)
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                : "bg-gray-400 cursor-not-allowed text-gray-200",
            )}
            disabled={!isDownloadAvailable(selectedInstrument, selectedPart)}
          >
            <DownloadIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            {isDownloadAvailable(selectedInstrument, selectedPart) ? "Descargar Partitura" : "No Disponible"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
