# GitHub Copilot Custom Instructions for MUST Market

## Project Tech Stack & Architecture
- **Frontend Framework:** React with TypeScript (`.tsx`) powered by Vite.
- **Styling Framework:** Tailwind CSS (Mobile-first, modern UI, using blue/black/white brand themes).
- **Icons:** Lucide React (`lucide-react`).
- **Database & Auth:** Supabase JS Client (`@supabase/supabase-js`).
- **Routing:** React Router DOM (`react-router-dom`).

## Strict Code Generation Rules
1. **Non-Destructive Edits:** NEVER rewrite whole components or delete existing functioning logic unless explicitly asked. Make surgical, targeted edits.
2. **Preserve Existing Patterns:** Always inspect existing components in `src/components/` and `src/pages/` before creating new ones to maintain consistent UI and props structure.
3. **Naming Conventions:**
   - React Components & Files: `PascalCase` (e.g., `ProductCard.tsx`, `Admin.tsx`).
   - Functions & Variables: `camelCase` (e.g., `fetchListings`, `isSubmitting`).
   - Database Table & Column names: `snake_case` (e.g., `views_count`, `whatsapp_clicks_count`, `featured_shelf`).
4. **UI & Styling Guidelines:**
   - Use Tailwind CSS strictly. Do not create external CSS files or inline style objects.
   - Ensure all responsive utility classes (`sm:`, `md:`, `lg:`) match the current layout density.
5. **Database Safety:**
   - Always include error handling (`try/catch` or Supabase `{ error }` checks) and user-friendly toast alerts for asynchronous operations.