# Voyu - ISO 27001 Readiness MVP

## Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Supabase Setup

1. Create a new Supabase project
2. Run the migration in `supabase/migrations/001_initial_schema.sql` via the SQL Editor
3. Enable Email auth in Authentication > Providers
4. Add `http://localhost:3000/auth/callback` to Redirect URLs in Authentication > URL Configuration

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000
