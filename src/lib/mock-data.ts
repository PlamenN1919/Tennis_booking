import type { Booking, GroupTraining, GroupTrainingRegistration } from "@/lib/supabase";
import { COURT_A_ID, COURT_B_ID } from "@/lib/booking-utils";

// Mock data for development (replace with Supabase queries in production)

export const mockCourts = [
  {
    id: COURT_A_ID,
    name: "Корт A",
    description: "Основен корт с осветление - глинена настилка",
    surface_type: "clay",
    has_lighting: true,
    created_at: new Date().toISOString(),
  },
  {
    id: COURT_B_ID,
    name: "Корт B",
    description: "Втори корт с осветление - глинена настилка",
    surface_type: "clay",
    has_lighting: true,
    created_at: new Date().toISOString(),
  },
];

export const mockCoaches = [
  {
    id: "coach-1",
    name: "Николай Димитров",
    bio: "15 години опит в професионалния тенис. Сертифициран треньор от БФТ.",
    specialization: "Техника на сервис и воле",
    hourly_rate: 45,
    avatar_url: "",
    created_at: new Date().toISOString(),
  },
  {
    id: "coach-2",
    name: "Ана Стоянова",
    bio: "Бивша състезателка с международен опит. Специалист по детска подготовка.",
    specialization: "Детски тенис и начинаещи",
    hourly_rate: 45,
    avatar_url: "",
    created_at: new Date().toISOString(),
  },
  {
    id: "coach-3",
    name: "Петър Георгиев",
    bio: "Фитнес треньор и тенис кондиционен специалист.",
    specialization: "Кондиционна подготовка",
    hourly_rate: 49,
    avatar_url: "",
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
      booking_type: "court_rental",
      status: "confirmed",
      total_price: 20,
      notes: null,
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
      booking_type: "coaching_session",
      status: "confirmed",
      total_price: 45,
      notes: null,
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
      booking_type: "court_rental",
      status: "confirmed",
      total_price: 15,
      notes: null,
      created_at: new Date().toISOString(),
    },
    // Today: Court B booked at 18:00-19:00
    {
      id: "booking-4",
      user_id: "user-1",
      court_id: COURT_B_ID,
      coach_id: null,
      start_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0).toISOString(),
      end_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 0).toISOString(),
      booking_type: "court_rental",
      status: "confirmed",
      total_price: 20,
      notes: null,
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
      booking_type: "coaching_session",
      status: "confirmed",
      total_price: 45,
      notes: null,
      created_at: new Date().toISOString(),
    },
  ];

  return bookings;
}

export const mockBookings = generateMockBookings();

// ============================================
// Group Trainings Mock Data
// ============================================

// Helper to get upcoming dates for mock data
function getUpcomingDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

export const mockGroupTrainings: GroupTraining[] = [
  {
    id: "gt-1",
    age_group: "kids_5_8",
    date: getUpcomingDate(1),
    start_time: "16:00",
    end_time: "17:00",
    max_participants: 10,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "gt-2",
    age_group: "kids_5_8",
    date: getUpcomingDate(3),
    start_time: "16:00",
    end_time: "17:00",
    max_participants: 10,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "gt-3",
    age_group: "kids_8_11",
    date: getUpcomingDate(2),
    start_time: "17:00",
    end_time: "18:00",
    max_participants: 10,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "gt-4",
    age_group: "kids_8_11",
    date: getUpcomingDate(5),
    start_time: "17:00",
    end_time: "18:00",
    max_participants: 10,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const mockGroupTrainingRegistrations: GroupTrainingRegistration[] = [
  {
    id: "gtr-1",
    group_training_id: "gt-1",
    parent_name: "Мария Иванова",
    child_name: "Боян Иванов",
    child_age: 6,
    phone: "0888123456",
    date: getUpcomingDate(1),
    status: "confirmed",
    created_at: new Date().toISOString(),
  },
  {
    id: "gtr-2",
    group_training_id: "gt-1",
    parent_name: "Георги Петров",
    child_name: "Ана Петрова",
    child_age: 7,
    phone: "0899654321",
    date: getUpcomingDate(1),
    status: "confirmed",
    created_at: new Date().toISOString(),
  },
];
