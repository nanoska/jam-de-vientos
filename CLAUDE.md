# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jam de Vientos is a Next.js 14 music collaboration platform that integrates with the SheetMusic API for managing musical events, repertoires, and sheet music. The application features both a public-facing carousel interface and an admin dashboard for content management.

## Architecture

### Directory Structure

The project uses a clean structure with the active codebase in `/frontend`:
- **`/frontend` directory**: Active Next.js application with SheetMusic API integration
- **`/legacy` directory**: Old codebase using local file-manager (preserved for reference only, not tracked in git)

**IMPORTANT**: All development work should be done in the `/frontend` directory. The `/legacy` folder contains the old implementation with in-memory storage and should not be modified.

### Technology Stack

- **Framework**: Next.js 14 (App Router with React Server Components)
- **Language**: TypeScript with strict mode enabled
- **UI Components**: Radix UI primitives with shadcn/ui styling pattern
- **Styling**: Tailwind CSS v4 with CSS variables and animations
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context (AuthContext)
- **External API**: SheetMusic API for events and repertoire data

### Key Architectural Patterns

#### SheetMusic API Integration

The application connects to an external SheetMusic API backend:

```typescript
// Environment configuration
NEXT_PUBLIC_SHEETMUSIC_API_URL=http://localhost:8000
```

The API client is located at `frontend/lib/sheetmusic-api.ts` and provides:
- Event management (carousel, upcoming, detail endpoints)
- Repertoire and version management
- File upload capabilities (PDFs, audio, images)
- Admin operations (visibility toggles, updates)

#### Adapter Pattern for File Uploads

The `SheetMusicUploadAdapter` (`frontend/lib/sheetmusic-upload-adapter.ts`) bridges the file upload interface with the SheetMusic API, automatically detecting file types and routing uploads correctly.

#### Dashboard-Carousel Synchronization

The admin dashboard uses `localStorage` to communicate the selected event ID to the main page carousel. This allows admins to preview which event will be displayed on the public site.

```typescript
// Set in dashboard
localStorage.setItem('selectedEventId', eventId.toString())

// Read in main page
const selectedEventId = localStorage.getItem('selectedEventId')
```

### Project Structure

```
jam-de-vientos/
├── frontend/                     # ACTIVE CODEBASE - Work here!
│   ├── app/                      # Next.js App Router pages
│   │   ├── admin/                # Admin routes (protected)
│   │   │   ├── dashboard/        # Event management interface
│   │   │   ├── login/            # Authentication page
│   │   │   └── upload/           # File upload interface
│   │   ├── globals.css           # Global styles and CSS variables
│   │   ├── layout.tsx            # Root layout with AuthProvider
│   │   └── page.tsx              # Main public page (carousel + details)
│   ├── components/
│   │   ├── admin/                # Admin-specific components
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── icons.tsx             # Custom icon components
│   │   ├── song-carousel.tsx     # Main carousel component
│   │   ├── song-details.tsx      # Song detail view with sheet music
│   │   └── theme-provider.tsx    # Dark/light mode provider
│   ├── contexts/
│   │   └── auth-context.tsx      # Authentication context and provider
│   ├── lib/
│   │   ├── auth.ts               # Authentication service (local)
│   │   ├── sheetmusic-api.ts     # SheetMusic API client
│   │   ├── sheetmusic-upload-adapter.ts  # Upload adapter
│   │   └── utils.ts              # Utility functions (cn, etc.)
│   ├── hooks/                    # Custom React hooks
│   ├── styles/                   # Additional stylesheets
│   ├── public/                   # Static assets
│   ├── package.json              # Frontend dependencies
│   └── ...config files
├── legacy/                       # OLD CODE - Reference only, not tracked in git
│   └── [old implementation]
├── node_modules/                 # Root dependencies
├── .next/                        # Build output (root level)
├── components.json               # shadcn/ui configuration
├── docker-compose.yml            # Docker configuration for development
├── Dockerfile                    # Container definition
└── CLAUDE.md                     # This file
```

## Common Development Commands

### Local Development

All development commands should be run from the `/frontend` directory:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Docker Development

**IMPORTANT**: Always use `docker compose` (V2, with space) instead of `docker-compose` (V1):

```bash
# Clean rebuild (recommended when dependencies change or after moving project)
docker compose down -v && docker compose build --no-cache && docker compose up

# Standard start with rebuild
docker compose up --build

# Run in background
docker compose up -d

# View logs
docker compose logs -f

# Stop and remove volumes (clears all caches)
docker compose down -v
```

The Docker setup:
- Builds from the `/frontend` directory
- Exposes the app on port **3001** (mapped from container port 3000)
- Connects to the external `sheetmusic_sheetmusic-network` Docker network
- Requires the SheetMusic API to be running separately
- Uses volume mounts for live code reloading (`./frontend:/app`)

### TypeScript

```bash
# Type checking (implicit in build)
npx tsc --noEmit
```

## Environment Variables

The application requires the following environment variable:

```bash
NEXT_PUBLIC_SHEETMUSIC_API_URL=http://localhost:8000
```

Create a `.env.local` file in the root directory. The SheetMusic API URL must be a `NEXT_PUBLIC_` variable to be accessible in client components.

## Authentication

The authentication system is currently local-only (stored in localStorage). The SheetMusic API integration has placeholder comments for future token-based authentication:

```typescript
// TODO: Add authentication headers when auth is implemented
// 'Authorization': `Bearer ${getAuthToken()}`
```

Default admin credentials are defined in `frontend/lib/auth.ts`.

## Key Technical Considerations

### Path Aliases

The project uses `@/*` path aliases configured in `tsconfig.json`:

```typescript
import { Button } from "@/components/ui/button"
import { sheetMusicAPI } from "@/lib/sheetmusic-api"  // Use frontend/lib when available
```

### Mobile Responsiveness

The application includes specific mobile optimizations:
- Viewport meta tags configured for mobile devices
- Samsung A01 compatibility fixes
- Touch-friendly UI components
- Responsive carousel with mobile gestures (Embla Carousel)

### Image Handling

Next.js image optimization is disabled (`unoptimized: true`) in `next.config.mjs`. Images are served directly with WebP and AVIF format support.

### Theme Support

The application supports dark/light modes via `next-themes`. Theme switching is handled by the `ThemeProvider` component and persisted to localStorage.

## Development Workflow

### Adding New API Endpoints

When adding SheetMusic API endpoints:

1. Add TypeScript interfaces to `frontend/lib/sheetmusic-api.ts`
2. Implement methods in the `SheetMusicAPI` class
3. Use the singleton instance `sheetMusicAPI` throughout the app
4. Add authentication headers when auth is implemented

### Adding UI Components

This project uses shadcn/ui components. To add new components:

```bash
# Add a specific component
npx shadcn-ui@latest add [component-name]
```

Components are configured with:
- Style: "new-york"
- Base color: "neutral"
- CSS variables enabled
- Lucide icons

### Working with Forms

Forms use React Hook Form with Zod validation:

```typescript
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  // Define schema
})

const form = useForm({
  resolver: zodResolver(schema)
})
```

## Common Issues

### Docker Cache Problems

If you encounter dependency errors after moving the project or updating packages:

```bash
docker compose down -v && docker compose build --no-cache && docker compose up
```

The `-v` flag removes volumes containing cached `node_modules`.

### SheetMusic API Connection

Ensure the SheetMusic API is running and the Docker network exists:

```bash
# Check if network exists
docker network ls | grep sheetmusic-network

# If missing, create it or start the SheetMusic API first
```

### Port Conflicts

The Docker setup uses port 3001 (not 3000) to avoid conflicts with other Next.js projects. The local development server still uses port 3000.

## Code Quality Settings

The project enforces strict TypeScript and ESLint rules:
- `typescript.ignoreBuildErrors: false` - Build fails on type errors
- `eslint.ignoreDuringBuilds: false` - Build fails on lint errors
- Console logs removed in production builds

Always fix type errors and lint warnings before committing.
