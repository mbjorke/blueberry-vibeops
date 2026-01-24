Create and apply a database migration for: $ARGUMENTS

Follow these steps:

1. Understand what schema changes are needed
2. Create a new migration file with timestamp: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
3. Write idempotent SQL (use IF NOT EXISTS, DROP IF EXISTS before CREATE, etc.)
4. Review the migration for security (RLS policies, proper constraints)
5. Push to remote: `supabase db push`
6. If successful, regenerate types: `supabase gen types typescript --project-id pfarazpvjleswgrpjkgs > src/integrations/supabase/types.ts`
7. Update any affected TypeScript code to use new types
