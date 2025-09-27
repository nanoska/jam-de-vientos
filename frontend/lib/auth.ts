export interface User {
  id: string
  email: string
  role: "admin" | "user"
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Simple authentication - will be replaced with SheetMusic API authentication
export const AUTH_STORAGE_KEY = "jam-admin-auth"

export const authService = {
  login: async (email: string, password: string): Promise<User | null> => {
    // TODO: Replace with SheetMusic API authentication
    // For now, using simple hardcoded credentials
    if (email === "admin@jamdevientos.com" && password === "admin123") {
      const user: User = {
        id: "1",
        email: "admin@jamdevientos.com",
        role: "admin",
      }
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      return user
    }
    return null
  },

  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    // TODO: Add SheetMusic API logout if needed
  },

  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null

    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  },

  isAdmin: (user: User | null): boolean => {
    return user?.role === "admin"
  },
}
