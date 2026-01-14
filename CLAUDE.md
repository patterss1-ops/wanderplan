# WanderPlan - Collaborative Travel Planning SaaS

## Project Overview

WanderPlan is a subscription-based travel planning platform supporting the "explore → rough plan → anchor-based booking" workflow. Built for couples and small groups planning complex, multi-destination trips.

**Tech Stack:**
- Next.js 14 (App Router) with TypeScript
- Supabase (PostgreSQL + Auth + Realtime)
- Mapbox GL JS for maps
- Tailwind CSS + Framer Motion
- Deployed via Replit

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── auth/              # Authentication (login/signup)
│   │   ├── page.tsx       # Auth wrapper with Suspense
│   │   ├── AuthForm.tsx   # Login/signup form component
│   │   └── callback/      # OAuth callback handler
│   ├── dashboard/         # Trip list dashboard
│   │   ├── page.tsx       # Server component
│   │   └── DashboardClient.tsx
│   └── trip/[id]/         # Trip detail view
│       ├── page.tsx       # Server component
│       └── TripClient.tsx # Main trip workspace
├── components/
│   └── MapView.tsx        # Mapbox integration
├── lib/
│   └── supabase/
│       ├── client.ts      # Browser Supabase client
│       ├── server.ts      # Server Supabase client
│       └── middleware.ts  # Auth middleware helper
├── types/
│   └── database.ts        # TypeScript types for DB schema
└── middleware.ts          # Next.js middleware for auth
supabase/
└── migrations/
    └── 001_initial_schema.sql  # Database schema
```

## Key Concepts

### Anchor-Based Booking Workflow
The unique differentiator - users identify the hardest-to-book item first (the "anchor"), lock dates around it, then book outward. Anchor items have special visual treatment (pulsing ring on map, orange badges).

### Booking Status Flow
Items progress through: `idea` → `researching` → `ready` → `booked`

### Item Categories
- `accommodation` (blue)
- `activity` (green/purple)
- `transport` (orange)
- `food` (red)
- `other` (gray/purple)

## Database Schema

Key tables:
- `profiles` - User profiles (extends Supabase auth.users)
- `trips` - Trip entities with dates and status
- `trip_members` - Many-to-many for collaboration (owner/editor/viewer roles)
- `saved_items` - Places/links saved to trips with location, category, booking status
- `itinerary_days` / `itinerary_items` - Day-by-day planning (future)
- `comments` - Async discussion on items (future)
- `documents` - Uploaded confirmations/tickets (future)

All tables have Row Level Security (RLS) policies.

## Commands

```bash
# Development
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run lint         # Run ESLint

# Database
# Run migrations in Supabase SQL Editor
```

## Environment Variables

Required in `.env.local` or Replit Secrets:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
```

## Code Conventions

- Use `'use client'` directive for client components
- Server components fetch data, pass to client components
- Supabase client: `createClient()` from `@/lib/supabase/client` (browser) or `@/lib/supabase/server` (server)
- Styling: Tailwind utility classes, custom CSS variables for theming
- Animations: Framer Motion for page transitions and modals
- Icons: Lucide React

## Current Implementation Status

### Completed (Phase 1)
- [x] Landing page
- [x] Authentication (email + Google OAuth)
- [x] Trip dashboard with create/view trips
- [x] Trip detail view with saved items
- [x] Grid/List/Map view modes
- [x] Category filtering and search
- [x] Booking status workflow
- [x] Anchor event marking
- [x] Mapbox integration with custom markers
- [x] Location autocomplete (Mapbox Geocoding)
- [x] Real-time sync via Supabase subscriptions

### Pending (Phase 2+)
- [ ] Invite collaborators by email
- [ ] Itinerary builder (drag-and-drop day planning)
- [ ] Comments on items
- [ ] Document upload for confirmations
- [ ] Stripe subscription integration
- [ ] PDF export
- [ ] Affiliate booking links

## Testing the App

1. Set up Supabase project and run the migration
2. Configure environment variables
3. Run `npm run dev`
4. Create account → Create trip → Add places → View on map

## Useful Patterns

### Fetching data server-side
```typescript
// In page.tsx (server component)
const supabase = await createClient();
const { data } = await supabase.from('trips').select('*');
return <ClientComponent trips={data} />;
```

### Real-time subscriptions
```typescript
// In client component
useEffect(() => {
  const channel = supabase
    .channel('changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'saved_items' }, handler)
    .subscribe();
  return () => supabase.removeChannel(channel);
}, []);
```

### Adding new saved item fields
1. Add column in `supabase/migrations/`
2. Update `src/types/database.ts`
3. Update relevant components
