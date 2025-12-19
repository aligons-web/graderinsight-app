# GraderInsight

## Overview

GraderInsight is a web-based grading platform designed to streamline the writing assignment evaluation process for educators. The application enables bulk assignment uploads, student anonymization, customizable rubric management, and automated feedback generation using NLP. Built for professors, instructors, and teachers who need efficient grading workflows with consistent, rubric-based evaluation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **UI Component Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens defined in CSS variables
- **Build Tool**: Vite with React plugin

**Design System**: The application follows a system-based design approach optimized for productivity. Key design tokens include:
- Primary color: #894596 (purple)
- Accent color: #44e489 (green for success states)
- Font family: Poppins
- Spacing primitives: Tailwind units of 2, 4, 6, 8

### Backend Architecture

- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful endpoints under `/api` prefix
- **Session Management**: Express sessions with connect-pg-simple for PostgreSQL session storage

**Key Server Patterns**:
- Request logging middleware with timing information
- JSON body parsing with raw body preservation (for webhook verification)
- Static file serving in production, Vite dev server in development

### Data Layer

- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Validation**: Zod schemas with drizzle-zod integration
- **Migrations**: Drizzle Kit for schema migrations (`drizzle-kit push`)

**Current Schema Entities**:
- Users (id, username, password)
- Rubrics (id, name, description, criteria array, totalPoints, isTemplate)

**Storage Pattern**: The application uses an `IStorage` interface with an in-memory implementation (`MemStorage`) that can be swapped for database-backed storage.

### Build System

- **Development**: `tsx` for running TypeScript directly
- **Production Build**: 
  - Client: Vite builds to `dist/public`
  - Server: esbuild bundles to `dist/index.cjs`
- **Dependency Bundling**: Select dependencies are bundled to reduce cold start times

### Project Structure

```
├── client/           # React frontend
│   └── src/
│       ├── components/ui/  # shadcn/ui components
│       ├── pages/          # Route components
│       ├── hooks/          # Custom React hooks
│       └── lib/            # Utilities and query client
├── server/           # Express backend
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Data access layer
│   └── vite.ts       # Vite dev server integration
├── shared/           # Shared types and schemas
│   └── schema.ts     # Drizzle schema + Zod validation
└── migrations/       # Database migrations
```

### Path Aliases

- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`

## External Dependencies

### Database
- **PostgreSQL**: Primary database (configured via `DATABASE_URL` environment variable)
- **connect-pg-simple**: Session storage in PostgreSQL

### UI Components
- **Radix UI**: Headless component primitives (dialog, dropdown, tabs, etc.)
- **Lucide React**: Icon library
- **embla-carousel-react**: Carousel component
- **react-day-picker**: Calendar/date picker
- **cmdk**: Command palette component
- **vaul**: Drawer component
- **recharts**: Charting library

### Form Handling
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Zod resolver for form validation

### Development Tools
- **Replit Plugins**: Runtime error overlay, cartographer, dev banner (development only)

## Recent Changes

### Rubric Builder MVP (December 2025)
- Implemented complete Rubric Builder/Editor page with two-panel layout
- Left panel: Criteria editor with drag-and-drop reordering and expandable proficiency levels
- Right panel: Rubric summary sidebar with total points, distribution visualization, and quick actions
- Template import system with 3 pre-built templates (Essay Writing, Research Paper, Presentation)
- TanStack Query integration for save/load functionality with proper cache invalidation
- Export functionality to download rubrics as JSON files
- Full data-testid coverage for automated testing
- Loading states, skeleton components, and toast notifications for user feedback

### API Endpoints
- POST /api/rubrics - Create new rubric
- GET /api/rubrics - List all rubrics
- GET /api/rubrics/:id - Get specific rubric
- PUT /api/rubrics/:id - Update rubric
- DELETE /api/rubrics/:id - Delete rubric