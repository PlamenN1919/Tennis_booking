import { z } from "zod";

// ============================================
// Booking Validation Schemas
// ============================================

export const bookingFormSchema = z.object({
  customerName: z
    .string()
    .min(2, "Името трябва да е поне 2 символа")
    .max(100, "Името е прекалено дълго"),
  customerPhone: z
    .string()
    .min(7, "Телефонният номер е прекалено кратък")
    .max(20, "Телефонният номер е прекалено дълъг")
    .regex(
      /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$/,
      "Невалиден телефонен номер"
    ),
  notes: z.string().max(500, "Забележките са прекалено дълги").optional(),
});

export const bookingSubmitSchema = z.object({
  bookingType: z.enum(["court_rental", "coaching_session"], {
    message: "Изберете тип услуга",
  }),
  date: z.string().min(1, "Изберете дата"),
  time: z.string().min(1, "Изберете час").regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Невалиден формат на часа").refine((val) => {
    const hours = parseInt(val.split(":")[0], 10);
    // Hardcode matching the business hours (8 to 24) since we can't easily import from booking-utils.ts here without potential circular dependencies or client/server boundary issues.
    return hours >= 8 && hours <= 23;
  }, "Избраният час е извън работното време (08:00 - 24:00)"),
  durationHours: z
    .number()
    .int()
    .min(1, "Минимум 1 час")
    .max(3, "Максимум 3 часа"),
  courtId: z.string().min(1, "Няма свободен корт"),
  coachId: z.string().nullable().optional(),
  coachingTypeSelected: z.enum(["individual", "pair", "sparring", "kids_5_8", "kids_8_11"]).nullable().optional(),
  customerName: z.string().min(2),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().min(7),
  notes: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringWeeks: z.number().int().min(1).max(12).optional(),
});

// ============================================
// Admin Manual Booking Schema
// ============================================

export const adminBookingSchema = z.object({
  customerName: z.string().min(2, "Въведете име на клиент"),
  date: z.string().min(1, "Изберете дата"),
  time: z.string().min(1, "Изберете час"),
  courtId: z.string().min(1, "Изберете корт"),
  bookingType: z.enum(["court_rental", "coaching_session"]).default("court_rental"),
  coachId: z.string().optional(),
  durationHours: z.number().int().min(1).max(3).default(1),
});

// Type exports
export type BookingFormData = z.infer<typeof bookingFormSchema>;
export type BookingSubmitData = z.infer<typeof bookingSubmitSchema>;
export type AdminBookingData = z.infer<typeof adminBookingSchema>;
