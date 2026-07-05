-- ============================================
-- Migration: приведи СЪЩЕСТВУВАЩАТА база към актуалната схема
-- Изпълни целия скрипт в Supabase SQL Editor. Безопасен е за повторно
-- изпълнение (идемпотентен). След него изпълни и create-admin.sql.
--
-- Какво прави:
--  1. Добавя липсващата колона users.max_daily_bookings (кодът я чете).
--  2. Създава SECURITY DEFINER функции is_admin()/current_coach_id(), за да
--     няма рекурсия в RLS политиките (грешка 42P17 при полит., които
--     заявяват собствената си таблица).
--  3. Включва RLS на всички таблици и (пре)създава ВСИЧКИ политики —
--     админските операции изискват истински админ login (/admin).
--  4. Гарантира exclusion constraint срещу двойни резервации и тригера за
--     лимит на участници в групови тренировки.
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ------------------------------------------------
-- 1. Липсваща колона
-- ------------------------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS max_daily_bookings INTEGER NOT NULL DEFAULT 3;

-- ------------------------------------------------
-- 2. Помощни функции (без RLS рекурсия)
-- ------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.current_coach_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT coach_id FROM public.users WHERE id = auth.uid() AND role = 'coach';
$$;

-- ------------------------------------------------
-- 3. RLS на всички таблици + пълен набор политики
-- ------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_training_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_unavailability ENABLE ROW LEVEL SECURITY;

-- users
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins full access users" ON users;
CREATE POLICY "Admins full access users" ON users
  FOR ALL USING (public.is_admin());

-- bookings
DROP POLICY IF EXISTS "Anyone can view bookings" ON bookings;
CREATE POLICY "Anyone can view bookings" ON bookings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create own bookings" ON bookings;
CREATE POLICY "Users can create own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anonymous can create bookings" ON bookings;
CREATE POLICY "Anonymous can create bookings" ON bookings
  FOR INSERT WITH CHECK (user_id IS NULL);

DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Coaches can update assigned bookings" ON bookings;
CREATE POLICY "Coaches can update assigned bookings" ON bookings
  FOR UPDATE USING (coach_id IS NOT NULL AND coach_id = public.current_coach_id());

DROP POLICY IF EXISTS "Admins full access bookings" ON bookings;
CREATE POLICY "Admins full access bookings" ON bookings
  FOR ALL USING (public.is_admin());

-- Премахни permissive политики от преходния период без админ login
DROP POLICY IF EXISTS "Anyone can update guest bookings" ON bookings;

-- courts / coaches: публично четене, писане само за админ.
-- Забележка: PIN кодовете остават четими с anon ключа, защото PIN логинът
-- на треньорите сам по себе си е неавтентикиран.
DROP POLICY IF EXISTS "Anyone can view courts" ON courts;
CREATE POLICY "Anyone can view courts" ON courts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins full access courts" ON courts;
CREATE POLICY "Admins full access courts" ON courts
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view coaches" ON coaches;
CREATE POLICY "Anyone can view coaches" ON coaches
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins full access coaches" ON coaches;
CREATE POLICY "Admins full access coaches" ON coaches
  FOR ALL USING (public.is_admin());

-- group trainings
DROP POLICY IF EXISTS "Anyone can view group trainings" ON group_trainings;
CREATE POLICY "Anyone can view group trainings" ON group_trainings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can manage group trainings" ON group_trainings;
DROP POLICY IF EXISTS "Admins full access group trainings" ON group_trainings;
CREATE POLICY "Admins full access group trainings" ON group_trainings
  FOR ALL USING (public.is_admin());

-- registrations
DROP POLICY IF EXISTS "Anyone can view registrations" ON group_training_registrations;
CREATE POLICY "Anyone can view registrations" ON group_training_registrations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can register" ON group_training_registrations;
CREATE POLICY "Anyone can register" ON group_training_registrations
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update registrations" ON group_training_registrations;
DROP POLICY IF EXISTS "Admins full access registrations" ON group_training_registrations;
CREATE POLICY "Admins full access registrations" ON group_training_registrations
  FOR ALL USING (public.is_admin());

-- coach unavailability: треньорският портал ползва PIN (anon ключ);
-- сървърният код проверява PIN-а преди запис.
DROP POLICY IF EXISTS "Anyone can view coach unavailability" ON coach_unavailability;
CREATE POLICY "Anyone can view coach unavailability" ON coach_unavailability
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Coaches can insert own unavailability" ON coach_unavailability;
CREATE POLICY "Coaches can insert own unavailability" ON coach_unavailability
  FOR INSERT WITH CHECK (coach_id = public.current_coach_id());

DROP POLICY IF EXISTS "Coaches can delete own unavailability" ON coach_unavailability;
CREATE POLICY "Coaches can delete own unavailability" ON coach_unavailability
  FOR DELETE USING (coach_id = public.current_coach_id());

DROP POLICY IF EXISTS "Anon can manage coach unavailability" ON coach_unavailability;
CREATE POLICY "Anon can manage coach unavailability" ON coach_unavailability
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins full access coach unavailability" ON coach_unavailability;
CREATE POLICY "Admins full access coach unavailability" ON coach_unavailability
  FOR ALL USING (public.is_admin());

-- ------------------------------------------------
-- 4. Exclusion constraint срещу двойни резервации + тригер за груповите
-- (проверено на 2026-07-04: няма препокриващи се потвърдени резервации,
--  така че добавянето е безопасно)
-- ------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'no_overlapping_bookings' AND conrelid = 'bookings'::regclass
  ) THEN
    ALTER TABLE bookings ADD CONSTRAINT no_overlapping_bookings
      EXCLUDE USING gist (
        court_id WITH =,
        tstzrange(start_time, end_time) WITH &&
      )
      WHERE (status = 'confirmed');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION check_max_participants()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  SELECT gt.max_participants INTO max_allowed
  FROM group_trainings gt
  WHERE gt.id = NEW.group_training_id
  FOR UPDATE;

  IF max_allowed IS NULL THEN
    RAISE EXCEPTION 'Group training not found: %', NEW.group_training_id;
  END IF;

  SELECT COUNT(*) INTO current_count
  FROM group_training_registrations
  WHERE group_training_id = NEW.group_training_id
    AND date = NEW.date
    AND status = 'confirmed';

  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Групата е пълна — максимален брой участници: %', max_allowed;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_max_participants ON group_training_registrations;
CREATE TRIGGER enforce_max_participants
  BEFORE INSERT ON group_training_registrations
  FOR EACH ROW
  EXECUTE FUNCTION check_max_participants();

-- ------------------------------------------------
-- 5. Индекси
-- ------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_bookings_court_time ON bookings (court_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings (start_time);
CREATE INDEX IF NOT EXISTS idx_group_training_reg_training ON group_training_registrations (group_training_id, date);
CREATE INDEX IF NOT EXISTS idx_group_training_reg_status ON group_training_registrations (status);

-- ============================================
-- 6. Лични данни и треньорски RPC функции (виж privacy-and-coach-portal.sql)
-- ============================================

-- ------------------------------------------------
-- 1. Колонни права за anon върху bookings
-- ------------------------------------------------
REVOKE SELECT ON public.bookings FROM anon;
GRANT SELECT (
  id, user_id, court_id, coach_id, start_time, end_time,
  booking_type, status, total_price, duration_hours,
  is_recurring, recurring_group_id, created_at
) ON public.bookings TO anon;

-- ------------------------------------------------
-- 2. PIN-верифициран достъп за треньорския портал
-- ------------------------------------------------

-- Пълните редове на резервациите на ЕДИН треньор, след проверка на PIN
CREATE OR REPLACE FUNCTION public.get_coach_bookings(
  coach_id_input uuid,
  pin_input text,
  start_ts timestamptz,
  end_ts timestamptz
)
RETURNS SETOF public.bookings
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT b.*
  FROM public.bookings b
  WHERE EXISTS (
      SELECT 1 FROM public.coaches c
      WHERE c.id = coach_id_input AND c.pin = pin_input
    )
    AND b.coach_id = coach_id_input
    AND b.start_time >= start_ts
    AND b.start_time < end_ts
    AND b.status <> 'cancelled';
$$;

-- Отмяна на СОБСТВЕНА бъдеща резервация, след проверка на PIN
CREATE OR REPLACE FUNCTION public.cancel_coach_booking(
  booking_id_input uuid,
  coach_id_input uuid,
  pin_input text
)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.coaches c
    WHERE c.id = coach_id_input AND c.pin = pin_input
  ) THEN
    RETURN false;
  END IF;

  UPDATE public.bookings
  SET status = 'cancelled'
  WHERE id = booking_id_input
    AND coach_id = coach_id_input
    AND status = 'confirmed'
    AND start_time > now();

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected > 0;
END;
$$;
