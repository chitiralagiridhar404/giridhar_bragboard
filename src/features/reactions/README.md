# Reactions Feature

This module handles the reactions system for shout-out posts.

## Frontend Structure

### Components
- **ReactionButtons** (`components/ReactionButtons.tsx`): UI component displaying reaction buttons (like, clap, star) with counts and active states.

### Hooks
- **useReactions** (`hooks/useReactions.ts`): Custom hook managing reaction state, fetching, and toggling reactions.

### Usage

```tsx
import { ReactionButtons } from '@/features/reactions';

<ReactionButtons shoutOutId={shoutOutId} userId={userId} />
```

## Backend Structure

### Database
- Table: `shout_out_reactions`
  - Columns: `id`, `shout_out_id`, `user_id`, `reaction_type`, `created_at`
  - RLS Policies:
    - Anyone can view reactions
    - Users can add their own reactions
    - Users can delete their own reactions

### Edge Functions
- **reactions** (`supabase/functions/reactions/index.ts`): Placeholder for future complex backend operations like analytics or notifications.

## Features
- ✅ Three reaction types: like (Heart), clap (Sparkles), star (Star)
- ✅ Real-time reaction counts
- ✅ User-specific reaction tracking (knows which reactions you've added)
- ✅ Toggle reactions on/off
- ✅ Authentication required
- ✅ Optimistic UI updates
- ✅ Error handling with toast notifications
