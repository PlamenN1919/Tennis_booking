import type { GroupTraining, GroupTrainingRegistration } from "@/lib/supabase";
import { mockGroupTrainings, mockGroupTrainingRegistrations } from "@/lib/mock-data";

const TRAININGS_KEY = "tennis_club_oasis_group_trainings";
const REGISTRATIONS_KEY = "tennis_club_oasis_group_registrations";

/**
 * Get group trainings from localStorage, falling back to mock data.
 */
export function getStoredGroupTrainings(): GroupTraining[] {
  if (typeof window === "undefined") return mockGroupTrainings;
  try {
    const stored = localStorage.getItem(TRAININGS_KEY);
    if (stored) {
      const parsed: GroupTraining[] = JSON.parse(stored);
      // Filter out stale entries from the old day_of_week format
      const valid = parsed.filter((t) => typeof t.date === "string");
      if (valid.length === 0) {
        // All entries are stale – clear and fall back to mock data
        localStorage.removeItem(TRAININGS_KEY);
        return mockGroupTrainings;
      }
      return valid;
    }
  } catch {
    // ignore parse errors
  }
  return mockGroupTrainings;
}

/**
 * Save group trainings to localStorage.
 */
export function saveGroupTrainings(trainings: GroupTraining[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TRAININGS_KEY, JSON.stringify(trainings));
    // Dispatch a custom event so other tabs/components can react
    window.dispatchEvent(new CustomEvent("group-trainings-updated", { detail: trainings }));
  } catch {
    // ignore quota errors
  }
}

/**
 * Get group training registrations from localStorage, falling back to mock data.
 */
export function getStoredRegistrations(): GroupTrainingRegistration[] {
  if (typeof window === "undefined") return mockGroupTrainingRegistrations;
  try {
    const stored = localStorage.getItem(REGISTRATIONS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore parse errors
  }
  return mockGroupTrainingRegistrations;
}

/**
 * Save group training registrations to localStorage.
 */
export function saveRegistrations(registrations: GroupTrainingRegistration[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(registrations));
    window.dispatchEvent(new CustomEvent("group-registrations-updated", { detail: registrations }));
  } catch {
    // ignore quota errors
  }
}
