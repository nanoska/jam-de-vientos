"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ProtectedRoute } from "@/components/admin/protected-route"
import { FileUpload } from "@/components/admin/file-upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Music } from "lucide-react"
import Link from "next/link"
import { getThemes, type Theme } from "@/lib/file-manager"

export default function UploadPage() {
  const searchParams = useSearchParams()
  const [themes, setThemes] = useState<Theme[]>([])
  const [selectedThemeId, setSelectedThemeId] = useState<string>("")

  useEffect(() => {
    const loadedThemes = getThemes()
    setThemes(loadedThemes)

    const themeParam = searchParams.get("theme")
    if (themeParam && loadedThemes.find((t) => t.id === themeParam)) {
      setSelectedThemeId(themeParam)
    } else if (loadedThemes.length > 0) {
      setSelectedThemeId(loadedThemes[0].id)
    }
  }, [searchParams])

  const selectedTheme = themes.find((theme) => theme.id === selectedThemeId)

  const handleUploadComplete = (files: any[]) => {
    console.log("[v0] Upload completed for theme:", selectedTheme?.title, files)
    // Refresh themes to show updated file counts
    setThemes(getThemes())
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16 space-x-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Subir Archivos</h1>
                  <p className="text-sm text-gray-500">Gestión de audio y partituras</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Theme Selection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Seleccionar Tema</CardTitle>
              <CardDescription>Elige el tema al que quieres subir archivos</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedThemeId} onValueChange={setSelectedThemeId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un tema" />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id}>
                      {theme.title} - {theme.artist} ({theme.key})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedTheme && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">{selectedTheme.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">Por: {selectedTheme.artist}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{selectedTheme.key}</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{selectedTheme.tempo}</span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      {selectedTheme.files.length} archivos
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* File Upload */}
          {selectedTheme && <FileUpload themeId={selectedTheme.id} onUploadComplete={handleUploadComplete} />}
        </div>
      </div>
    </ProtectedRoute>
  )
}
