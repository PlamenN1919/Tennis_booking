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
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  duration_hours?: number;
  is_recurring?: boolean;
  recurring_group_id?: string | null;
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

// Group Training types
export type AgeGroup = "kids_5_8" | "kids_8_11";

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  kids_5_8: "Деца 5–8 години",
  kids_8_11: "Деца 8–11 години",
};

export interface GroupTraining {
  id: string;
  age_group: AgeGroup;
  date: string; // "YYYY-MM-DD" specific date
  start_time: string; // "HH:MM" format
  end_time: string; // "HH:MM" format
  max_participants: number;
  is_active: boolean;
  created_at: string;
}

export interface GroupTrainingRegistration {
  id: string;
  group_training_id: string;
  parent_name: string;
  child_name: string;
  child_age: number;
  phone: string;
  date: string; // specific date for this registration
  status: "confirmed" | "cancelled";
  created_at: string;
  // Joined
  group_training?: GroupTraining;
}

export const DAY_NAMES_BG: Record<number, string> = {
  0: "Неделя",
  1: "Понеделник",
  2: "Вторник",
  3: "Сряда",
  4: "Четвъртък",
  5: "Петък",
  6: "Събота",
};
