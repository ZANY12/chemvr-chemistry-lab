# Virtual Reality Chemistry Laboratory

## Overview

This is a WebXR-based Virtual Reality Chemistry Laboratory built with React Three Fiber and Three.js. The application simulates an immersive VR chemistry lab environment that runs in modern browsers and VR headsets (Meta Quest, HTC Vive, etc.). Users can interact with lab equipment like beakers, flasks, Bunsen burners, and chemical bottles in a realistic 3D laboratory setting. The system also tracks experiments in a PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Single-page application using React 18 with TypeScript for type safety
- **React Three Fiber (@react-three/fiber)**: React renderer for Three.js, enabling declarative 3D scene composition
- **@react-three/drei**: Helper components for common 3D patterns (cameras, controls, text, primitives)
- **@react-three/xr**: WebXR integration providing VR/AR support with controllers and hand tracking
- **Wouter**: Lightweight client-side routing
- **TanStack React Query**: Server state management with caching and synchronization
- **Shadcn/UI + Radix UI**: Comprehensive component library with accessibility built-in
- **Tailwind CSS**: Utility-first styling with custom sci-fi themed color palette
- **Framer Motion**: UI animations for the dashboard overlay

### Backend Architecture
- **Express.js**: REST API server handling experiment data
- **TypeScript**: Full type safety across server code
- **Vite**: Development server with HMR, production bundler outputs to `dist/public`
- **esbuild**: Server bundling for production with selective dependency bundling

### Data Storage
- **PostgreSQL**: Primary database for storing experiment records
- **Drizzle ORM**: Type-safe database queries with schema defined in `shared/schema.ts`
- **Drizzle-Zod**: Automatic validation schema generation from database schema

### API Structure
- Routes defined in `shared/routes.ts` using Zod for input/output validation
- RESTful endpoints:
  - `GET /api/experiments` - List all experiments
  - `POST /api/experiments` - Create new experiment record
- Storage layer abstraction in `server/storage.ts` for database operations

### 3D Scene Architecture
- **LabRoom**: Environment with floor, walls, ceiling, and professional lighting setup
- **LabBench**: Modular lab furniture with optional sink component
- **Equipment**: Interactive items (DraggableItem, BunsenBurner) with WebXR interaction support
- **Scene**: Main canvas component managing XR session, controls, and scene composition

### Project Structure
```
client/           # Frontend React application
  src/
    components/   # React components
      canvas/     # 3D scene components (LabRoom, LabBench, Equipment)
      ui/         # Shadcn UI components
    hooks/        # Custom React hooks
    pages/        # Route pages
    lib/          # Utilities and query client
server/           # Express backend
shared/           # Shared types, schemas, and route definitions
migrations/       # Drizzle database migrations
```

## External Dependencies

### Database
- **PostgreSQL**: Required, connection via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migration tool (`npm run db:push`)

### Key Runtime Dependencies
- **Three.js ecosystem**: Core 3D rendering (three, @react-three/fiber, @react-three/drei, @react-three/xr)
- **Radix UI primitives**: Accessible UI components (dialog, dropdown, toast, etc.)
- **Zod**: Runtime validation for API inputs/outputs
- **React Hook Form**: Form state management with Zod resolver

### Development Tools
- **Vite**: Dev server with React plugin and Replit-specific plugins
- **TSX**: TypeScript execution for development server
- **PostCSS + Autoprefixer**: CSS processing for Tailwind

### WebXR Requirements
- WebXR-compatible browser or emulator for full VR features
- Desktop mode works via OrbitControls for non-VR testing
- Procedural textures/models to keep the application lightweight