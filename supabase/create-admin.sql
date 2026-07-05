-- ============================================
-- Create the admin account for the /admin panel
--
-- Step 1 (Supabase Dashboard):
--   Authentication → Users → "Add user" → въведи имейл и парола за админа.
--   Избери "Auto confirm user", за да не чака имейл потвърждение.
--
-- Step 2 (SQL Editor):
--   Замени 'admin@example.com' по-долу с имейла от Стъпка 1 и изпълни
--   скрипта. Той свързва auth акаунта с ред в public.users с role='admin' —
--   това е, което is_admin() и login гейтът проверяват.
-- ============================================

INSERT INTO public.users (id, email, full_name, role)
SELECT id, email, 'Администратор', 'admin'
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Провери резултата (трябва да върне 1 ред с role = 'admin'):
SELECT id, email, role FROM public.users WHERE role = 'admin';
