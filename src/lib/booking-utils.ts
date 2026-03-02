import {
  format,
  startOfDay,
  addHours,
  isBefore,
  isAfter,
  areIntervalsOverlapping,
} from "date-fns";
import { bg } from "date-fns/locale";
import type { Booking, TimeSlot, GroupTraining } from "@/lib/supabase";
import { AGE_GROUP_LABELS } from "@/lib/supabase";

// Operating hours
export const OPENING_HOUR = 8; // 08:00
export const CLOSING_HOUR = 24; // 24:00
export const SLOT_DURATION = 1; // 1 hour slots

// Court IDs (defaults for local/mock mode; overridden at runtime when Supabase is connected)
export let COURT_A_ID = "court-a";
export let COURT_B_ID = "court-b";

/**
 * Set the actual court IDs at runtime (e.g. from Supabase UUIDs).
 * Call this once courts are loaded from the database.
 */
export function setCourtIds(courtAId: string, courtBId: string): void {
  COURT_A_ID = courtAId;
  COURT_B_ID = courtBId;
}

/**
 * Returns the current court IDs as an array (for functions that iterate).
 */
export function getCourtIds(): [string, string] {
  return [COURT_A_ID, COURT_B_ID];
}

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

/** Racket rental add-on price (includes 3 balls) */
export const RACKET_RENTAL_PRICE = 5;

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
 * Also marks past slots for today as unavailable.
 */
export function getTimeSlotsWithAvailability(
  date: Date,
  bookings: Booking[]
): TimeSlot[] {
  const times = generateTimeSlots(date);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const currentHour = now.getHours();

  return times.map((time) => {
    const [hour] = time.split(":").map(Number);

    // Past slots for today are not available
    if (isToday && hour <= currentHour) {
      return { time, courtA: false, courtB: false, available: false };
    }

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
 * Check if a specific court is available for a given duration (multiple consecutive hours)
 */
export function isCourtAvailableForDuration(
  date: Date,
  time: string,
  courtId: string,
  durationHours: number,
  bookings: Booking[]
): boolean {
  const [startHour] = time.split(":").map(Number);
  for (let h = 0; h < durationHours; h++) {
    const checkTime = `${String(startHour + h).padStart(2, "0")}:00`;
    if (startHour + h >= CLOSING_HOUR) return false;
    if (!isSlotAvailable(date, checkTime, courtId, bookings)) return false;
  }
  return true;
}

/**
 * Get the maximum available consecutive hours for a court starting at a given time
 */
export function getMaxAvailableDuration(
  date: Date,
  time: string,
  courtId: string,
  bookings: Booking[],
  maxHours: number = 3
): number {
  const [startHour] = time.split(":").map(Number);
  let available = 0;
  for (let h = 0; h < maxHours; h++) {
    if (startHour + h >= CLOSING_HOUR) break;
    const checkTime = `${String(startHour + h).padStart(2, "0")}:00`;
    if (!isSlotAvailable(date, checkTime, courtId, bookings)) break;
    available++;
  }
  return available;
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
export function formatTimeRange(time: string, durationHours: number = SLOT_DURATION): string {
  const [hours] = time.split(":").map(Number);
  const endHour = hours + durationHours;
  return `${time} - ${String(endHour).padStart(2, "0")}:00`;
}

/**
 * Convert active group trainings into virtual Booking objects so that
 * all existing availability checks (isSlotAvailable, getTimeSlotsWithAvailability,
 * findAvailableCourt, AdminCalendar grid, etc.) automatically treat group-training
 * time slots as occupied.
 *
 * Court auto-assignment: each group training is assigned to Court A if it's free
 * at that time; otherwise Court B. Trainings are processed sequentially so two
 * simultaneous group trainings will occupy different courts.
 */
export function groupTrainingsToVirtualBookings(
  groupTrainings: GroupTraining[],
  existingBookings: Booking[]
): Booking[] {
  const virtualBookings: Booking[] = [];
  const activeTrainings = groupTrainings.filter((t) => t.is_active);

  for (const t of activeTrainings) {
    if (!t.date || typeof t.date !== "string") continue;
    const [y, mo, da] = t.date.split("-").map(Number);
    if (!y || !mo || !da) continue;

    const [startH] = t.start_time.split(":").map(Number);
    const [endH] = t.end_time.split(":").map(Number);

    const startTime = new Date(y, mo - 1, da, startH, 0, 0, 0);
    const endTime = new Date(y, mo - 1, da, endH, 0, 0, 0);

    // Check Court A availability against real bookings + already-assigned virtual ones
    const allSoFar = [...existingBookings, ...virtualBookings];
    const courtABusy = allSoFar.some((b) => {
      if (b.court_id !== COURT_A_ID || b.status === "cancelled") return false;
      const bStart = new Date(b.start_time);
      const bEnd = new Date(b.end_time);
      return isBefore(bStart, endTime) && isAfter(bEnd, startTime);
    });

    const courtId = courtABusy ? COURT_B_ID : COURT_A_ID;

    virtualBookings.push({
      id: `virtual-gt-${t.id}`,
      user_id: "group-training",
      court_id: courtId,
      coach_id: null,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      booking_type: "coaching_session" as const,
      status: "confirmed" as const,
      total_price: 0,
      notes: `Групова тренировка: ${AGE_GROUP_LABELS[t.age_group]}`,
      created_at: t.created_at,
    });
  }

  return virtualBookings;
}
