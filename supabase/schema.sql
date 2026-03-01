-- ============================================
-- Tennis Club Booking System - Database Schema
-- 2 Courts: Court A and Court B
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. Courts Table (exactly 2 courts)
-- ============================================
CREATE TABLE courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  surface_type TEXT NOT NULL DEFAULT 'clay',
  has_lighting BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert the 2 courts
INSERT INTO courts (name, description, surface_type, has_lighting) VALUES
  ('Корт A', 'Основен корт с осветление - глинена настилка', 'clay', true),
  ('Корт B', 'Втори корт с осветление - глинена настилка', 'clay', true);

-- ============================================
-- 3. Coaches Table
-- ============================================
CREATE TABLE coaches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  bio TEXT,
  specialization TEXT,
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 80.00,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 4. Bookings Table with overlap prevention
-- ============================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  booking_type TEXT NOT NULL CHECK (booking_type IN ('court_rental', 'coaching_session')),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure end_time is after start_time
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- ============================================
-- 5. CRITICAL: Exclusion constraint to prevent overlapping bookings
-- This prevents double-booking the same court for overlapping time ranges.
-- Logic: IF (ExistingBooking.Start < NewBooking.End) 
--        AND (ExistingBooking.End > NewBooking.Start) 
--        AND (Court_ID matches) THEN Reject
-- ============================================

-- Enable btree_gist extension for exclusion constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add exclusion constraint: no two confirmed bookings can overlap on the same court
ALTER TABLE bookings ADD CONSTRAINT no_overlapping_bookings 
  EXCLUDE USING gist (
    court_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  )
  WHERE (status = 'confirmed');

-- ============================================
-- 6. Indexes for performance
-- ============================================
CREATE INDEX idx_bookings_court_time ON bookings (court_id, start_time, end_time);
CREATE INDEX idx_bookings_user ON bookings (user_id);
CREATE INDEX idx_bookings_status ON bookings (status);
CREATE INDEX idx_bookings_start_time ON bookings (start_time);

-- ============================================
-- 7. Row Level Security (RLS) Policies
-- ============================================
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can read all bookings (to see availability)
CREATE POLICY "Anyone can view bookings" ON bookings
  FOR SELECT USING (true);

-- Users can create their own bookings
CREATE POLICY "Users can create own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

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
