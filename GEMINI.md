# Mondial Prediction App - Memory

## Project Objective
Mobile-first SPA for World Cup 2026 predictions with a competitive scoring system.

## Technical Stack
- **Frontend:** Preact (Vite), Tailwind CSS 4, Lucide Icons, Recharts.
- **Backend:** Supabase (Auth, PostgreSQL).
- **Environment:** Node.js, TypeScript.

## Core Features Implemented
1. **Authentication:** Full Sign In/Up with Supabase Auth.
2. **Dashboard:**
   - **Matches:** View scheduled/finished matches.
   - **Leaderboard:** Global ranking by points.
   - **Profile:** User stats (points, role).
3. **Admin Panel:** Match creation (restricted to 'admin' role).
4. **Predictions:**
   - Users can save and update scores for upcoming matches.
   - Existing predictions are automatically retrieved on login.
5. **Scoring Logic:**
   - Correct Score: +3 pts
   - Correct Result: +1 pt
   - Incorrect: -1 pt

## Database Schema (Supabase)
- `profiles`: id (UUID), full_name (TEXT), role (TEXT), total_points (INT).
- `matches`: id (UUID), team_home (TEXT), team_away (TEXT), start_time (TIMESTAMPTZ), score_home (INT), score_away (INT), status (TEXT).
- `predictions`: match_id, user_id, predicted_home, predicted_away, points_earned.

## Git Info
- **Remote:** `https://github.com/miculinsergiu-alt/CM2026FLEX`
- **Branch:** `main`

## Future Tasks
- Implement "Save Prediction" logic.
- Implement "Update Match Score" in Admin panel (triggering point recalculation).
- Integration with Football API for automatic score updates.
