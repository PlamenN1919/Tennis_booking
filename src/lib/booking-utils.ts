import {
  format,
  startOfDay,
  addHours,
  isBefore,
  isAfter,
  isToday,
} from "date-fns";
import { bg } from "date-fns/locale";
import type { Booking, TimeSlot } from "@/lib/supabase";

// Operating hours
export const OPENING_HOUR = 8; // 08:00
export const CLOSING_HOUR = 24; // 24:00
export const SLOT_DURATION = 1; // 1 hour slots
export const MAX_DURATION = 3; // max 3 hours per booking

// Peak hours (dynamic pricing)
export const PEAK_START = 17;
export const PEAK_END = 21;

// Court IDs (will be replaced with real Supabase UUIDs in production)
export const COURT_A_ID = "court-a";
export const COURT_B_ID = "court-b";

// Coaching Types & Prices (Euro)
export const COACHING_PRICES = {
  individual: 45,
  pair: 49,
  sparring: 49,
  kids_5_8: 20,
  kids_8_11: 20
} as const;

export type CoachingType = keyof typeof COACHING_PRICES;

export const COACHING_LABELS: Record<CoachingType, string> = {
  individual: "Индивидуална тренировка",
  pair: "Екипна тренировка за двама",
  sparring: "Спаринг тренировка",
  kids_5_8: "Групово занимание за деца (5–8 г.)",
  kids_8_11: "Групово занимание за деца (8–11 г.)"
};

/**
 * Generate all time slots for a given date
 * Filters out past hours if the date is today
 */
export function generateTimeSlots(date: Date): string[] {
  const slots: string[] = [];
  const dayStart = startOfDay(date);
  const now = new Date();

  for (let hour = OPENING_HOUR; hour < CLOSING_HOUR; hour++) {
    const slotTime = addHours(dayStart, hour);

    // Skip past time slots for today
    if (isToday(date) && isBefore(slotTime, now)) {
      continue;
    }

    slots.push(format(slotTime, "HH:mm"));
  }

  return slots;
}

/**
 * Check if a specific time slot on a specific court is available
 * Supports multi-hour duration checking
 */
export function isSlotAvailable(
  date: Date,
  time: string,
  courtId: string,
  existingBookings: Booking[],
  durationHours: number = 1
): boolean {
  const [hours, minutes] = time.split(":").map(Number);
  const slotStart = new Date(date);
  slotStart.setHours(hours, minutes, 0, 0);

  const slotEnd = new Date(slotStart);
  slotEnd.setHours(slotEnd.getHours() + durationHours);

  // Check if the booking would go past closing time
  const closingTime = new Date(slotStart);
  closingTime.setHours(CLOSING_HOUR, 0, 0, 0); // If CLOSING_HOUR is 24, this becomes 00:00 next day
  if (slotEnd > closingTime) {
    return false;
  }

  // Check if slot is in the past (for today)
  if (isToday(date) && isBefore(slotStart, new Date())) {
    return false;
  }

  return !existingBookings.some((booking) => {
    if (booking.court_id !== courtId) return false;
    if (booking.status === "cancelled") return false;

    const bookingStart = new Date(booking.start_time);
    const bookingEnd = new Date(booking.end_time);

    // Overlap detection: (ExistingStart < NewEnd) AND (ExistingEnd > NewStart)
    return isBefore(bookingStart, slotEnd) && isAfter(bookingEnd, slotStart);
  });
}

/**
 * Check if a coach is available at a given time
 */
export function isCoachAvailable(
  date: Date,
  time: string,
  coachId: string,
  existingBookings: Booking[],
  durationHours: number = 1
): boolean {
  const [hours, minutes] = time.split(":").map(Number);
  const slotStart = new Date(date);
  slotStart.setHours(hours, minutes, 0, 0);

  const slotEnd = new Date(slotStart);
  slotEnd.setHours(slotEnd.getHours() + durationHours);

  return !existingBookings.some((booking) => {
    if (booking.coach_id !== coachId) return false;
    if (booking.status === "cancelled") return false;

    const bookingStart = new Date(booking.start_time);
    const bookingEnd = new Date(booking.end_time);

    return isBefore(bookingStart, slotEnd) && isAfter(bookingEnd, slotStart);
  });
}

/**
 * Get availability for all time slots on a given date
 * Smart check: at least one court must be free for the slot to be "available"
 */
export function getTimeSlotsWithAvailability(
  date: Date,
  bookings: Booking[],
  durationHours: number = 1
): TimeSlot[] {
  const times = generateTimeSlots(date);

  return times.map((time) => {
    const courtAFree = isSlotAvailable(date, time, COURT_A_ID, bookings, durationHours);
    const courtBFree = isSlotAvailable(date, time, COURT_B_ID, bookings, durationHours);

    return {
      time,
      courtA: courtAFree,
      courtB: courtBFree,
      available: courtAFree || courtBFree,
    };
  });
}

/**
 * Find the best available court for a given slot
 * If preferredCourtId is provided, try that first
 */
export function findAvailableCourt(
  date: Date,
  time: string,
  bookings: Booking[],
  durationHours: number = 1,
  preferredCourtId?: string | null
): string | null {
  // Try preferred court first
  if (preferredCourtId) {
    if (isSlotAvailable(date, time, preferredCourtId, bookings, durationHours)) {
      return preferredCourtId;
    }
  }

  if (isSlotAvailable(date, time, COURT_A_ID, bookings, durationHours))
    return COURT_A_ID;
  if (isSlotAvailable(date, time, COURT_B_ID, bookings, durationHours))
    return COURT_B_ID;
  return null;
}

/**
 * Calculate price for a booking
 * Dynamic pricing based on peak/off-peak hours and weekends
 */
export function calculateLocalPrice(
  time: string,
  durationHours: number,
  date: Date,
  bookingType: "court_rental" | "coaching_session",
  coachingTypeSelected?: CoachingType | null
): number {
  // 1. Coaching Session Pricing (Fixed per hour based on type, includes everything)
  if (bookingType === "coaching_session" && coachingTypeSelected) {
    const hourlyRate = COACHING_PRICES[coachingTypeSelected] || 45;
    return hourlyRate * durationHours;
  }

  // 2. Standard Court Rental Pricing
  const [startHour] = time.split(":").map(Number);
  let total = 0;

  for (let h = 0; h < durationHours; h++) {
    const currentHour = startHour + h;
    let hourRate = 20; // fallback

    if (currentHour >= 8 && currentHour < 12) {
      hourRate = 20;
    } else if (currentHour >= 12 && currentHour < 16) {
      hourRate = 15;
    } else if (currentHour >= 16 && currentHour < 19) {
      hourRate = 20;
    } else if (currentHour >= 19 && currentHour < 24) {
      hourRate = 25;
    }

    total += hourRate;
  }

  return total;
}

/**
 * Check maximum consecutive hours available from a given time
 */
export function getMaxConsecutiveHours(
  date: Date,
  time: string,
  courtId: string,
  bookings: Booking[]
): number {
  let maxHours = 0;
  for (let h = 1; h <= MAX_DURATION; h++) {
    if (isSlotAvailable(date, time, courtId, bookings, h)) {
      maxHours = h;
    } else {
      break;
    }
  }
  return maxHours;
}

/**
 * Format date for display in Bulgarian
 */
export function formatDateBG(date: Date): string {
  return format(date, "EEEE, d MMMM yyyy", { locale: bg });
}

/**
 * Format time range
 */
export function formatTimeRange(time: string, durationHours: number = 1): string {
  const [hours] = time.split(":").map(Number);
  const endHour = hours + durationHours;
  return `${time} - ${String(endHour).padStart(2, "0")}:00`;
}

/**
 * Check if a time is in peak hours
 */
export function isPeakHour(hour: number): boolean {
  return hour >= PEAK_START && hour < PEAK_END;
}
