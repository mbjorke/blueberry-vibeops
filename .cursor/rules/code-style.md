# Code Style Rules

## TypeScript
- Use strict TypeScript
- Prefer `interface` over `type` for object shapes
- Use explicit return types on exported functions
- Avoid `any` - use `unknown` if type is truly unknown

## React
- Use functional components with hooks
- Prefer named exports
- Co-locate component styles and tests
- Use Shadcn/ui components from `@/components/ui/`

## Imports
- Use path aliases: `@/` maps to `src/`
- Group imports: React, external libs, internal modules, types
- Destructure when importing multiple items

## Naming
- Components: PascalCase (e.g., `ProjectCard.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useAuth.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Constants: SCREAMING_SNAKE_CASE

## Database
- Make all migrations idempotent
- Always enable RLS on new tables
- Use UUID for primary keys
- Include created_at and updated_at timestamps
