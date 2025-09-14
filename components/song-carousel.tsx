"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { getFilesByTheme } from "@/lib/file-manager"
import { PlayIcon, SkipBackIcon, PauseIcon } from "@/components/icons"

interface Song {
  id: number
  title: string
  artist: string
  image: string
  key: string
  tempo: string
  structure: string
  description: string
  audioUrl?: string // Made audioUrl optional since it comes from file system
}

interface SongCarouselProps {
  songs: Song[]
  selectedSong: Song
  onSongSelect: (song: Song) => void
  isDarkMode: boolean
}

export function SongCarousel({ songs, selectedSong, onSongSelect, isDarkMode }: SongCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null)

  useEffect(() => {
    const selectedIndex = songs.findIndex((song) => song.id === selectedSong.id)
    if (selectedIndex !== -1) {
      setCurrentIndex(selectedIndex)
    }
  }, [selectedSong, songs])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleSongClick = (song: Song, index: number) => {
    setCurrentIndex(index)
    onSongSelect(song)
    if (audio) {
      audio.pause()
      setIsPlaying(false)
    }
  }

  const getItemStyle = (index: number) => {
    const diff = index - currentIndex
    const absIndex = Math.abs(diff)

    if (absIndex === 0) {
      // Center item
      return {
        transform: "translateX(0) rotateY(0deg) scale(1)",
        zIndex: 10,
        opacity: 1,
      }
    } else if (absIndex === 1) {
      // Adjacent items
      const direction = diff > 0 ? 1 : -1
      return {
        transform: `translateX(${direction * (isMobile ? 120 : 200)}px) rotateY(${-direction * 45}deg) scale(${isMobile ? 0.7 : 0.8})`,
        zIndex: 5,
        opacity: 0.7,
      }
    } else if (absIndex === 2) {
      // Second level items
      const direction = diff > 0 ? 1 : -1
      return {
        transform: `translateX(${direction * (isMobile ? 200 : 350)}px) rotateY(${-direction * 60}deg) scale(${isMobile ? 0.5 : 0.6})`,
        zIndex: 2,
        opacity: 0.4,
      }
    } else {
      // Hidden items
      const direction = diff > 0 ? 1 : -1
      return {
        transform: `translateX(${direction * (isMobile ? 250 : 450)}px) rotateY(${-direction * 75}deg) scale(0.4)`,
        zIndex: 1,
        opacity: 0.2,
      }
    }
  }

  const handlePlay = async (song: Song, e: React.MouseEvent) => {
    e.stopPropagation()

    try {
      const audioFiles = getFilesByTheme(song.id.toString(), "audio")

      if (audioFiles.length === 0) {
        console.log("[v0] No audio files found for theme:", song.title)
        return
      }

      const audioFile = audioFiles[0]

      if (audio && currentAudioUrl === audioFile.url && !audio.paused) {
        audio.pause()
        setIsPlaying(false)
        return
      }

      if (audio) {
        audio.pause()
      }

      console.log("[v0] Playing audio:", audioFile.url)
      const newAudio = new Audio(audioFile.url)

      newAudio.addEventListener("loadstart", () => {
        console.log("[v0] Audio loading started")
      })

      newAudio.addEventListener("canplay", () => {
        console.log("[v0] Audio can play")
      })

      newAudio.addEventListener("error", (e) => {
        console.log("[v0] Audio error:", e)
        setIsPlaying(false)
      })

      newAudio.addEventListener("ended", () => {
        console.log("[v0] Audio ended")
        setIsPlaying(false)
      })

      await newAudio.play()
      setAudio(newAudio)
      setCurrentAudioUrl(audioFile.url)
      setIsPlaying(true)
    } catch (error) {
      console.log("[v0] Error playing audio:", error)
      setIsPlaying(false)
    }
  }

  const handleBack = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (audio) {
      audio.currentTime = 0
      console.log("[v0] Audio rewound to beginning")
    }
  }

  const handlePause = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (audio) {
      audio.pause()
      setIsPlaying(false)
      console.log("[v0] Audio paused")
    }
  }

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause()
      }
    }
  }, [audio])

  return (
    <div className="relative h-64 sm:h-80 md:h-96 flex items-center justify-center overflow-hidden px-4">
      <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: "1000px" }}>
        {songs.map((song, index) => {
          const style = getItemStyle(index)
          const isCenter = index === currentIndex
          const hasAudio = getFilesByTheme(song.id.toString(), "audio").length > 0

          return (
            <div
              key={song.id}
              className={cn(
                "absolute cursor-pointer transition-all duration-700 ease-out",
                "hover:scale-110 hover:brightness-110",
              )}
              style={style}
              onClick={() => handleSongClick(song, index)}
            >
              <div
                className={`relative w-40 h-52 sm:w-48 sm:h-60 md:w-64 md:h-80 rounded-xl overflow-hidden shadow-2xl ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <Image
                  src={song.image || "/placeholder.svg"}
                  alt={`${song.title} by ${song.artist}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 256px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {isCenter && hasAudio && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-8 h-8 p-0 bg-black/50 hover:bg-black/70 border-0"
                      onClick={handleBack}
                    >
                      <SkipBackIcon className="w-3 h-3 text-white" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-8 h-8 p-0 bg-black/50 hover:bg-black/70 border-0"
                      onClick={isPlaying ? handlePause : (e) => handlePlay(song, e)}
                    >
                      {isPlaying ? (
                        <PauseIcon className="w-3 h-3 text-white" />
                      ) : (
                        <PlayIcon className="w-3 h-3 text-white" />
                      )}
                    </Button>
                  </div>
                )}

                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 text-white">
                  <h3 className="font-bold text-sm sm:text-base md:text-lg mb-1 text-balance">{song.title}</h3>
                  <p className="text-xs sm:text-sm opacity-90">{song.artist}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {songs.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300",
              index === currentIndex
                ? "bg-orange-500 scale-125"
                : `${isDarkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-300 hover:bg-gray-400"}`,
            )}
            onClick={() => handleSongClick(songs[index], index)}
          />
        ))}
      </div>
    </div>
  )
}
