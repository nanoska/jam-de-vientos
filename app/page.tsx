"use client"

import { useState, useRef, useEffect } from "react"
import { SongCarousel } from "@/components/song-carousel"
import { SongDetails } from "@/components/song-details"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getThemes, type Theme } from "@/lib/file-manager"
import { MapPinIcon, CalendarIcon, MessageCircleIcon, MoonIcon, SunIcon, SettingsIcon } from "@/components/icons"

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

const convertThemeToSong = (theme: Theme): Song => ({
  id: Number.parseInt(theme.id),
  title: theme.title,
  artist: theme.artist,
  image: theme.image,
  key: theme.key,
  tempo: theme.tempo,
  structure: theme.structure,
  description: theme.description,
  audioUrl: theme.audioUrl || `/audio/${theme.title.toLowerCase().replace(/\s+/g, "-")}.mp3`,
})

export default function JamDeVientosPage() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [songs, setSongs] = useState<Song[]>([])
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    try {
      const loadedThemes = getThemes()
      setThemes(loadedThemes)
      const convertedSongs = loadedThemes.map(convertThemeToSong)
      setSongs(convertedSongs)
      if (convertedSongs.length > 0) {
        setSelectedSong(convertedSongs[0])
      }
    } catch (error) {
      console.error("Error loading themes:", error)
      // Fallback to empty state
      setThemes([])
      setSongs([])
      setSelectedSong(null)
    }
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song)
    
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause()
      setIsPlaying(false)
    }

    // Create new audio instance and auto-play
    if (song.audioUrl) {
      const newAudio = new Audio(song.audioUrl)
      newAudio.volume = 0.7
      
      newAudio.addEventListener('ended', () => {
        setIsPlaying(false)
      })
      
      newAudio.addEventListener('loadeddata', () => {
        newAudio.play().then(() => {
          setIsPlaying(true)
        }).catch((error) => {
          console.log("Audio autoplay prevented:", error)
          setIsPlaying(false)
        })
      })
      
      setCurrentAudio(newAudio)
    }
  }

  const togglePlayPause = () => {
    if (currentAudio) {
      if (isPlaying) {
        currentAudio.pause()
        setIsPlaying(false)
      } else {
        currentAudio.play().then(() => {
          setIsPlaying(true)
        }).catch((error) => {
          console.log("Audio play error:", error)
        })
      }
    }
  }

  const restartAudio = () => {
    if (currentAudio) {
      currentAudio.currentTime = 0
      if (!isPlaying) {
        currentAudio.play().then(() => {
          setIsPlaying(true)
        }).catch((error) => {
          console.log("Audio play error:", error)
        })
      }
    }
  }

  if (!selectedSong || songs.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Cargando temas musicales...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 relative overflow-hidden ${
        isDarkMode ? "bg-gray-900" : "bg-white"
      }`}
    >
      <div className={`absolute inset-0 ${isDarkMode ? "opacity-10" : "opacity-5"}`}>
        <div className="absolute top-20 left-4 sm:left-10 text-2xl sm:text-4xl note-float text-orange-400">♪</div>
        <div className="absolute top-40 right-4 sm:right-20 text-xl sm:text-3xl note-float animation-delay-500 text-orange-500">
          ♫
        </div>
        <div className="absolute bottom-40 left-4 sm:left-20 text-2xl sm:text-4xl note-float animation-delay-1000 text-orange-600">
          ♬
        </div>
        <div className="absolute bottom-20 right-4 sm:right-10 text-xl sm:text-2xl note-float animation-delay-2000 text-orange-400">
          ♩
        </div>
        <div className="absolute top-60 left-1/2 text-xl sm:text-3xl note-float animation-delay-500 text-orange-500">
          ♭
        </div>
        <div className="absolute top-80 right-1/3 text-lg sm:text-2xl note-float animation-delay-1500 text-orange-600">
          ♯
        </div>
      </div>

      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 sm:py-6 md:py-8 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="musical-element text-lg sm:text-2xl text-white/30"
            style={{ left: "10%", animationDelay: "0s" }}
          >
            ♪
          </div>
          <div
            className="musical-element text-base sm:text-xl text-white/20"
            style={{ left: "25%", animationDelay: "1s" }}
          >
            𝄞
          </div>
          <div
            className="musical-element text-xl sm:text-3xl text-white/25"
            style={{ left: "40%", animationDelay: "2s" }}
          >
            🎺
          </div>
          <div
            className="musical-element text-lg sm:text-2xl text-white/30"
            style={{ left: "55%", animationDelay: "3s" }}
          >
            ♭
          </div>
          <div
            className="musical-element text-xl sm:text-3xl text-white/25"
            style={{ left: "70%", animationDelay: "0.5s" }}
          >
            🎷
          </div>
          <div
            className="musical-element text-lg sm:text-2xl text-white/30"
            style={{ left: "85%", animationDelay: "1.5s" }}
          >
            ♯
          </div>
          <div
            className="musical-element text-base sm:text-xl text-white/20 hidden sm:block"
            style={{ left: "20%", animationDelay: "4s" }}
          >
            𝄢
          </div>
          <div
            className="musical-element text-lg sm:text-2xl text-white/30 hidden sm:block"
            style={{ left: "60%", animationDelay: "2.5s" }}
          >
            ♫
          </div>
          <div
            className="musical-element text-base sm:text-xl text-white/20 hidden sm:block"
            style={{ left: "80%", animationDelay: "3.5s" }}
          >
            𝄪
          </div>
        </div>

        <div className="container mx-auto px-3 sm:px-4 text-center relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2 text-balance drop-shadow-lg title-pulse text-white">
            Jam de Vientos
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-3 sm:mb-4 md:mb-6 text-white px-1 sm:px-2 drop-shadow-md">
            Música Popular para Instrumentos de <em className="text-white">Viento</em> en Zona Norte
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-6 text-white text-xs sm:text-sm md:text-base">
            <div className="flex items-center gap-1 sm:gap-2 bg-black/20 px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
              <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              <span className="font-semibold">Viernes 20 de Septiembre</span>
            </div>
            <a
              href="https://maps.app.goo.gl/GYnPxcs4Fwm2si948"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 sm:gap-2 bg-black/20 hover:bg-black/40 px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-300 cursor-pointer"
            >
              <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              <span>Ver Ubicación</span>
            </a>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={toggleDarkMode}
                className="flex items-center justify-center bg-black/20 hover:bg-black/40 w-8 h-8 sm:w-9 sm:h-9 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-300"
                title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              >
                {isDarkMode ? (
                  <SunIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <MoonIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>

              {isAuthenticated && user?.role === "admin" && (
                <Link href="/admin/dashboard">
                  <Button
                    size="sm"
                    className="flex items-center gap-1 sm:gap-2 bg-black/20 hover:bg-black/40 px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-300"
                    variant="ghost"
                  >
                    <SettingsIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Admin</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 relative">
        <div
          className={`text-center mb-6 sm:mb-8 md:mb-12 ${
            isDarkMode ? "bg-gray-800/50" : "bg-gray-50"
          } backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
        >
          <p
            className={`text-xs sm:text-sm md:text-base ${isDarkMode ? "text-gray-300" : "text-gray-600"} max-w-2xl mx-auto px-2 sm:px-4`}
          >
            Selecciona un tema del carousel para acceder a las partituras, audio y detalles de cada standard
          </p>
        </div>

        {/* 3D Carousel */}
        <div className="mb-6 sm:mb-8 md:mb-12">
          <SongCarousel
            songs={songs}
            selectedSong={selectedSong}
            onSongSelect={handleSongSelect}
            isDarkMode={isDarkMode}
            isPlaying={isPlaying}
            onTogglePlayPause={togglePlayPause}
            onRestart={restartAudio}
          />
        </div>

        {/* Song Details */}
        <SongDetails 
          song={selectedSong} 
          isDarkMode={isDarkMode}
          isPlaying={isPlaying}
          onTogglePlayPause={togglePlayPause}
          onRestart={restartAudio}
        />
      </main>

      <footer className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 sm:py-6 md:py-8 mt-8 sm:mt-12 md:mt-16 relative">
        <div className="container mx-auto px-3 sm:px-4 text-center relative z-10">
          <div className="mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-orange-100">¿Consultas sobre la Jam?</h3>
            <a
              href="https://wa.me/541160470561"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold transition-all duration-300 transform hover:scale-110 shadow-lg"
              title="Contactar por WhatsApp"
            >
              <MessageCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </a>
          </div>
          <div className="border-t border-orange-400 pt-3 sm:pt-4">
            <p className="text-orange-100 text-xs sm:text-sm md:text-base">
              © 2024 Jam de Vientos - Centro Cultural Tiempos de Memoria
            </p>
            {!isAuthenticated && (
              <div className="mt-1 sm:mt-2">
                <Link href="/admin/login" className="text-xs text-orange-200 hover:text-white transition-colors">
                  Acceso Administrativo
                </Link>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
