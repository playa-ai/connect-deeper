# Connection - NYE Intention App

## Overview

A mobile-first web application called "Connection" that facilitates meaningful in-person conversations at events. The app captures participants' 2026 intentions, records short conversation audio, and collects feedback through an NPS score. It's designed for hosts at events (like NYE parties) to approach guests, have verbal conversations about intentions, then use the app to capture and deepen connections through recorded questions.

The core user flow is: Verbal Hook → Intention Capture → Consent + Vibe Selection → Audio Recording (3 Questions) → Success + NPS Feedback.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **Styling**: Tailwind CSS v4 with shadcn/ui component library (New York style)
- **State Management**: React Context (ConnectionContext for flow state)
- **Animations**: Framer Motion for page transitions and UI effects
- **Forms**: React Hook Form with Zod validation
- **Data Fetching**: TanStack React Query

### Backend Architecture
- **Runtime**: Node.js with Express
- **API Style**: RESTful JSON API
- **Build Tool**: Vite for client, esbuild for server bundling
- **Development**: tsx for TypeScript execution

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Migrations**: Drizzle Kit with `db:push` command
- **Audio Storage**: Base64 encoded in database text field (MVP approach)

### Key Design Patterns
- **Monorepo Structure**: Client (`client/`), server (`server/`), shared types (`shared/`)
- **Path Aliases**: `@/` for client src, `@shared/` for shared code
- **Type Safety**: Drizzle-Zod for database schema to Zod validation
- **PWA Support**: Service worker, manifest.json, and offline caching

### Application Flow
1. Home page with hero and CTA
2. Intention capture with optional speech-to-text
3. Consent screen with vibe depth slider (determines question set)
4. Audio recording with wake lock to prevent screen sleep
5. Results page with NPS feedback and poster generation

## External Dependencies

### Database
- **PostgreSQL**: Required via `DATABASE_URL` environment variable
- **Connection**: Uses `pg` Pool with Drizzle ORM

### Browser APIs Used
- **MediaRecorder API**: For audio recording
- **Web Speech API**: Optional speech-to-text for intention capture
- **Wake Lock API**: Keeps screen on during recording
- **Service Worker**: PWA offline support

### Third-Party Services
- None required for MVP - self-contained application

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `@tanstack/react-query`: Server state management
- `framer-motion`: Animations
- `react-hook-form` / `zod`: Form handling and validation
- `wouter`: Client-side routing
- Radix UI primitives: Accessible UI components via shadcn/ui