# Playa AI - Connection Experiment

## Overview

A mobile-first web application branded as "A connection experiment by Playa AI" (playa-ai.org) that facilitates meaningful conversations exploring personal intentions. The app features a streamlined onboarding with a hook question, a 2D vibe picker for conversation tone, recorded audio Q&A, and AI-generated oracle card insights.

The core user flow is: Hook (intention chip selection) → Explain → Vibe Picker → Eye Contact (presence moment) → Audio Recording (4 Questions) → Oracle Card Results + NPS Feedback.

Privacy-first messaging throughout with link to playa-ai.org/privacy before users start the flow.

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
1. Hook page (/) - "What matters most right now?" with quick-tap chips (Growth, Love, Health, Career, Adventure, Peace) + "Let's go deeper" CTA
2. Explain (/explain) - "Here's what you're about to do" with 3 steps: pick vibe, answer prompts, get insight + privacy policy link
3. Consent + Vibe (/consent) - 2D vibe picker with 4 quadrants and "Balance" center state + privacy policy link
4. Eye Contact (/presence) - "Put the phone down and look into each other's eyes" interstitial
5. Recording (/recording) - 4 questions (intention first, then 3 vibe-based), with mic positioning tip
6. Results (/results) - Oracle card experience with keyword, headline, tagline, AI poster, and "Turn the Card" follow-up section
7. Shareable link (/connection/:id) - Public oracle card results page with NPS feedback

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
- **Intention Extraction**: Summarizes guest's intention from first answer
- **Insights**: Generates encouraging summary of conversation
- **Oracle Card Generation**: 
  - Extracts key evocative word (BLOOM, FLOW, IGNITE, etc.)
  - Generates mystical headline + tagline
  - Creates 9:16 oracle card poster with integrated typography
- **Follow-up Suggestions**: "Ask Yourself" question and "Your Quest" action item styled as back of oracle card

### Third-Party Services
- None required for MVP - self-contained application

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `@tanstack/react-query`: Server state management
- `framer-motion`: Animations
- `react-hook-form` / `zod`: Form handling and validation
- `wouter`: Client-side routing
- Radix UI primitives: Accessible UI components via shadcn/ui