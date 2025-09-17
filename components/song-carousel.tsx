"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
  isPlaying: boolean
  onTogglePlayPause: () => void
  onRestart: () => void
}

export function SongCarousel({ songs, selectedSong, onSongSelect, isDarkMode, isPlaying, onTogglePlayPause, onRestart }: SongCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

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
    if (!isDragging) {
      setCurrentIndex(index)
      onSongSelect(song)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const getItemStyle = (index: number) => {
    const diff = index - currentIndex
    const absIndex = Math.abs(diff)

    // Responsive values based on screen size
    const translateX = {
      adjacent: isMobile ? 80 : 200,
      second: isMobile ? 140 : 350,
      hidden: isMobile ? 180 : 450
    }
    
    const scale = {
      center: 1,
      adjacent: isMobile ? 0.75 : 0.8,
      second: isMobile ? 0.6 : 0.6,
      hidden: isMobile ? 0.5 : 0.4
    }

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
        transform: `translateX(${direction * translateX.adjacent}px) rotateY(${-direction * 45}deg) scale(${scale.adjacent})`,
        zIndex: 5,
        opacity: 0.7,
      }
    } else if (absIndex === 2) {
      // Second level items
      const direction = diff > 0 ? 1 : -1
      return {
        transform: `translateX(${direction * translateX.second}px) rotateY(${-direction * 60}deg) scale(${scale.second})`,
        zIndex: 2,
        opacity: 0.4,
      }
    } else {
      // Hidden items
      const direction = diff > 0 ? 1 : -1
      return {
        transform: `translateX(${direction * translateX.hidden}px) rotateY(${-direction * 75}deg) scale(${scale.hidden})`,
        zIndex: 1,
        opacity: 0.2,
      }
    }
  }

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    onTogglePlayPause()
  }

  const handleBack = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRestart()
  }



  return (
    <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
      {/* 3D Carousel - Always visible, responsive */}
      <div className="relative w-full h-full flex items-center justify-center px-2 sm:px-4" style={{ perspective: isMobile ? "800px" : "1000px" }}>
        {songs.map((song, index) => {
          const style = getItemStyle(index)
          const isCenter = index === currentIndex
          const hasAudio = !!song.audioUrl

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
                className={`relative w-32 h-40 sm:w-40 sm:h-52 md:w-48 md:h-60 lg:w-64 lg:h-80 rounded-xl overflow-hidden shadow-2xl ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <Image
                  src={song.image || "/placeholder.svg"}
                  alt={`${song.title} by ${song.artist}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, (max-width: 1024px) 192px, 256px"
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
                      onClick={handlePlay}
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

      {/* Navigation indicators - Always visible */}
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
            onClick={() => {
              setCurrentIndex(index)
              onSongSelect(songs[index])
            }}
          />
        ))}
      </div>
    </div>
  )
}
