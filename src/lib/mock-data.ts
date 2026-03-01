import type { Booking } from "@/lib/supabase";
import { COURT_A_ID, COURT_B_ID } from "@/lib/booking-utils";

// Mock data for development (replace with Supabase queries in production)

export const mockCourts = [
  {
    id: COURT_A_ID,
    name: "Корт A",
    description: "Основен корт с осветление - глинена настилка",
    surface_type: "clay",
    has_lighting: true,
    hourly_rate: 40,
    peak_hourly_rate: 60,
    created_at: new Date().toISOString(),
  },
  {
    id: COURT_B_ID,
    name: "Корт B",
    description: "Втори корт с осветление - глинена настилка",
    surface_type: "clay",
    has_lighting: true,
    hourly_rate: 40,
    peak_hourly_rate: 60,
    created_at: new Date().toISOString(),
  },
];

export const mockCoaches = [
  {
    id: "coach-1",
    name: "Индивидуална тренировка",
    bio: "Тренировка с професионален треньор.",
    specialization: "С професионален треньор",
    hourly_rate: 45,
    avatar_url: "",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "coach-2",
    name: "Екипна тренировка",
    bio: "Екипна тренировка за двама с проф. треньор.",
    specialization: "За двама",
    hourly_rate: 49,
    avatar_url: "",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "coach-3",
    name: "Спаринг тренировка",
    bio: "Практика и игра на точки.",
    specialization: "С професионален треньор",
    hourly_rate: 49,
    avatar_url: "",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "coach-4",
    name: "Група деца (5–8 г.)",
    bio: "Групово занимание за начинаещи деца.",
    specialization: "Начинаещи",
    hourly_rate: 20,
    avatar_url: "",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "coach-5",
    name: "Група деца (8–11 г.)",
    bio: "Групово занимание за начинаещи деца.",
    specialization: "Начинаещи",
    hourly_rate: 20,
    avatar_url: "",
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

// Generate some mock bookings for today and tomorrow
function generateMockBookings(): Booking[] {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const bookings: Booking[] = [
    // Today: Court A booked at 10:00-11:00
    {
      id: "booking-1",
      user_id: "user-1",
      court_id: COURT_A_ID,
      coach_id: null,
      start_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0).toISOString(),
      end_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0).toISOString(),
      duration_hours: 1,
      booking_type: "court_rental",
      status: "confirmed",
      total_price: 40,
      notes: null,
      customer_name: "Иван Петров",
      customer_email: "ivan@test.com",
      customer_phone: "+359888111222",
      is_recurring: false,
      recurring_group_id: null,
      created_at: new Date().toISOString(),
    },
    // Today: Court A booked at 14:00-15:00
    {
      id: "booking-2",
      user_id: "user-2",
      court_id: COURT_A_ID,
      coach_id: "coach-1",
      start_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0).toISOString(),
      end_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0).toISOString(),
      duration_hours: 1,
      booking_type: "coaching_session",
      status: "confirmed",
      total_price: 120,
      notes: null,
      customer_name: "Мария Кирилова",
      customer_email: "maria@test.com",
      customer_phone: "+359888222333",
      is_recurring: false,
      recurring_group_id: null,
      created_at: new Date().toISOString(),
    },
    // Today: Court B booked at 14:00-15:00 (both courts busy at 14:00!)
    {
      id: "booking-3",
      user_id: "user-3",
      court_id: COURT_B_ID,
      coach_id: null,
      start_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0).toISOString(),
      end_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0).toISOString(),
      duration_hours: 1,
      booking_type: "court_rental",
      status: "confirmed",
      total_price: 40,
      notes: null,
      customer_name: "Георги Стоянов",
      customer_email: "georgi@test.com",
      customer_phone: "+359888333444",
      is_recurring: false,
      recurring_group_id: null,
      created_at: new Date().toISOString(),
    },
    // Today: Court B booked at 18:00-19:00 (peak hour)
    {
      id: "booking-4",
      user_id: "user-1",
      court_id: COURT_B_ID,
      coach_id: null,
      start_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0).toISOString(),
      end_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 0).toISOString(),
      duration_hours: 1,
      booking_type: "court_rental",
      status: "confirmed",
      total_price: 60,
      notes: null,
      customer_name: "Иван Петров",
      customer_email: "ivan@test.com",
      customer_phone: "+359888111222",
      is_recurring: false,
      recurring_group_id: null,
      created_at: new Date().toISOString(),
    },
    // Tomorrow: Court A booked at 9:00-10:00
    {
      id: "booking-5",
      user_id: "user-2",
      court_id: COURT_A_ID,
      coach_id: "coach-2",
      start_time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 9, 0).toISOString(),
      end_time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0).toISOString(),
      duration_hours: 1,
      booking_type: "coaching_session",
      status: "confirmed",
      total_price: 110,
      notes: null,
      customer_name: "Мария Кирилова",
      customer_email: "maria@test.com",
      customer_phone: "+359888222333",
      is_recurring: false,
      recurring_group_id: null,
      created_at: new Date().toISOString(),
    },
  ];

  return bookings;
}

export const mockBookings = generateMockBookings();
