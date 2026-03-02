import type { Booking } from "@/lib/supabase";
import { mockBookings } from "@/lib/mock-data";

const BOOKINGS_KEY = "tennis_club_oasis_bookings";

/**
 * Get bookings from localStorage, falling back to mock data.
 */
export function getStoredBookings(): Booking[] {
  if (typeof window === "undefined") return mockBookings;
  try {
    const stored = localStorage.getItem(BOOKINGS_KEY);
    if (stored) {
      const parsed: Booking[] = JSON.parse(stored);
      return parsed;
    }
  } catch {
    // ignore parse errors
  }
  return mockBookings;
}

/**
 * Save bookings to localStorage.
 */
export function saveBookings(bookings: Booking[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    // Dispatch a custom event so other tabs/components can react
    window.dispatchEvent(new CustomEvent("bookings-updated", { detail: bookings }));
  } catch {
    // ignore quota errors
  }
}

/**
 * Add a new booking to the stored bookings.
 */
export function addStoredBooking(booking: Booking): void {
  const currentBookings = getStoredBookings();
  const updatedBookings = [...currentBookings, booking];
  saveBookings(updatedBookings);
}

/**
 * Clear all stored bookings (reset to mock data).
 */
export function clearStoredBookings(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(BOOKINGS_KEY);
    window.dispatchEvent(new CustomEvent("bookings-updated", { detail: mockBookings }));
  } catch {
    // ignore errors
  }
}