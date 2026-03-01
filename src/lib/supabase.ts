// Supabase client configuration
// Replace these with your actual Supabase project credentials
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Court {
  id: string;
  name: string;
  description: string;
  surface_type: string;
  has_lighting: boolean;
  created_at: string;
}

export interface Coach {
  id: string;
  name: string;
  bio: string;
  specialization: string;
  hourly_rate: number;
  avatar_url: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: "user" | "admin";
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  court_id: string;
  coach_id: string | null;
  start_time: string;
  end_time: string;
  booking_type: "court_rental" | "coaching_session";
  status: "confirmed" | "cancelled" | "completed";
  total_price: number;
  notes: string | null;
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
