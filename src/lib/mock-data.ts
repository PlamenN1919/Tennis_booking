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

export const mockBookings: Booking[] = [];

// ============================================
// Group Trainings Mock Data
// ============================================

export const mockGroupTrainings: GroupTraining[] = [];
export const mockGroupTrainingRegistrations: GroupTrainingRegistration[] = [];
