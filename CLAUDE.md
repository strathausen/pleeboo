# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `bun run dev` - Start development server with Turbo
- `bun run build` - Build production bundle
- `bun run typecheck` - Run TypeScript type checking
- `bun run check` - Run Biome linter/formatter check
- `bun run check:write` - Auto-fix linting/formatting issues

### Database Commands
- `bun run db:push` - Push schema changes to database
- `bun run db:generate` - Generate Drizzle migration files
- `bun run db:migrate` - Run database migrations
- `bun run db:studio` - Open Drizzle Studio for database management

## Architecture Overview

This is a T3 Stack application with the following technology stack:

### Framework & Core
- **Next.js 15** with App Router - React framework with file-based routing in `src/app/`
- **TypeScript** - Strict mode enabled with comprehensive type safety
- **Module type**: ESM (type: "module" in package.json)

### Data Layer
- **Drizzle ORM** - Type-safe database ORM with PostgreSQL
- **tRPC** - End-to-end typesafe API layer connecting frontend and backend
- **Database schema**: Located at `src/server/db/schema.ts` with `pleeboo_` table prefix

### Authentication
- **NextAuth.js v5** (beta) - Authentication with Discord provider configured
- Auth configuration: `src/server/auth/config.ts`
- Session handling integrated with tRPC context

### Code Quality
- **Biome** - Linter and formatter (replaces ESLint/Prettier)
- **Tailwind CSS v4** - Utility-first CSS framework
- Path alias: `@/*` maps to `./src/*`
- For environment variables, always use the env file at src/env.js and avoid using process.env directly

### Scrapbook

- the scrapbook page will showcase only low-level ui components

## Project Structure

```
src/
├── app/                # Next.js App Router pages and components
│   ├── api/            # API routes (tRPC and NextAuth)
│   └── _components/    # Page-specific components
├── server/             # Backend logic
│   ├── api/            # tRPC routers and procedures
│   ├── auth/           # NextAuth configuration
│   └── db/             # Database schema and connection
├── trpc/               # tRPC client setup for React
└── env.js              # Environment variable validation with zod
```

## Key Patterns

### tRPC Usage
- Router definitions in `src/server/api/routers/`
- Procedures use `publicProcedure` or `protectedProcedure` (auth required)
- Context includes database and session automatically
- Artificial delay middleware in development for waterfall detection

### Database Conventions
- All tables prefixed with `pleeboo_`
- Relations defined using Drizzle's relations API
- Indexes on foreign keys and commonly queried fields
- Indexes should be strings

### Authentication Flow
- Discord OAuth provider configured
- Session stored in database
- Protected routes check `ctx.session.user` in tRPC procedures
