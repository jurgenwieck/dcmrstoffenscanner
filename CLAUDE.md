# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vue 3 + TypeScript + Vite application using Nuxt UI components (without Nuxt itself), Azure Static Web Apps/Entra ID for auth, Azure Logic Apps + Azure AI Foundry Agent for image analysis, Pinia for state management, and Iconify/Lucide icons.

## Development Commands

```bash
# Install dependencies
npm install

# Development server with hot-reload
npm run dev

# Type-check TypeScript
npm run type-check

# Build for production (runs type-check + build)
npm run build

# Build only (without type-check)
npm run build-only

# Preview production build
npm run preview

# Lint and auto-fix
npm run lint

# Format code with Prettier
npm run format
```

## Tech Stack & Architecture

### Core Technologies
- **Vue 3** with Composition API (using `<script setup>`)
- **TypeScript** in strict mode
- **Vite** for build tooling
- **Nuxt UI** (Vue components only, not the full Nuxt framework)
- **Tailwind CSS 4** via `@tailwindcss/vite`
- **Pinia** with persistedstate plugin for state management
- **Vue Router** with authentication guards
- **Azure Static Web Apps + Microsoft Entra ID** for authentication
- **Azure Logic Apps + Azure AI Foundry Agent** for image analysis orchestration
- **Azure SQL + Blob Storage** for persistent DCMR data
- **Zod** for schema validation

### Icon System

The project uses a custom **SmartIcon** system (`src/components/SmartIcon.vue`) backed by Iconify/Lucide icons:

- Use Nuxt UI/Iconify icon names such as `i-lucide-camera`, `i-lucide-check`, or `lucide:camera`.
- SmartIcon component is aliased as `UIcon` via Nuxt UI's component resolver.
- Do not add FontAwesome Pro packages; the project is intended to install without private npm credentials.

### State Management Pattern

Pinia stores follow a strict pattern (see `.cursor/rules/ts.mdc` for detailed examples):

```typescript
// Structure: stores/{entity}.ts
interface EntityState {
    entities: Entity[];
    entitiesLoading: boolean;
    entity: Entity | null;
    entityLoading: boolean;
}

export const useEntityStore = defineStore('entity', {
    state: () => initialState(),
    actions: {
        async getEntities() { /* ... */ },
        async getEntity(id: number) { /* ... */ },
        async deleteEntity(id: number) { /* ... */ }
    }
});
```

- Use `defineStore('name', {state, actions})` syntax
- Interfaces live in `src/shared/interfaces/` (never inline)
- Prefer `await/catch/throw` over `try/catch` blocks
- Use toast notifications for errors via `@/shared/helpers/useToast`

### Routing & Authentication

- Routes defined in `src/router/index.ts`
- Authentication guard in `src/router/authGuard.ts` protects `/app/*` routes
- Auth state managed by `src/stores/auth.ts` using Azure Static Web Apps `/.auth/me`
- Unauthenticated users redirected to `/auth`

## Code Style Conventions

### Vue Components
- Always use `<script setup>` with Composition API (never Options API)
- Prefer `ref()` over `reactive()`
- Order: `<template>` then `<script>` (no `<style>` - use Tailwind classes)
- Use global Pinia stores over provide/inject
- File naming: PascalCase for components (e.g., `AuthWizard.vue`)
- Directory naming: lowercase with dashes (e.g., `components/auth-wizard/`)

### TypeScript
- Enable strict mode
- Use PascalCase for types/interfaces, camelCase for variables/functions
- Prefix booleans with verbs (`isLoading`, `hasError`, `canSubmit`)
- Prefix event handlers with `handle` (`handleClick`, `handleSubmit`)
- Place interfaces in dedicated `interfaces/` folders, never inline

### Nuxt UI Tables
When using `<UTable>`:
- Import and use `TableColumn` type: `const columns: TableColumn<Entity>[] = [...]`
- **Prefer slots over `h()` render functions** for custom cells
- Use `<template #action-cell="{ row }">` for row actions

### SQL (Azure SQL)
- Use snake_case for tables/columns
- Plural table names, singular column names
- Foreign keys: `{table_singular}_id` (e.g., `user_id` references `users`)
- Format: lowercase keywords, use CTEs for complex queries

## Project Management

### PRD and Tasks
- **PRD**: `prd.md` at root is the source of truth for requirements
- **Tasks**: `tasks.md` tracks implementation with checkboxes (`- [ ]` pending, `- [x]` completed)
- When implementing features, align with PRD specifications
- Update both files when requirements change

## Environment

- Node version: Specified in `.nvmrc` (requires Node ^20.19.0 || >=22.12.0)
- Environment variables: Store in `.env` (see `.env.example`)
  - `VITE_DCMR_API_BASE_URL`
  - `VITE_DISABLE_AUTH` (local development only)
