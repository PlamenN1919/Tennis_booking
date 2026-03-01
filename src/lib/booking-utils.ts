import {
  format,
  startOfDay,
  addHours,
  isBefore,
  isAfter,
  areIntervalsOverlapping,
} from "date-fns";
import { bg } from "date-fns/locale";
import type { Booking, TimeSlot } from "@/lib/supabase";

// Operating hours
export const OPENING_HOUR = 8; // 08:00
export const CLOSING_HOUR = 24; // 24:00
export const SLOT_DURATION = 1; // 1 hour slots

// Court IDs (will be replaced with real Supabase UUIDs in production)
export const COURT_A_ID = "court-a";
export const COURT_B_ID = "court-b";

// ============================================
// Pricing
// ============================================

/**
 * Get court rental price per hour based on time of day
 * 08:00–12:00 → 20€ | 12:00–16:00 → 15€ | 16:00–19:00 → 20€ | 19:00–24:00 → 25€
 */
export function getCourtHourlyPrice(hour: number): number {
  if (hour >= 8 && hour < 12) return 20;
  if (hour >= 12 && hour < 16) return 15;
  if (hour >= 16 && hour < 19) return 20;
  if (hour >= 19 && hour < 24) return 25;
  return 20; // fallback
}

/** Coaching session types */
export type CoachingType = "individual" | "pair" | "sparring" | "kids_5_8" | "kids_8_11";

/** Fixed coaching prices (include court + racket) */
export const COACHING_PRICES: Record<CoachingType, number> = {
  individual: 45,
  pair: 49,
  sparring: 49,
  kids_5_8: 20,
  kids_8_11: 20,
};

/** Human-readable labels for coaching types */
export const COACHING_LABELS: Record<CoachingType, string> = {
  individual: "Индивидуална тренировка с проф. треньор",
  pair: "Екипна тренировка за двама с проф. треньор",
  sparring: "Спаринг тренировка с проф. треньор",
  kids_5_8: "Групово занимание за деца (5–8 г.)",
  kids_8_11: "Групово занимание за деца (8–11 г.)",
};

/** Basket rental add-on price */
export const BASKET_RENTAL_PRICE = 10;

/**
 * Calculate total price for a booking based on time, duration and type
 */
export function calculateLocalPrice(
  time: string,
  durationHours: number,
  _date: Date,
  bookingType: "court_rental" | "coaching_session",
  coachingTypeSelected: CoachingType | null
): number {
  if (bookingType === "coaching_session" && coachingTypeSelected) {
    return COACHING_PRICES[coachingTypeSelected] * durationHours;
  }

  // Court rental: sum per-hour prices
  const [startHour] = time.split(":").map(Number);
  let total = 0;
  for (let h = 0; h < durationHours; h++) {
    total += getCourtHourlyPrice(startHour + h);
  }
  return total;
}

/**
 * Generate all time slots for a given date
 */
export function generateTimeSlots(date: Date): string[] {
  const slots: string[] = [];
  const dayStart = startOfDay(date);

  for (let hour = OPENING_HOUR; hour < CLOSING_HOUR; hour++) {
    const slotTime = addHours(dayStart, hour);
    slots.push(format(slotTime, "HH:mm"));
  }

  return slots;
}

/**
 * Check if a specific time slot on a specific court is available
 * Implements: IF (Existing.Start < New.End) AND (Existing.End > New.Start) THEN Busy
 */
export function isSlotAvailable(
  date: Date,
  time: string,
  courtId: string,
  existingBookings: Booking[]
): boolean {
  const [hours, minutes] = time.split(":").map(Number);
  const slotStart = new Date(date);
  slotStart.setHours(hours, minutes, 0, 0);

  const slotEnd = new Date(slotStart);
  slotEnd.setHours(slotEnd.getHours() + SLOT_DURATION);

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
 * Get availability for all time slots on a given date
 * Smart check: at least one court must be free for the slot to be "available"
 */
export function getTimeSlotsWithAvailability(
  date: Date,
  bookings: Booking[]
): TimeSlot[] {
  const times = generateTimeSlots(date);

  return times.map((time) => {
    const courtAFree = isSlotAvailable(date, time, COURT_A_ID, bookings);
    const courtBFree = isSlotAvailable(date, time, COURT_B_ID, bookings);

    return {
      time,
      courtA: courtAFree,
      courtB: courtBFree,
      available: courtAFree || courtBFree, // At least one court is free
    };
  });
}

/**
 * Find the best available court for a given slot
 * Returns the court ID or null if none available
 */
export function findAvailableCourt(
  date: Date,
  time: string,
  bookings: Booking[]
): string | null {
  if (isSlotAvailable(date, time, COURT_A_ID, bookings)) return COURT_A_ID;
  if (isSlotAvailable(date, time, COURT_B_ID, bookings)) return COURT_B_ID;
  return null;
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
export function formatTimeRange(time: string): string {
  const [hours] = time.split(":").map(Number);
  const endHour = hours + SLOT_DURATION;
  return `${time} - ${String(endHour).padStart(2, "0")}:00`;
}
