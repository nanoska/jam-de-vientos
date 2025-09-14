"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/admin/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Music,
  Upload,
  FileText,
  Volume2,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Home,
  ExternalLink,
  Menu,
  ImageIcon,
  Save,
  X,
} from "lucide-react"
import Link from "next/link"
import { getThemes, addTheme, type Theme } from "@/lib/file-manager"

interface NewSong {
  title: string
  artist: string
  key: string
  tempo: string
  structure: string
  description: string
  image: File | null
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [selectedSong, setSelectedSong] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showNewSongForm, setShowNewSongForm] = useState(false)
  const [newSong, setNewSong] = useState<NewSong>({
    title: "",
    artist: "",
    key: "",
    tempo: "",
    structure: "",
    description: "",
    image: null,
  })
  const [themes, setThemes] = useState<Theme[]>([])

  useEffect(() => {
    setThemes(getThemes())
  }, [])

  const handleLogout = () => {
    logout()
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewSong((prev) => ({ ...prev, image: file }))
    }
  }

  const handleCreateSong = () => {
    if (newSong.title && newSong.artist && newSong.key) {
      let imageUrl = "/placeholder-442ix.png"
      if (newSong.image) {
        imageUrl = URL.createObjectURL(newSong.image)
      }

      const newTheme = addTheme({
        title: newSong.title,
        artist: newSong.artist,
        image: imageUrl,
        key: newSong.key,
        tempo: newSong.tempo || "120 BPM",
        structure: newSong.structure || "Intro - A - B - A - B - Outro",
        description: newSong.description || "Nuevo tema agregado al repertorio.",
        files: [],
      })

      setThemes(getThemes())
      setNewSong({ title: "", artist: "", key: "", tempo: "", structure: "", description: "", image: null })
      setShowNewSongForm(false)

      console.log("[v0] New theme created:", newTheme)
    }
  }

  const handleDeleteSong = (themeId: string) => {
    // In a real implementation, you would delete from the file manager
    console.log("[v0] Theme deleted:", themeId)
  }

  const totalSongs = themes.length
  const songsWithAudio = themes.filter((t) => t.files.some((f) => f.type === "audio")).length
  const totalSheets = themes.reduce((acc, t) => acc + t.files.filter((f) => f.type === "pdf").length, 0)

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">Jam de Vientos</p>
                </div>
              </div>

              <div className="flex items-center">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="sm:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="hidden sm:flex items-center space-x-2 md:space-x-4">
                  <Link href="/">
                    <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
                      <Home className="w-4 h-4" />
                      <span>Ver Sitio</span>
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </Link>

                  <span className="text-sm text-gray-600">Bienvenido, {user?.email}</span>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 bg-transparent"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Salir</span>
                  </Button>
                </div>
              </div>
            </div>

            {isMobileMenuOpen && (
              <div className="sm:hidden border-t bg-white py-3 space-y-2">
                <Link href="/" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <Home className="w-4 h-4 mr-2" />
                    Ver Sitio
                  </Button>
                </Link>
                <div className="px-3 py-2 text-sm text-gray-600">Bienvenido, {user?.email}</div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-transparent"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            )}
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Music className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium text-gray-600">Temas:</span>
                  <span className="text-lg font-bold text-gray-900">{totalSongs}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-600">Con Audio:</span>
                  <span className="text-lg font-bold text-gray-900">{songsWithAudio}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-600">Partituras:</span>
                  <span className="text-lg font-bold text-gray-900">{totalSheets}</span>
                </div>
              </div>
              <Button onClick={() => setShowNewSongForm(true)} className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Tema
              </Button>
            </div>
          </div>

          {showNewSongForm && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Crear Nuevo Tema</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowNewSongForm(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <CardDescription>
                  Completa la información del nuevo tema. La imagen recomendada es de 400x300px para mejor
                  visualización.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Título del Tema</Label>
                    <Input
                      id="title"
                      value={newSong.title}
                      onChange={(e) => setNewSong((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Ej: Police Woman"
                    />
                  </div>
                  <div>
                    <Label htmlFor="artist">Artista</Label>
                    <Input
                      id="artist"
                      value={newSong.artist}
                      onChange={(e) => setNewSong((prev) => ({ ...prev, artist: e.target.value }))}
                      placeholder="Ej: The Skatalites"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="key">Tonalidad</Label>
                    <Select
                      value={newSong.key}
                      onValueChange={(value) => setNewSong((prev) => ({ ...prev, key: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la tonalidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="C Major">C Mayor</SelectItem>
                        <SelectItem value="Db Major">Db Mayor</SelectItem>
                        <SelectItem value="D Major">D Mayor</SelectItem>
                        <SelectItem value="Eb Major">Eb Mayor</SelectItem>
                        <SelectItem value="E Major">E Mayor</SelectItem>
                        <SelectItem value="F Major">F Mayor</SelectItem>
                        <SelectItem value="F# Major">F# Mayor</SelectItem>
                        <SelectItem value="G Major">G Mayor</SelectItem>
                        <SelectItem value="Ab Major">Ab Mayor</SelectItem>
                        <SelectItem value="A Major">A Mayor</SelectItem>
                        <SelectItem value="Bb Major">Bb Mayor</SelectItem>
                        <SelectItem value="B Major">B Mayor</SelectItem>
                        <SelectItem value="A Minor">A menor</SelectItem>
                        <SelectItem value="B Minor">B menor</SelectItem>
                        <SelectItem value="C Minor">C menor</SelectItem>
                        <SelectItem value="D Minor">D menor</SelectItem>
                        <SelectItem value="E Minor">E menor</SelectItem>
                        <SelectItem value="F Minor">F menor</SelectItem>
                        <SelectItem value="G Minor">G menor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tempo">Tempo</Label>
                    <Input
                      id="tempo"
                      value={newSong.tempo}
                      onChange={(e) => setNewSong((prev) => ({ ...prev, tempo: e.target.value }))}
                      placeholder="Ej: 120 BPM"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="structure">Estructura</Label>
                  <Input
                    id="structure"
                    value={newSong.structure}
                    onChange={(e) => setNewSong((prev) => ({ ...prev, structure: e.target.value }))}
                    placeholder="Ej: Intro - A - B - A - B - Solo - Outro"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={newSong.description}
                    onChange={(e) => setNewSong((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe el estilo, características y contexto del tema"
                  />
                </div>

                <div>
                  <Label htmlFor="image">Imagen del Tema</Label>
                  <div className="flex items-center space-x-2">
                    <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} className="flex-1" />
                    <div className="text-xs text-gray-500 whitespace-nowrap">Recomendado: 400x300px</div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowNewSongForm(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateSong}
                    className="bg-orange-500 hover:bg-orange-600"
                    disabled={!newSong.title || !newSong.artist || !newSong.key}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Crear Tema
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Archivos por Tema</CardTitle>
                <CardDescription>Administra audio, partituras e imágenes para cada tema musical</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {themes.map((theme) => (
                    <div
                      key={theme.id}
                      className={`p-4 border rounded-lg transition-all ${
                        selectedSong === theme.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{theme.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {theme.key}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{theme.artist}</p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <div className="flex items-center space-x-2">
                              <ImageIcon className="w-4 h-4 text-purple-500" />
                              <Badge
                                variant={theme.image !== "/placeholder.svg" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {theme.image !== "/placeholder.svg" ? "Imagen ✓" : "Sin Imagen"}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Volume2 className="w-4 h-4 text-green-500" />
                              <Badge
                                variant={theme.files.some((f) => f.type === "audio") ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {theme.files.some((f) => f.type === "audio") ? "Audio ✓" : "Sin Audio"}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-blue-500" />
                              <Badge
                                variant={theme.files.some((f) => f.type === "pdf") ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {theme.files.some((f) => f.type === "pdf")
                                  ? `${theme.files.filter((f) => f.type === "pdf").length} PDFs`
                                  : "Sin PDFs"}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500">ID: {theme.id}</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link href={`/admin/upload?theme=${theme.id}`}>
                            <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                              <Upload className="w-4 h-4 mr-1" />
                              Subir
                            </Button>
                          </Link>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                            onClick={() => handleDeleteSong(theme.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
