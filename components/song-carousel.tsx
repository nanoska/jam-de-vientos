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
      {/* Desktop 3D Carousel */}
      <div className={cn(
        "relative w-full h-full items-center justify-center px-4",
        isMobile ? "hidden" : "flex"
      )} style={{ perspective: "1000px" }}>
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

      {/* Mobile Horizontal Scroll */}
      <div 
        ref={scrollContainerRef}
        className={cn(
          "flex items-center h-full overflow-x-auto scrollbar-hide px-4 gap-4 cursor-grab active:cursor-grabbing",
          isMobile ? "flex" : "hidden"
        )}
        style={{ scrollSnapType: "x mandatory" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {songs.map((song, index) => {
          const isSelected = song.id === selectedSong.id
          const hasAudio = !!song.audioUrl

          return (
            <div
              key={song.id}
              className={cn(
                "flex-shrink-0 relative cursor-pointer transition-all duration-300",
                "w-48 h-48 rounded-lg overflow-hidden",
                isSelected ? "ring-4 ring-orange-500 scale-105" : "hover:scale-102"
              )}
              style={{ scrollSnapAlign: "center" }}
              onClick={() => handleSongClick(song, index)}
            >
              <Image
                src={song.image}
                alt={song.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 192px, 256px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {isSelected && hasAudio && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-8 h-8 p-0 bg-black/50 hover:bg-black/70 border-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRestart()
                    }}
                  >
                    <SkipBackIcon className="w-3 h-3 text-white" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-8 h-8 p-0 bg-black/50 hover:bg-black/70 border-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onTogglePlayPause()
                    }}
                  >
                    {isPlaying ? (
                      <PauseIcon className="w-3 h-3 text-white" />
                    ) : (
                      <PlayIcon className="w-3 h-3 text-white" />
                    )}
                  </Button>
                </div>
              )}

              <div className="absolute bottom-2 left-2 right-2 text-white">
                <h3 className="font-bold text-sm mb-1 text-balance">{song.title}</h3>
                <p className="text-xs opacity-90 text-balance">{song.artist}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop indicators only */}
      <div className={cn(
        "absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 gap-2",
        isMobile ? "hidden" : "flex"
      )}>
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
