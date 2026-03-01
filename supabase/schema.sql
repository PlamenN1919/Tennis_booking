-- ============================================
-- Tennis Club Booking System - Database Schema
-- 2 Courts: Court A and Court B
-- Extended with pricing, coach schedules, booking limits, recurring
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Users Table
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  max_daily_bookings INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. Courts Table (exactly 2 courts) with pricing
-- ============================================
CREATE TABLE courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  surface_type TEXT NOT NULL DEFAULT 'clay',
  has_lighting BOOLEAN NOT NULL DEFAULT true,
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 40.00,
  peak_hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 60.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert the 2 courts
INSERT INTO courts (name, description, surface_type, has_lighting, hourly_rate, peak_hourly_rate) VALUES
  ('Корт A', 'Основен корт с осветление - глинена настилка', 'clay', true, 40.00, 60.00),
  ('Корт B', 'Втори корт с осветление - глинена настилка', 'clay', true, 40.00, 60.00);

-- ============================================
-- 3. Coaches Table with active status
-- ============================================
CREATE TABLE coaches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  bio TEXT,
  specialization TEXT,
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 80.00,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert coach
INSERT INTO coaches (name, bio, specialization, hourly_rate, is_active) VALUES
  ('Николай Димитров', 'Главен треньор. 15 години опит в професионалния тенис. Сертифициран треньор от БФТ.', 'Техника, тактика и физическа подготовка', 80.00, true);

-- ============================================
-- 4. Coach Schedules (availability per day of week)
-- ============================================
CREATE TABLE coach_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
  start_hour INTEGER NOT NULL CHECK (start_hour BETWEEN 7 AND 22),
  end_hour INTEGER NOT NULL CHECK (end_hour BETWEEN 7 AND 22),
  CONSTRAINT valid_schedule CHECK (end_hour > start_hour),
  UNIQUE(coach_id, day_of_week)
);

-- Default schedules: all coaches available Mon-Fri 9-20, Sat 9-18
INSERT INTO coach_schedules (coach_id, day_of_week, start_hour, end_hour)
SELECT c.id, d.day, 
  CASE WHEN d.day = 6 THEN 9 ELSE 9 END,
  CASE WHEN d.day = 6 THEN 18 ELSE 20 END
FROM coaches c
CROSS JOIN (VALUES (1),(2),(3),(4),(5),(6)) AS d(day);

-- ============================================
-- 5. Bookings Table with extended fields
-- ============================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_hours INTEGER NOT NULL DEFAULT 1,
  booking_type TEXT NOT NULL CHECK (booking_type IN ('court_rental', 'coaching_session')),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_group_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure end_time is after start_time
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- ============================================
-- 6. CRITICAL: Exclusion constraint to prevent overlapping bookings
-- ============================================

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings ADD CONSTRAINT no_overlapping_bookings 
  EXCLUDE USING gist (
    court_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  )
  WHERE (status = 'confirmed');

-- Prevent overlapping bookings for coaches
ALTER TABLE bookings ADD CONSTRAINT no_overlapping_coach 
  EXCLUDE USING gist (
    coach_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  )
  WHERE (status = 'confirmed' AND coach_id IS NOT NULL);

-- ============================================
-- 7. Pricing Configuration
-- ============================================
CREATE TABLE pricing_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE DEFAULT 'default',
  court_hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 40.00,
  court_peak_rate DECIMAL(10,2) NOT NULL DEFAULT 60.00,
  peak_start_hour INTEGER NOT NULL DEFAULT 17,
  peak_end_hour INTEGER NOT NULL DEFAULT 21,
  weekend_surcharge DECIMAL(5,2) NOT NULL DEFAULT 0.10, -- 10%
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO pricing_config (name) VALUES ('default');

-- ============================================
-- 8. Indexes for performance
-- ============================================
CREATE INDEX idx_bookings_court_time ON bookings (court_id, start_time, end_time);
CREATE INDEX idx_bookings_user ON bookings (user_id);
CREATE INDEX idx_bookings_status ON bookings (status);
CREATE INDEX idx_bookings_start_time ON bookings (start_time);
CREATE INDEX idx_bookings_recurring ON bookings (recurring_group_id) WHERE recurring_group_id IS NOT NULL;
CREATE INDEX idx_bookings_customer_email ON bookings (customer_email);
CREATE INDEX idx_coach_schedules_coach ON coach_schedules (coach_id);

-- ============================================
-- 9. Row Level Security (RLS) Policies
-- ============================================
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Anyone can view courts
CREATE POLICY "Anyone can view courts" ON courts
  FOR SELECT USING (true);

-- Anyone can view coaches
CREATE POLICY "Anyone can view coaches" ON coaches
  FOR SELECT USING (true);

-- Anyone can view coach schedules
CREATE POLICY "Anyone can view coach_schedules" ON coach_schedules
  FOR SELECT USING (true);

-- Anyone can view pricing
CREATE POLICY "Anyone can view pricing" ON pricing_config
  FOR SELECT USING (true);

-- Users can read all bookings (to see availability)
CREATE POLICY "Anyone can view bookings" ON bookings
  FOR SELECT USING (true);

-- Users can create their own bookings
CREATE POLICY "Users can create own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can cancel their own bookings
CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Admins full access bookings" ON bookings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins full access users" ON users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins full access coaches" ON coaches
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins full access coach_schedules" ON coach_schedules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins full access pricing" ON pricing_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 10. Function to auto-complete past bookings
-- ============================================
CREATE OR REPLACE FUNCTION complete_past_bookings()
RETURNS void AS $$
BEGIN
  UPDATE bookings 
  SET status = 'completed' 
  WHERE status = 'confirmed' 
  AND end_time < NOW();
END;
$$ LANGUAGE plpgsql;
