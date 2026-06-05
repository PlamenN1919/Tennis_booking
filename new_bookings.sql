DO $$
DECLARE
  court_a_uuid UUID;
  court_b_uuid UUID;
BEGIN
  -- 1. Намиране на UUID за двата корта по име
  SELECT id INTO court_a_uuid FROM courts WHERE name = 'Корт A' LIMIT 1;
  SELECT id INTO court_b_uuid FROM courts WHERE name = 'Корт B' LIMIT 1;

  IF court_a_uuid IS NULL OR court_b_uuid IS NULL THEN
    RAISE EXCEPTION 'Не са намерени кортове с имена "Корт A" и "Корт B"';
  END IF;

  -- =============================================
  -- ЮЛИЯ — Индивидуална тренировка с треньор, 1 корт, 19:00–20:00
  -- =============================================
  INSERT INTO bookings (
    court_id, user_id, coach_id, start_time, end_time,
    booking_type, status, total_price, notes,
    customer_name, customer_email, customer_phone, duration_hours, is_recurring
  ) VALUES
    (court_a_uuid, NULL, NULL, '2026-06-17T19:00:00+03:00', '2026-06-17T20:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка - Юлия', 'Юлия', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-06-19T19:00:00+03:00', '2026-06-19T20:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка - Юлия', 'Юлия', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-06-22T19:00:00+03:00', '2026-06-22T20:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка - Юлия', 'Юлия', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-06-24T19:00:00+03:00', '2026-06-24T20:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка - Юлия', 'Юлия', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-07-03T19:00:00+03:00', '2026-07-03T20:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка - Юлия', 'Юлия', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-07-06T19:00:00+03:00', '2026-07-06T20:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка - Юлия', 'Юлия', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-07-10T19:00:00+03:00', '2026-07-10T20:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка - Юлия', 'Юлия', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-07-13T19:00:00+03:00', '2026-07-13T20:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка - Юлия', 'Юлия', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-07-17T19:00:00+03:00', '2026-07-17T20:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка - Юлия', 'Юлия', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-07-24T19:00:00+03:00', '2026-07-24T20:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка - Юлия', 'Юлия', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-08-03T19:00:00+03:00', '2026-08-03T20:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка - Юлия', 'Юлия', '', '', 1, false)
  ON CONFLICT ON CONSTRAINT no_overlapping_bookings DO NOTHING;

  -- =============================================
  -- ТЕОДОР — Наем на двата корта, 16:00–18:00 (2 часа)
  -- 30 Aug – 8 Sep 2026
  -- =============================================
  INSERT INTO bookings (
    court_id, user_id, coach_id, start_time, end_time,
    booking_type, status, total_price, notes,
    customer_name, customer_email, customer_phone, duration_hours, is_recurring
  ) VALUES
    -- 30 Aug
    (court_a_uuid, NULL, NULL, '2026-08-30T16:00:00+03:00', '2026-08-30T18:00:00+03:00', 'court_rental', 'confirmed', 40.00, 'Наем двата корта - Теодор', 'Теодор', '', '', 2, false),
    (court_b_uuid, NULL, NULL, '2026-08-30T16:00:00+03:00', '2026-08-30T18:00:00+03:00', 'court_rental', 'confirmed', 40.00, 'Наем двата корта - Теодор', 'Теодор', '', '', 2, false),
    -- 31 Aug
    (court_a_uuid, NULL, NULL, '2026-08-31T16:00:00+03:00', '2026-08-31T18:00:00+03:00', 'court_rental', 'confirmed', 40.00, 'Наем двата корта - Теодор', 'Теодор', '', '', 2, false),
    (court_b_uuid, NULL, NULL, '2026-08-31T16:00:00+03:00', '2026-08-31T18:00:00+03:00', 'court_rental', 'confirmed', 40.00, 'Наем двата корта - Теодор', 'Теодор', '', '', 2, false),
    -- 1 Sep
    (court_a_uuid, NULL, NULL, '2026-09-01T16:00:00+03:00', '2026-09-01T18:00:00+03:00', 'court_rental', 'confirmed', 40.00, 'Наем двата корта - Теодор', 'Теодор', '', '', 2, false),
    (court_b_uuid, NULL, NULL, '2026-09-01T16:00:00+03:00', '2026-09-01T18:00:00+03:00', 'court_rental', 'confirmed', 40.00, 'Наем двата корта - Теодор', 'Теодор', '', '', 2, false),
    -- 2 Sep
    (court_a_uuid, NULL, NULL, '2026-09-02T16:00:00+03:00', '2026-09-02T18:00:00+03:00', 'court_rental', 'confirmed', 40.00, 'Наем двата корта - Теодор', 'Теодор', '', '', 2, false),
    (court_b_uuid, NULL, NULL, '2026-09-02T16:00:00+03:00', '2026-09-02T18:00:00+03:00', 'court_rental', 'confirmed', 40.00, 'Наем двата корта - Теодор', 'Теодор', '', '', 2, false),
    -- 3 Sep
    (court_a_uuid, NULL, NULL, '2026-09-03T16:00:00+03:00', '2026-09-03T18:00:00+03:00', 'court_rental', 'confirmed', 40.00, 'Наем двата корта - Теодор', 'Теодор', '', '', 2, false),
    (court_b_uuid, NULL, NULL, '2026-09-03T16:00:00+03:00', '2026-09-03T18:00:00+03:00', 'court_rental', 'confirmed', 40.00, 'Наем двата корта - Теодор', 'Теодор', '', '', 2, false),
    -- 4 Sep
    (court_a_uuid, NULL, NULL, '2026-09-04T16:00:00+03:00', '2026-09-04T18:00:00+03:00', 'court_rental', 'confirmed', 40.00, 'Наем двата корта - Теодор', 'Теодор', '', '', 2, false),
    (court_b_uuid, NULL, NULL, '2026-09-04T16:00:00+03:00', '2026-09-04T18:00:00+03:00', 'court_rental', 'confirmed', 40.00, 'Наем двата корта - Теодор', 'Теодор', '', '', 2, false),
    -- 5 Sep
    (court_a_uuid, NULL, NULL, '2026-09-05T16:00:00+03:00', '2026-09-05T18:00:00+03:00', 'court_rental', 'confirmed', 40.00, 'Наем двата корта - Теодор', 'Теодор', '', '', 2, false),
    (court_b_uuid, NULL, NULL, '2026-09-05T16:00:00+03:00', '2026-09-05T18:00:00+03:00', 'court_rental', 'confirmed', 40.00, 'Наем двата корта - Теодор', 'Теодор', '', '', 2, false),
    -- 6 Sep
    (court_a_uuid, NULL, NULL, '2026-09-06T16:00:00+03:00', '2026-09-06T18:00:00+03:00', 'court_rental', 'confirmed', 40.00, 'Наем двата корта - Теодор', 'Теодор', '', '', 2, false),
    (court_b_uuid, NULL, NULL, '2026-09-06T16:00:00+03:00', '2026-09-06T18:00:00+03:00', 'court_rental', 'confirmed', 40.00, 'Наем двата корта - Теодор', 'Теодор', '', '', 2, false),
    -- 7 Sep
    (court_a_uuid, NULL, NULL, '2026-09-07T16:00:00+03:00', '2026-09-07T18:00:00+03:00', 'court_rental', 'confirmed', 40.00, 'Наем двата корта - Теодор', 'Теодор', '', '', 2, false),
    (court_b_uuid, NULL, NULL, '2026-09-07T16:00:00+03:00', '2026-09-07T18:00:00+03:00', 'court_rental', 'confirmed', 40.00, 'Наем двата корта - Теодор', 'Теодор', '', '', 2, false),
    -- 8 Sep
    (court_a_uuid, NULL, NULL, '2026-09-08T16:00:00+03:00', '2026-09-08T18:00:00+03:00', 'court_rental', 'confirmed', 40.00, 'Наем двата корта - Теодор', 'Теодор', '', '', 2, false),
    (court_b_uuid, NULL, NULL, '2026-09-08T16:00:00+03:00', '2026-09-08T18:00:00+03:00', 'court_rental', 'confirmed', 40.00, 'Наем двата корта - Теодор', 'Теодор', '', '', 2, false)
  ON CONFLICT ON CONSTRAINT no_overlapping_bookings DO NOTHING;

  -- =============================================
  -- ТЕОДОР — Наем на двата корта, 31 Aug 08:00–09:00
  -- =============================================
  INSERT INTO bookings (
    court_id, user_id, coach_id, start_time, end_time,
    booking_type, status, total_price, notes,
    customer_name, customer_email, customer_phone, duration_hours, is_recurring
  ) VALUES
    (court_a_uuid, NULL, NULL, '2026-08-31T08:00:00+03:00', '2026-08-31T09:00:00+03:00', 'court_rental', 'confirmed', 20.00, 'Наем двата корта - Теодор', 'Теодор', '', '', 1, false),
    (court_b_uuid, NULL, NULL, '2026-08-31T08:00:00+03:00', '2026-08-31T09:00:00+03:00', 'court_rental', 'confirmed', 20.00, 'Наем двата корта - Теодор', 'Теодор', '', '', 1, false)
  ON CONFLICT ON CONSTRAINT no_overlapping_bookings DO NOTHING;

  -- =============================================
  -- КИСЬОВИ ДЕЦА — Индивидуална тренировка с треньор, 1 корт
  -- =============================================
  INSERT INTO bookings (
    court_id, user_id, coach_id, start_time, end_time,
    booking_type, status, total_price, notes,
    customer_name, customer_email, customer_phone, duration_hours, is_recurring
  ) VALUES
    (court_a_uuid, NULL, NULL, '2026-08-05T09:00:00+03:00', '2026-08-05T10:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка деца - Кисьови', 'Кисьови', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-08-06T09:00:00+03:00', '2026-08-06T10:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка деца - Кисьови', 'Кисьови', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-08-07T09:00:00+03:00', '2026-08-07T10:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка деца - Кисьови', 'Кисьови', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-08-10T10:00:00+03:00', '2026-08-10T11:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка деца - Кисьови', 'Кисьови', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-08-11T08:00:00+03:00', '2026-08-11T09:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка деца - Кисьови', 'Кисьови', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-08-12T10:00:00+03:00', '2026-08-12T11:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка деца - Кисьови', 'Кисьови', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-08-13T09:00:00+03:00', '2026-08-13T10:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка деца - Кисьови', 'Кисьови', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-08-14T09:00:00+03:00', '2026-08-14T10:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка деца - Кисьови', 'Кисьови', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-08-17T09:00:00+03:00', '2026-08-17T10:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка деца - Кисьови', 'Кисьови', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-08-18T09:00:00+03:00', '2026-08-18T10:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка деца - Кисьови', 'Кисьови', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-08-19T09:00:00+03:00', '2026-08-19T10:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка деца - Кисьови', 'Кисьови', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-08-21T09:00:00+03:00', '2026-08-21T10:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка деца - Кисьови', 'Кисьови', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-08-24T09:00:00+03:00', '2026-08-24T10:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка деца - Кисьови', 'Кисьови', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-08-25T09:00:00+03:00', '2026-08-25T10:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка деца - Кисьови', 'Кисьови', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-08-26T09:00:00+03:00', '2026-08-26T10:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка деца - Кисьови', 'Кисьови', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-08-27T09:00:00+03:00', '2026-08-27T10:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка деца - Кисьови', 'Кисьови', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-08-28T09:00:00+03:00', '2026-08-28T10:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка деца - Кисьови', 'Кисьови', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-08-31T08:00:00+03:00', '2026-08-31T09:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка деца - Кисьови', 'Кисьови', '', '', 1, false)
  ON CONFLICT ON CONSTRAINT no_overlapping_bookings DO NOTHING;

  -- =============================================
  -- МАРЯНА — Индивидуална тренировка с треньор, 1 корт
  -- =============================================
  INSERT INTO bookings (
    court_id, user_id, coach_id, start_time, end_time,
    booking_type, status, total_price, notes,
    customer_name, customer_email, customer_phone, duration_hours, is_recurring
  ) VALUES
    (court_a_uuid, NULL, NULL, '2026-08-04T08:00:00+03:00', '2026-08-04T09:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка - Маряна', 'Маряна', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-08-05T08:00:00+03:00', '2026-08-05T09:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка - Маряна', 'Маряна', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-08-06T08:00:00+03:00', '2026-08-06T09:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка - Маряна', 'Маряна', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-08-07T08:00:00+03:00', '2026-08-07T09:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка - Маряна', 'Маряна', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-08-09T08:00:00+03:00', '2026-08-09T09:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка - Маряна', 'Маряна', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-08-10T09:00:00+03:00', '2026-08-10T10:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка - Маряна', 'Маряна', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-08-12T09:00:00+03:00', '2026-08-12T10:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка - Маряна', 'Маряна', '', '', 1, false),
    (court_a_uuid, NULL, NULL, '2026-08-13T08:00:00+03:00', '2026-08-13T09:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка - Маряна', 'Маряна', '', '', 1, false)
  ON CONFLICT ON CONSTRAINT no_overlapping_bookings DO NOTHING;

  -- =============================================
  -- ПЕТЯ ФИЛИП — Индивидуална тренировка с треньор, 1 корт
  -- 13 Aug 17:00–18:00
  -- =============================================
  INSERT INTO bookings (
    court_id, user_id, coach_id, start_time, end_time,
    booking_type, status, total_price, notes,
    customer_name, customer_email, customer_phone, duration_hours, is_recurring
  ) VALUES
    (court_a_uuid, NULL, NULL, '2026-08-13T17:00:00+03:00', '2026-08-13T18:00:00+03:00', 'coaching_session', 'confirmed', 45.00, 'Индивидуална тренировка - Петя Филип', 'Петя Филип', '', '', 1, false)
  ON CONFLICT ON CONSTRAINT no_overlapping_bookings DO NOTHING;

  -- =============================================
  -- СТАМЕН — Спаринг тренировка, 1 корт
  -- 9 Aug 19:00–20:00
  -- =============================================
  INSERT INTO bookings (
    court_id, user_id, coach_id, start_time, end_time,
    booking_type, status, total_price, notes,
    customer_name, customer_email, customer_phone, duration_hours, is_recurring
  ) VALUES
    (court_a_uuid, NULL, NULL, '2026-08-09T19:00:00+03:00', '2026-08-09T20:00:00+03:00', 'coaching_session', 'confirmed', 49.00, 'Спаринг тренировка - Стамен', 'Стамен', '', '', 1, false)
  ON CONFLICT ON CONSTRAINT no_overlapping_bookings DO NOTHING;

END $$;
