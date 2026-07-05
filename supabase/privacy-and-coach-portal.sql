-- ============================================
-- Migration: лични данни само за логнати + работещ треньорски портал
-- Изпълни ЦЕЛИЯ скрипт в Supabase SQL Editor (безопасен за повторно пускане).
--
-- 1. Анонимните заявки (публичният сайт) вече НЕ могат да четат личните
--    колони на bookings (customer_name/email/phone, notes) — дори директно
--    през API-то. Логнатият админ (role authenticated) вижда всичко.
-- 2. Треньорите (PIN login, без Supabase auth) получават достъп до пълните
--    данни САМО за собствените си резервации и могат да ги отменят — през
--    SECURITY DEFINER функции, които проверяват PIN-а в базата.
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
