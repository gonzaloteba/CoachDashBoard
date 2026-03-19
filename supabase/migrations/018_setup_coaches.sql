-- =====================================================
-- Setup coaches and assign all clients to Antonio Tirado
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- =====================================================

-- Step 1: Create coach records from existing auth users
-- (This matches auth users by email to create coach records)

-- Antonio Tirado - Coach
INSERT INTO public.coaches (id, full_name, role)
SELECT id, 'Antonio Tirado', 'coach'
FROM auth.users
WHERE email = 'antonio@agiaconsulting.ai'
ON CONFLICT (id) DO UPDATE SET full_name = 'Antonio Tirado', role = 'coach';

-- Gonzalo - Admin
INSERT INTO public.coaches (id, full_name, role)
SELECT id, 'Gonzalo', 'admin'
FROM auth.users
WHERE email = 'gonzalo@agiaconsulting.ai'
ON CONFLICT (id) DO UPDATE SET full_name = 'Gonzalo', role = 'admin';

-- NOTE: If Andrés has an account, uncomment and adjust below:
-- INSERT INTO public.coaches (id, full_name, role)
-- SELECT id, 'Andrés', 'admin'
-- FROM auth.users
-- WHERE email = 'andres@agiaconsulting.ai'
-- ON CONFLICT (id) DO UPDATE SET full_name = 'Andrés', role = 'admin';

-- Step 2: Assign ALL existing clients to Antonio Tirado
UPDATE public.clients
SET coach_id = (
  SELECT id FROM auth.users WHERE email = 'antonio@agiaconsulting.ai' LIMIT 1
)
WHERE coach_id IS NULL;

-- Step 3: Assign any orphaned calls to Antonio too
UPDATE public.calls
SET coach_id = (
  SELECT id FROM auth.users WHERE email = 'antonio@agiaconsulting.ai' LIMIT 1
)
WHERE coach_id IS NULL;

-- Step 4: Verify results
SELECT 'Coaches' as table_name, full_name, role FROM public.coaches
UNION ALL
SELECT 'Unassigned clients', COUNT(*)::text, '' FROM public.clients WHERE coach_id IS NULL
UNION ALL
SELECT 'Antonio clients', COUNT(*)::text, '' FROM public.clients
  WHERE coach_id = (SELECT id FROM auth.users WHERE email = 'antonio@agiaconsulting.ai' LIMIT 1);
