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
  Home,
  ExternalLink,
  Menu,
  ImageIcon,
  X,
  Search,
  Eye,
  EyeOff,
  Calendar as CalendarIcon,
  MapPin as MapPinIcon,
} from "lucide-react"
import Link from "next/link"
import { sheetMusicAPI, type SheetMusicEvent, type SheetMusicVersion } from "@/lib/sheetmusic-api"
import { SheetMusicFileUpload } from "@/components/admin/sheetmusic-file-upload"
import { ThemeToggle } from "@/components/ui/theme-toggle"

// Event Selection View Component
function EventSelectionView({
  availableEvents,
  isLoadingEvents,
  selectedEvent,
  onEventSelection,
  showEventRepertoire,
  onToggleRepertoire,
  onToggleVersionVisibility,
  isUpdating
}: {
  availableEvents: SheetMusicEvent[]
  isLoadingEvents: boolean
  selectedEvent: SheetMusicEvent | null
  onEventSelection: (eventId: string) => void
  showEventRepertoire: boolean
  onToggleRepertoire: (show: boolean) => void
  onToggleVersionVisibility: (versionId: number, currentVisibility: boolean) => void
  isUpdating: Record<string, boolean>
}) {
  return (
    <div className="space-y-6">
      {/* Event Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle>Selección de Evento para Frontend</CardTitle>
          <CardDescription>
            Elige el evento que se mostrará en el frontend. Los temas del repertorio aparecerán en el carousel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Event Selector */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="flex-1 max-w-md">
                <Label htmlFor="event-select" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Evento Activo
                </Label>
                <Select
                  value={selectedEvent?.id.toString() || 'none'}
                  onValueChange={onEventSelection}
                  disabled={isLoadingEvents}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingEvents ? "Cargando eventos..." : "Selecciona un evento"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ningún evento (usar gestión local)</SelectItem>
                    {Array.isArray(availableEvents) && availableEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id.toString()}>
                        {event.title} - {new Date(event.start_datetime).toLocaleDateString('es-AR')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleRepertoire(!showEventRepertoire)}
                  disabled={!selectedEvent}
                  className="shrink-0"
                >
                  {showEventRepertoire ? 'Ocultar' : 'Ver'} Repertorio
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Info Display */}
      {selectedEvent && (
        <Card>
          <CardHeader>
            <CardTitle>Información del Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{selectedEvent.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedEvent.description}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">
                      {new Date(selectedEvent.start_datetime).toLocaleDateString('es-AR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {selectedEvent.location && (
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-red-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{selectedEvent.location.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {selectedEvent.location.address}, {selectedEvent.location.city}, {selectedEvent.location.country}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedEvent.location_name && selectedEvent.location_city && !selectedEvent.location && (
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-red-500" />
                      <span className="text-sm">{selectedEvent.location_name}, {selectedEvent.location_city}</span>
                    </div>
                  )}

                  {selectedEvent.repertoire && (
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">
                        Repertorio: {selectedEvent.repertoire.name} ({selectedEvent.repertoire.versions.length} temas)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {/* Google Maps Link */}
                {(selectedEvent.location || (selectedEvent.location_name && selectedEvent.location_city)) && (
                  <Link
                    href={
                      selectedEvent.location
                        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedEvent.location.name}, ${selectedEvent.location.address}, ${selectedEvent.location.city}, ${selectedEvent.location.country}`)}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedEvent.location_name}, ${selectedEvent.location_city}`)}`
                    }
                    target="_blank"
                    className="inline-block"
                  >
                    <Button size="sm" variant="outline" className="w-full text-blue-600 border-blue-300 hover:bg-blue-50">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir en Google Maps
                    </Button>
                  </Link>
                )}

                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <strong>Estado:</strong> {selectedEvent.status === 'CONFIRMED' ? 'Confirmado' : selectedEvent.status}
                  <br />
                  <strong>Tipo:</strong> {selectedEvent.event_type === 'CONCERT' ? 'Concierto' : selectedEvent.event_type}
                  <br />
                  <strong>Público:</strong> {selectedEvent.is_public ? 'Sí' : 'No'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Repertoire Display with File Status Warnings */}
      {showEventRepertoire && selectedEvent?.repertoire && (
        <Card>
          <CardHeader>
            <CardTitle>Repertorio del Evento</CardTitle>
            <CardDescription>
              Gestiona qué temas serán visibles en el frontend. Los avisos indican el estado de los archivos - ve a "Partituras" para completar archivos faltantes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedEvent.repertoire.versions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No hay temas en este repertorio
                </div>
              ) : (
                selectedEvent.repertoire.versions.map((version) => {
                  // Calculate file status warnings
                  const warnings = []
                  if (!version.image) warnings.push('Sin imagen')
                  if (!version.audio) warnings.push('Sin audio')
                  if (version.sheet_music_count === 0) warnings.push('Sin partituras')

                  return (
                    <div
                      key={version.id}
                      className={`p-3 sm:p-4 border rounded-lg transition-all ${
                        version.is_visible !== false
                          ? "border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20"
                          : "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{version.theme_title}</h3>
                            <Badge variant="outline" className="text-xs w-fit">
                              {version.tonalidad}
                            </Badge>
                            <Badge
                              variant={version.is_visible !== false ? "default" : "secondary"}
                              className="text-xs w-fit"
                            >
                              {version.is_visible !== false ? "Visible" : "Oculto"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 truncate">{version.artist}</p>

                          {/* File Status Warnings */}
                          {warnings.length > 0 && (
                            <div className="mb-3 p-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-600 rounded text-xs">
                              <strong className="text-yellow-800 dark:text-yellow-200">⚠️ Archivos faltantes:</strong>
                              <ul className="mt-1 text-yellow-700 dark:text-yellow-300">
                                {warnings.map((warning, index) => (
                                  <li key={index}>• {warning}</li>
                                ))}
                              </ul>
                              <p className="mt-1 text-yellow-600 dark:text-yellow-400 font-medium">
                                Ve a "Partituras" para completar archivos
                              </p>
                            </div>
                          )}

                          {/* Version indicators */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="flex items-center space-x-1">
                              <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 shrink-0" />
                              <Badge
                                variant={version.image ? "default" : "secondary"}
                                className="text-xs truncate"
                              >
                                {version.image ? "Img" : "Sin Img"}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 shrink-0" />
                              <Badge
                                variant={version.audio ? "default" : "secondary"}
                                className="text-xs truncate"
                              >
                                {version.audio ? "Audio" : "Sin Audio"}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 shrink-0" />
                              <Badge
                                variant={version.sheet_music_count > 0 ? "default" : "secondary"}
                                className="text-xs truncate"
                              >
                                {version.sheet_music_count > 0
                                  ? `${version.sheet_music_count} PDF`
                                  : "Sin PDF"}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons for event versions */}
                        <div className="flex items-center justify-end space-x-1 sm:space-x-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`relative ${
                              version.is_visible !== false
                                ? "text-green-600 hover:text-green-700"
                                : "text-red-600 hover:text-red-700"
                            }`}
                            onClick={() => onToggleVersionVisibility(version.id, version.is_visible !== false)}
                            title={version.is_visible !== false ? 'Ocultar en el frontend' : 'Mostrar en el frontend'}
                            disabled={isUpdating[version.id.toString()]}
                          >
                            {isUpdating[version.id.toString()] ? (
                              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : version.is_visible !== false ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </Button>
                          {version.audio && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const audio = new Audio(version.audio)
                                audio.play().catch(() => {})
                              }}
                              className="p-2 sm:px-3"
                              title="Reproducir audio"
                            >
                              <Volume2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Sheet Music Management View Component
function SheetMusicManagementView({
  selectedEvent,
  searchTerm,
  onSearchChange,
  onToggleVersionVisibility,
  isUpdating,
  selectedVersion,
  setSelectedVersion,
  onUploadComplete
}: {
  selectedEvent: SheetMusicEvent | null
  searchTerm: string
  onSearchChange: (term: string) => void
  onToggleVersionVisibility: (versionId: number, currentVisibility: boolean) => void
  isUpdating: Record<string, boolean>
  selectedVersion: string | null
  setSelectedVersion: (versionId: string | null) => void
  onUploadComplete: () => void
}) {
  if (!selectedEvent || !selectedEvent.repertoire) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Partituras</CardTitle>
            <CardDescription>
              Selecciona un evento en la vista de "Eventos" para gestionar las partituras de su repertorio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No hay evento seleccionado</p>
              <p className="text-sm">Ve a la sección "Eventos" y selecciona un evento para gestionar sus partituras.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredVersions = selectedEvent.repertoire.versions.filter((version) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      version.theme_title.toLowerCase().includes(searchLower) ||
      version.artist.toLowerCase().includes(searchLower) ||
      version.tonalidad.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      {/* Search Bar for Sheet Music Management */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar por tema o compositor..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2"
            />
          </div>
          <div className="text-sm text-gray-600">
            {selectedEvent.title} - {filteredVersions.length} tema{filteredVersions.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      {selectedVersion && (
        <div className="space-y-4">
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-orange-900 dark:text-orange-200">
                  Subiendo archivos para: {selectedEvent.repertoire?.versions.find(v => v.id.toString() === selectedVersion)?.theme_title}
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Artista: {selectedEvent.repertoire?.versions.find(v => v.id.toString() === selectedVersion)?.artist}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedVersion(null)}
              >
                <X className="w-4 h-4 mr-1" />
                Cerrar
              </Button>
            </div>
          </div>
          <SheetMusicFileUpload
            versionId={selectedVersion}
            onUploadComplete={onUploadComplete}
          />
        </div>
      )}

      {/* Versions Management */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Archivos por Versión</CardTitle>
          <CardDescription>
            Administra archivos para las versiones del repertorio de "{selectedEvent.title}".
            Usa los botones para subir archivos o editar las versiones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredVersions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? `No se encontraron versiones que coincidan con "${searchTerm}"` : "No hay versiones disponibles en este repertorio"}
              </div>
            ) : (
              filteredVersions.map((version) => (
                <div
                  key={version.id}
                  className={`p-3 sm:p-4 border rounded-lg transition-all ${
                    selectedVersion === version.id.toString()
                      ? "border-orange-500 bg-orange-50 dark:border-orange-400 dark:bg-orange-900/20"
                      : version.is_visible !== false
                      ? "border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20"
                      : "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{version.theme_title}</h3>
                        <Badge variant="outline" className="text-xs w-fit">
                          {version.tonalidad}
                        </Badge>
                        <Badge
                          variant={version.is_visible !== false ? "default" : "secondary"}
                          className="text-xs w-fit"
                        >
                          {version.is_visible !== false ? "Visible" : "Oculto"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 truncate">{version.artist}</p>

                      {/* Version status indicators */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div className="flex items-center space-x-1">
                          <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 shrink-0" />
                          <Badge
                            variant={version.image ? "default" : "secondary"}
                            className="text-xs truncate"
                          >
                            {version.image ? "Img" : "Sin Img"}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 shrink-0" />
                          <Badge
                            variant={version.audio ? "default" : "secondary"}
                            className="text-xs truncate"
                          >
                            {version.audio ? "Audio" : "Sin Audio"}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 shrink-0" />
                          <Badge
                            variant={version.sheet_music_count > 0 ? "default" : "secondary"}
                            className="text-xs truncate"
                          >
                            {version.sheet_music_count > 0
                              ? `${version.sheet_music_count} PDF`
                              : "Sin PDF"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end space-x-1 sm:space-x-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`relative ${
                          version.is_visible !== false
                            ? "text-green-600 hover:text-green-700"
                            : "text-red-600 hover:text-red-700"
                        }`}
                        onClick={() => onToggleVersionVisibility(version.id, version.is_visible !== false)}
                        title={version.is_visible !== false ? 'Ocultar en el frontend' : 'Mostrar en el frontend'}
                        disabled={isUpdating[version.id.toString()]}
                      >
                        {isUpdating[version.id.toString()] ? (
                          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : version.is_visible !== false ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 p-2 sm:px-3"
                        onClick={() => setSelectedVersion(selectedVersion === version.id.toString() ? null : version.id.toString())}
                        title="Subir archivos"
                      >
                        <Upload className="w-4 h-4" />
                        <span className="hidden sm:inline sm:ml-1">Subir</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="p-2 sm:px-3"
                        title="Editar versión"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline sm:ml-1">Editar</span>
                      </Button>
                      {version.audio && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const audio = new Audio(version.audio)
                            audio.play().catch(() => {})
                          }}
                          className="p-2 sm:px-3"
                          title="Reproducir audio"
                        >
                          <Volume2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({})
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Navigation state
  type DashboardView = 'event-selection' | 'sheet-music-management'
  const [currentView, setCurrentView] = useState<DashboardView>('event-selection')

  // SheetMusic API integration state
  const [selectedEvent, setSelectedEvent] = useState<SheetMusicEvent | null>(null)
  const [availableEvents, setAvailableEvents] = useState<SheetMusicEvent[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [showEventRepertoire, setShowEventRepertoire] = useState(false)

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoadingEvents(true)
      try {
        // Load all events and upcoming event separately
        const [allEventsResponse, upcomingResponse] = await Promise.all([
          sheetMusicAPI.getEvents(),
          sheetMusicAPI.getUpcomingEvents()
        ])

        // Handle both array response and object with events property
        const events = Array.isArray(allEventsResponse) ? allEventsResponse : ((allEventsResponse as any).events || [])
        setAvailableEvents(events)

        // Auto-select the first upcoming event if available
        const upcomingEvents = Array.isArray(upcomingResponse) ? upcomingResponse : ((upcomingResponse as any).events || [])
        if (upcomingEvents.length > 0) {
          const activeEvent = upcomingEvents[0]
          setSelectedEvent(activeEvent)
          setShowEventRepertoire(true)
          // Save to localStorage so main page can use it
          localStorage.setItem('jamdevientos-featured-event-id', activeEvent.id.toString())
        }
      } catch (error) {
        // Failed to load events from SheetMusic API
        setAvailableEvents([]) // Set empty array on error
      } finally {
        setIsLoadingEvents(false)
      }
    }

    loadEvents()
  }, [])

  const handleLogout = () => {
    logout()
  }

  // Handle event selection
  const handleEventSelection = async (eventId: string) => {
    if (!eventId || eventId === 'none') {
      setSelectedEvent(null)
      setShowEventRepertoire(false)
      // Remove featured event from localStorage
      localStorage.removeItem('jamdevientos-featured-event-id')
      return
    }

    try {
      const event = await sheetMusicAPI.getEventDetail(parseInt(eventId))
      setSelectedEvent(event)
      setShowEventRepertoire(true)

      // Save selected event ID to localStorage so main page can use it
      localStorage.setItem('jamdevientos-featured-event-id', eventId)
    } catch (error) {
      alert('Error al cargar los detalles del evento')
    }
  }

  // Toggle version visibility for SheetMusic versions
  const toggleVersionVisibility = async (versionId: number, currentVisibility: boolean) => {
    const newVisibility = !currentVisibility

    // Optimistic UI update
    if (selectedEvent?.repertoire) {
      const updatedEvent = {
        ...selectedEvent,
        repertoire: {
          ...selectedEvent.repertoire,
          versions: selectedEvent.repertoire.versions.map(version =>
            version.id === versionId
              ? { ...version, is_visible: newVisibility }
              : version
          )
        }
      }
      setSelectedEvent(updatedEvent)
    }

    // Set loading state
    setIsUpdating(prev => ({ ...prev, [versionId.toString()]: true }))

    try {
      await sheetMusicAPI.updateVersionVisibility(versionId, newVisibility)
    } catch (error) {
      // Revert on error
      if (selectedEvent?.repertoire) {
        const revertedEvent = {
          ...selectedEvent,
          repertoire: {
            ...selectedEvent.repertoire,
            versions: selectedEvent.repertoire.versions.map(version =>
              version.id === versionId
                ? { ...version, is_visible: currentVisibility }
                : version
            )
          }
        }
        setSelectedEvent(revertedEvent)
      }
    } finally {
      setIsUpdating(prev => ({ ...prev, [versionId.toString()]: false }))
    }
  }

  // Handle upload complete
  const handleUploadComplete = async () => {
    try {
      // Reload event details to reflect changes
      if (selectedEvent) {
        const refreshedEvent = await sheetMusicAPI.getEventDetail(selectedEvent.id)
        setSelectedEvent(refreshedEvent)
      }
    } catch (error) {
      // Failed to refresh event after upload
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-950 shadow-sm border-b dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left: Logo and Title */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Jam de Vientos</p>
                </div>
                <div className="sm:hidden">
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Admin</h1>
                </div>
              </div>

              {/* Center: Navigation Menu (Desktop only) */}
              <div className="hidden md:flex items-center space-x-1 border dark:border-gray-700 rounded-lg p-1 bg-gray-50 dark:bg-gray-800">
                <Button
                  variant={currentView === 'event-selection' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentView('event-selection')}
                  className="flex items-center gap-1 px-3"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Eventos</span>
                </Button>
                <Button
                  variant={currentView === 'sheet-music-management' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentView('sheet-music-management')}
                  className="flex items-center gap-1 px-3"
                >
                  <FileText className="w-4 h-4" />
                  <span>Partituras</span>
                </Button>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center space-x-2">
                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* Desktop actions */}
                <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
                  <ThemeToggle />

                  <Link href="/">
                    <Button variant="outline" size="sm" className="flex items-center space-x-1 lg:space-x-2 bg-transparent">
                      <Home className="w-4 h-4" />
                      <span className="hidden lg:inline">Ver Sitio</span>
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </Link>

                  <span className="hidden xl:inline text-sm text-gray-600 dark:text-gray-300">Bienvenido, {user?.email}</span>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1 lg:space-x-2 bg-transparent"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">Salir</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
              <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 py-3 space-y-2">
                {/* Navigation tabs for mobile */}
                <div className="px-3 pb-3 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center space-x-1 border dark:border-gray-700 rounded-lg p-1 bg-gray-50 dark:bg-gray-800">
                    <Button
                      variant={currentView === 'event-selection' ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setCurrentView('event-selection')
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3"
                    >
                      <CalendarIcon className="w-4 h-4" />
                      <span>Eventos</span>
                    </Button>
                    <Button
                      variant={currentView === 'sheet-music-management' ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setCurrentView('sheet-music-management')
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Partituras</span>
                    </Button>
                  </div>
                </div>

                <div className="px-3">
                  <ThemeToggle />
                </div>

                <Link href="/" className="block px-3">
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <Home className="w-4 h-4 mr-2" />
                    Ver Sitio
                  </Button>
                </Link>

                <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">Bienvenido, {user?.email}</div>

                <div className="px-3">
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
              </div>
            )}
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Render views based on current view */}
          {currentView === 'event-selection' ? (
            <EventSelectionView
              availableEvents={availableEvents}
              isLoadingEvents={isLoadingEvents}
              selectedEvent={selectedEvent}
              onEventSelection={handleEventSelection}
              showEventRepertoire={showEventRepertoire}
              onToggleRepertoire={setShowEventRepertoire}
              onToggleVersionVisibility={toggleVersionVisibility}
              isUpdating={isUpdating}
            />
          ) : (
            <SheetMusicManagementView
              selectedEvent={selectedEvent}
              searchTerm={searchTerm}
              onSearchChange={(term) => setSearchTerm(term)}
              onToggleVersionVisibility={toggleVersionVisibility}
              isUpdating={isUpdating}
              selectedVersion={selectedVersion}
              setSelectedVersion={setSelectedVersion}
              onUploadComplete={handleUploadComplete}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}