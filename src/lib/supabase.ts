// Supabase client configuration
import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";

// Legacy client (for backwards compatibility)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Browser client (for client components)
export function createBrowserSupabaseClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Database types
export interface Court {
  id: string;
  name: string;
  description: string;
  surface_type: string;
  has_lighting: boolean;
  hourly_rate: number;
  peak_hourly_rate: number;
  created_at: string;
}

export interface Coach {
  id: string;
  name: string;
  bio: string;
  specialization: string;
  hourly_rate: number;
  avatar_url: string;
  is_active: boolean;
  created_at: string;
}

export interface CoachSchedule {
  id: string;
  coach_id: string;
  day_of_week: number;
  start_hour: number;
  end_hour: number;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: "user" | "admin";
  max_daily_bookings: number;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  court_id: string;
  coach_id: string | null;
  start_time: string;
  end_time: string;
  duration_hours: number;
  booking_type: "court_rental" | "coaching_session";
  status: "confirmed" | "cancelled" | "completed";
  total_price: number;
  notes: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  is_recurring: boolean;
  recurring_group_id: string | null;
  created_at: string;
  // Joined fields
  court?: Court;
  coach?: Coach;
  user?: User;
}

export interface TimeSlot {
  time: string;
  courtA: boolean;
  courtB: boolean;
  available: boolean;
}

export interface PricingConfig {
  id: string;
  name: string;
  court_hourly_rate: number;
  court_peak_rate: number;
  peak_start_hour: number;
  peak_end_hour: number;
  weekend_surcharge: number;
}
