# Playa AI - Connection Experiment

## Overview

A mobile-first web application branded as "A connection experiment by Playa AI" (playa-ai.org) that facilitates meaningful conversations exploring 2026 intentions. The app features a streamlined onboarding with a hook question, a 2D vibe picker for conversation tone, recorded audio Q&A, and AI-generated insights.

The core user flow is: Hook (intention chip selection) → Explain (what you'll do) → 2D Vibe Picker → Audio Recording (4 Questions) → Results + NPS Feedback.

Privacy-first messaging throughout: "Private by default. Nothing shared without permission."

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
1. Hook page (/) - "What's your intention for 2026?" with quick-tap chips (Growth, Love, Health, Career, Adventure, Peace) + "60-second experiment" CTA
2. Explain (/explain) - "Here's what you're about to do" with 3 steps: pick vibe, answer prompts, get insight
3. Consent + Vibe (/consent) - 2D vibe picker with 4 quadrants: Playful & Warm, Deep & Intimate, Playful & Curious, Deep & Philosophical
4. Recording (/recording) - 4 questions (intention first, then 3 vibe-based), with mic positioning tip
5. Results (/results) - AI extracts intention from transcript, generates insights, poster, and follow-up suggestions
6. Shareable link (/connection/:id) - Public results page with NPS feedback

## External Dependencies

### Database
- **PostgreSQL**: Required via `DATABASE_URL` environment variable
- **Connection**: Uses `pg` Pool with Drizzle ORM

### Browser APIs Used
- **MediaRecorder API**: For audio recording
- **Wake Lock API**: Keeps screen on during recording
- **Service Worker**: PWA offline support

### AI Features (Gemini)
- **Transcription**: Converts recorded audio to text
- **Intention Extraction**: Summarizes guest's 2026 intention from first answer
- **Insights**: Generates encouraging summary of conversation
- **Poster**: Creates AI-generated memory poster
- **Follow-up Suggestions**: Generates deeper questions, topics to explore, and action items

### Third-Party Services
- None required for MVP - self-contained application

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `@tanstack/react-query`: Server state management
- `framer-motion`: Animations
- `react-hook-form` / `zod`: Form handling and validation
- `wouter`: Client-side routing
- Radix UI primitives: Accessible UI components via shadcn/ui