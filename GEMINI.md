# Mondial Prediction App - Memory

## Project Objective
Mobile-first SPA for World Cup 2026 predictions with a competitive scoring system.

## Technical Stack
- **Frontend:** Preact (Vite), Tailwind CSS 4, Lucide Icons, Recharts.
- **Backend:** Supabase (Auth, PostgreSQL).
- **Environment:** Node.js, TypeScript.
- **Deployment:** Render (Static Site).

## Core Features Implemented
1. **Authentication:** Full Sign In/Up with Supabase Auth.
2. **Dashboard:**
   - **Matches:** View scheduled/finished matches.
   - **Leaderboard:** Global ranking by points.
   - **Profile:** User stats (points, role).
3. **Admin Panel:**
   - Match creation.
   - Update match scores with **automatic point recalculation** for all users.
   - Restricted to 'admin' role in `profiles` table.
4. **Predictions:**
   - Users can save and update scores for upcoming matches.
   - Existing predictions are automatically retrieved on login.
5. **Scoring Logic:**
   - Correct Score: +3 pts
   - Correct Result (W/D/L): +1 pt
   - Incorrect: -1 pt

## Database Schema (Supabase - Aligned)
- **`profiles`**: `id` (UUID), `name` (TEXT), `role` (TEXT), `total_points` (INT).
- **`matches`**: `id` (UUID), `team_home` (TEXT), `team_away` (TEXT), `start_time` (TIMESTAMPTZ), `score_home` (INT), `score_away` (INT), `status` (TEXT).
- **`predictions`**: `match_id`, `user_id`, `predicted_home`, `predicted_away`, `points_earned`.

## Deployment Instructions (Render)
1. **Type:** Static Site.
2. **Build Command:** `npm install; npm run build`.
3. **Publish Directory:** `dist`.
4. **Env Vars:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
5. **Redirects:** Source `/*`, Destination `/index.html`, Action `Rewrite`.

## Git Info
- **Remote:** `https://github.com/miculinsergiu-alt/CM2026FLEX`
- **Branch:** `main`

## Future Tasks
- Integration with Football API for automatic score updates.
- Real-time updates using Supabase Realtime for the Leaderboard.
- Enhanced charts for user performance over time.
