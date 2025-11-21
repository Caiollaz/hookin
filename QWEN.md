# Hookin - Webhook Inspector Project Context

## Project Overview

Hookin is a modern monorepo application designed for capturing, inspecting, and managing webhook requests in real-time. The application features a clean separation between API and web interface, built with contemporary technologies. The project is written in Portuguese (Brazilian), indicating it's targeted for a Portuguese-speaking audience.

**Architecture:**
- **Backend**: Node.js/TypeScript API built with Fastify framework
- **Database**: PostgreSQL with Drizzle ORM
- **Frontend**: React 19 application with Vite build system
- **Package Manager**: pnpm with monorepo workspaces
- **Documentation**: Scalar API Reference for interactive API docs
- **Containerization**: Docker & Docker Compose

## Project Structure

```
hookin/
├── api/                    # Backend (Fastify + PostgreSQL)
│   ├── src/
│   │   ├── db/            # Database configuration
│   │   │   ├── schema/    # Drizzle schemas (tables)
│   │   │   └── migrations/# SQL migrations
│   │   ├── routes/        # API routes (Fastify plugins)
│   │   ├── utils/         # Utilities
│   │   ├── env.ts         # Environment variable validation
│   │   └── server.ts      # Fastify server configuration
│   ├── docker-compose.yml # PostgreSQL configuration
│   └── drizzle.config.ts  # Drizzle ORM configuration
│
├── web/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # React components
│   │   │   └── ui/        # Reusable UI components
│   │   ├── routes/        # Routing (file-based)
│   │   ├── http/          # API schemas and types
│   │   ├── config.ts      # Application configurations
│   │   └── main.tsx       # Application entry point
│   └── vite.config.ts     # Vite configuration
│
├── pnpm-workspace.yaml     # Monorepo configuration
└── package.json            # Workspace root
```

## Technology Stack

### Backend (API)
- **Runtime**: Node.js (v18+)
- **Framework**: Fastify 5.6
- **Language**: TypeScript ~5.9.3
- **ORM**: Drizzle ORM 0.44
- **Database**: PostgreSQL 17
- **Validation**: Zod 4.1 for request/response validation
- **Documentation**: Scalar API Reference
- **Code Formatting**: Biome

### Frontend (Web)
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Router**: TanStack Router 1.132
- **Styling**: Tailwind CSS 4.1
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Code Formatting**: Biome

### Infrastructure
- **Package Manager**: pnpm 10.15.0
- **Monorepo**: pnpm workspaces
- **Containerization**: Docker & Docker Compose

## Development Commands

### Workspace Root
- `pnpm install` - Install all dependencies across workspaces

### API (Backend - run from `api/` directory)
- `pnpm dev` - Start development server with hot reload
- `pnpm start` - Start production server
- `pnpm build` - Build for production
- `pnpm format` - Format code with Biome
- `pnpm db:generate` - Generate Drizzle migrations from schema changes
- `pnpm db:migrate` - Apply pending database migrations
- `pnpm db:studio` - Open Drizzle Studio (GUI for database)
- `pnpm db:seed` - Populate database with sample data

### Web (Frontend - run from `web/` directory)
- `pnpm dev` - Start development server (Vite)
- `pnpm build` - TypeScript check and build for production
- `pnpm preview` - Preview production build locally
- `pnpm format` - Format code with Biome

## Environment Configuration

### API Environment Variables
Create `.env` file in the `api/` directory with:
```env
NODE_ENV=development
PORT=3333
DATABASE_URL=postgresql://docker:docker@localhost:5432/webhooks
BASE_URL=http://localhost:3333
```

### Database Setup
1. Start PostgreSQL with Docker: `docker-compose up -d`
2. Generate migrations: `pnpm db:generate`
3. Apply migrations: `pnpm db:migrate`
4. (Optional) Seed database: `pnpm db:seed`

## API Endpoints

### Core Endpoints
- `GET /endpoints` - List all created endpoints
- `GET /endpoints/:slug` - Get specific endpoint details
- `POST /endpoints` - Create a new endpoint

### Webhook Endpoints
- `GET /webhooks` - List all captured webhooks
- `GET /webhooks/:id` - Get specific webhook details
- `DELETE /webhooks/:id` - Remove a webhook

### Webhook Capture
- `POST /:slug` - Dynamic endpoint to capture webhooks (where `:slug` is the endpoint slug)

### API Documentation
Access interactive API documentation at `http://localhost:3333/docs` with Scalar UI, including schemas, request/response examples, and direct endpoint testing.

## Database Schema

The PostgreSQL database uses Drizzle ORM with these main tables:
- **endpoints**: Stores user-created endpoints
- **webhooks**: Stores all captured webhook requests

### Migration Workflow
1. Edit schema files in `api/src/db/schema/`
2. Run `pnpm db:generate` to generate SQL migration
3. Review generated SQL in `api/src/db/migrations/`
4. Run `pnpm db:migrate` to apply migrations
5. Commit migrations with schema changes

### Drizzle Studio
To visualize and manage the database via GUI:
```bash
cd api
pnpm db:studio
```

## Development Conventions

### Code Standards
- **Formatting**: Biome (not Prettier or ESLint)
- **TypeScript**: Version ~5.9.3 in both workspaces
- **Naming**: Snake_case for database tables (Drizzle configuration)
- **Primary Keys**: UUIDv7 for temporally ordered IDs
- **Routes**: Fastify plugins with Zod validation

### Routing
#### API
Each route is a Fastify plugin exported as `FastifyPluginAsyncZod` with:
- Automatic validation via Zod
- Automatic OpenAPI/Swagger documentation
- Complete type safety

#### Web
Uses TanStack Router with file-based routing:
- Routes defined in `src/routes/`
- Route tree auto-generated in `src/routeTree.gen.ts` (never edit manually)

### Important Notes
- Always use `pnpm`, never `npm` or `yarn`
- Commands must be executed in specific workspace directories (`api/` or `web/`), not at root
- API server runs on port 3333 with CORS enabled for local development
- The `routeTree.gen.ts` file is auto-generated - never edit manually
- Review generated SQL migrations before applying in production
- PostgreSQL Docker container uses default credentials: user=`docker`, password=`docker`, database=`webhooks`, port=`5432`

## Project Purpose

Hookin is a webhook inspection tool that allows developers to create custom endpoints to receive webhooks, automatically capturing and storing all request information including headers, body, query parameters, IP address, and status codes. It's ideal for debugging and monitoring integrations with external services.

## Target Use Cases
- Debugging webhook integrations during development
- Monitoring external service notifications
- Inspecting webhook payloads in real-time
- Testing third-party service connections
- Troubleshooting integration issues