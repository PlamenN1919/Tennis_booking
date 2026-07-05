"use server";

import {
  createServerSupabaseClient,
  isSupabaseConfigured,
  isServerUserAdmin,
} from "@/lib/supabase-server";
import { bookingSubmitSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { sofiaToUTC } from "@/lib/booking-utils";
import type { Booking } from "@/lib/supabase";

// ============================================
// Authorization helper
// ============================================

/**
 * Gate for admin-only actions. In local mock mode (no Supabase) everything is
 * allowed — there is no auth infrastructure to check against.
 */
async function requireAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: true };
  }
  if (await isServerUserAdmin()) {
    return { ok: true };
  }
  return { ok: false, error: "Изисква се вход като администратор." };
}

// Booking columns safe for ANONYMOUS reads — everything needed for
// availability display, WITHOUT personal data (customer name/email/phone,
// notes). The DB enforces this too: anon has column-level SELECT grants on
// exactly these columns (see supabase/privacy-and-coach-portal.sql), so an
// anon `select("*")` on bookings would be rejected outright.
const PUBLIC_BOOKING_COLUMNS =
  "id, user_id, court_id, coach_id, start_time, end_time, booking_type, status, total_price, duration_hours, is_recurring, recurring_group_id, created_at";

// ============================================
// Booking Actions
// ============================================

export async function createBooking(formData: {
  bookingType: "court_rental" | "coaching_session";
  date: string;
  time: string;
  durationHours: number;
  courtId: string;
  coachId?: string | null;
  coachingTypeSelected?: string | null;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  notes?: string;
  isRecurring?: boolean;
  recurringWeeks?: number;
  wantsBasket?: boolean;
  wantsRacket?: boolean;
}) {
  // Check if Supabase is configured.
  // Return a marker instead of throwing: thrown server-action errors get
  // masked in production builds, so clients can't reliably detect this case
  // from the error message.
  if (!isSupabaseConfigured()) {
    return { localMode: true as const };
  }

  const supabase = await createServerSupabaseClient();

  // Validate input
  const parsed = bookingSubmitSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  const data = parsed.data;

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userId = user?.id || null;

  // Check booking limits for authenticated users
  if (userId) {
    const { data: profile } = await supabase
      .from("users")
      .select("max_daily_bookings, role")
      .eq("id", userId)
      .single();

    if (profile?.role === "admin") {
      // Admins create bookings on behalf of customers — store them as guest
      // bookings (customer identified by name/phone) and skip the personal
      // daily limit, which would otherwise cap the admin at 3 bookings/day.
      userId = null;
    } else {
      const maxDaily = profile?.max_daily_bookings || 3;

      // Fetch confirmed bookings for this user to check daily limit locally using Sofia timezone
      const { data: userBookings } = await supabase
        .from("bookings")
        .select("start_time")
        .eq("user_id", userId)
        .eq("status", "confirmed");

      const bookingsOnDay = (userBookings || []).filter((b) => {
        const d = new Date(b.start_time);
        const sofiaDateStr = d.toLocaleDateString("en-CA", { timeZone: "Europe/Sofia" });
        return sofiaDateStr === data.date;
      });

      if (bookingsOnDay.length >= maxDaily) {
        return {
          error: `Достигнахте лимита от ${maxDaily} резервации на ден.`,
        };
      }
    }
  }

  // Validate end time doesn't exceed closing hour (24:00)
  const [hours] = data.time.split(":").map(Number);
  if (hours + data.durationHours > 24) {
    return { error: "Резервацията надвишава работното време (до 24:00)." };
  }

  const [year, month, day] = data.date.split("-").map(Number);

  // Court IDs sorted by name (Корт A, Корт B) — needed to mirror the
  // client-side group-training court auto-assignment (GT takes Court A if
  // free at that time, otherwise Court B).
  const { data: courtRows, error: courtsErr } = await supabase
    .from("courts")
    .select("id, name")
    .order("name");
  if (courtsErr) {
    console.error("Court lookup error:", courtsErr);
    return { error: "Грешка при връзка с базата данни. Моля, опитайте отново." };
  }
  const sortedCourtIds = (courtRows || []).map((c) => c.id);

  // Calculate weeks to book
  const weeksToBook = data.isRecurring ? data.recurringWeeks || 4 : 1;
  const recurringGroupId = data.isRecurring ? uuidv4() : null;
  const bookings = [];
  let firstWeekPrice = 0;

  // Check availability for ALL dates in the series before creating anything
  for (let week = 0; week < weeksToBook; week++) {
    const currentWeekDate = new Date(year, month - 1, day);
    currentWeekDate.setDate(currentWeekDate.getDate() + week * 7);
    
    const yStr = currentWeekDate.getFullYear();
    const mStr = String(currentWeekDate.getMonth() + 1).padStart(2, "0");
    const dStr = String(currentWeekDate.getDate()).padStart(2, "0");
    const currentWeekDateStr = `${yStr}-${mStr}-${dStr}`;

    const startStr = `${String(hours).padStart(2, "0")}:00`;
    const endStr = `${String(hours + data.durationHours).padStart(2, "0")}:00`;
    
    const weekStartTimeISO = sofiaToUTC(currentWeekDateStr, startStr);
    const weekEndTimeISO = sofiaToUTC(currentWeekDateStr, endStr);

    const weekStartTime = new Date(weekStartTimeISO);
    const weekEndTime = new Date(weekEndTimeISO);

    // Check coach availability
    if (data.bookingType === "coaching_session" && data.coachId) {
      // 1. Check other conflicting bookings
      const { data: conflictingCoach, error: coachConflictErr } = await supabase
        .from("bookings")
        .select("id")
        .eq("coach_id", data.coachId)
        .eq("status", "confirmed")
        .lt("start_time", weekEndTimeISO)
        .gt("end_time", weekStartTimeISO);

      if (coachConflictErr) {
        console.error("Coach conflict check error:", coachConflictErr);
        return { error: "Грешка при проверка на наличността на треньора. Моля, опитайте отново." };
      }

      if (conflictingCoach && conflictingCoach.length > 0) {
        const formattedDate = weekStartTime.toLocaleDateString('bg-BG', { timeZone: 'Europe/Sofia' });
        return { error: `Треньорът е вече зает на ${formattedDate}. Моля, изберете друг час за поредицата.` };
      }

      // 2. Check coach unavailability blocks (Bug #2)
      const { data: unavailableCoach, error: unavailErr } = await supabase
        .from("coach_unavailability")
        .select("id")
        .eq("coach_id", data.coachId)
        .lt("start_time", weekEndTimeISO)
        .gt("end_time", weekStartTimeISO);

      if (unavailErr) {
        console.error("Coach unavailability check error:", unavailErr);
        return { error: "Грешка при проверка на наличността на треньора. Моля, опитайте отново." };
      }

      if (unavailableCoach && unavailableCoach.length > 0) {
        const formattedDate = weekStartTime.toLocaleDateString('bg-BG', { timeZone: 'Europe/Sofia' });
        return { error: `Треньорът не е на разположение на ${formattedDate} (маркиран почивен час).` };
      }
    }

    // Check court availability
    const { data: conflictingCourt, error: courtConflictErr } = await supabase
      .from("bookings")
      .select("id")
      .eq("court_id", data.courtId)
      .eq("status", "confirmed")
      .lt("start_time", weekEndTimeISO)
      .gt("end_time", weekStartTimeISO);

    if (courtConflictErr) {
      console.error("Court conflict check error:", courtConflictErr);
      return { error: "Грешка при проверка на заетостта на корта. Моля, опитайте отново." };
    }

    if (conflictingCourt && conflictingCourt.length > 0) {
      const formattedDate = weekStartTime.toLocaleDateString('bg-BG', { timeZone: 'Europe/Sofia' });
      return { error: `Кортът е вече зает на ${formattedDate}. Моля, изберете друг час за поредицата.` };
    }

    // Check group training conflicts. A group training occupies exactly one
    // court: Court A if it is free during the training window, otherwise
    // Court B (same auto-assignment as the client-side calendar).
    const { data: activeGTs, error: gtErr } = await supabase
      .from("group_trainings")
      .select("*")
      .eq("date", currentWeekDateStr)
      .eq("is_active", true)
      .order("start_time");

    if (gtErr) {
      console.error("Group training check error:", gtErr);
      return { error: "Грешка при проверка на груповите тренировки. Моля, опитайте отново." };
    }

    if (activeGTs && activeGTs.length > 0 && sortedCourtIds.length > 0) {
      const assignedGtCourts = new Set<string>();
      for (const gt of activeGTs) {
        const gtStartH = parseInt(gt.start_time.split(":")[0], 10);
        const gtEndH = parseInt(gt.end_time.split(":")[0], 10);
        const gtStartISO = sofiaToUTC(currentWeekDateStr, `${String(gtStartH).padStart(2, "0")}:00`);
        const gtEndISO = sofiaToUTC(currentWeekDateStr, `${String(gtEndH).padStart(2, "0")}:00`);

        // Which courts are occupied by regular bookings during the GT window?
        const { data: gtWindowBookings, error: gtWinErr } = await supabase
          .from("bookings")
          .select("court_id")
          .eq("status", "confirmed")
          .lt("start_time", gtEndISO)
          .gt("end_time", gtStartISO);

        if (gtWinErr) {
          console.error("Group training window check error:", gtWinErr);
          return { error: "Грешка при проверка на заетостта на кортовете. Моля, опитайте отново." };
        }

        const busyCourtIds = new Set((gtWindowBookings || []).map((b) => b.court_id));
        const gtCourt =
          sortedCourtIds.find((id) => !busyCourtIds.has(id) && !assignedGtCourts.has(id)) ??
          sortedCourtIds[sortedCourtIds.length - 1];
        assignedGtCourts.add(gtCourt);

        const overlapsRequestedSlot = hours < gtEndH && hours + data.durationHours > gtStartH;
        if (overlapsRequestedSlot && gtCourt === data.courtId) {
          const formattedDate = weekStartTime.toLocaleDateString('bg-BG', { timeZone: 'Europe/Sofia' });
          return { error: `Кортът е зает от групова тренировка на ${formattedDate}. Моля, изберете друг корт или час.` };
        }
      }
    }

    // Calculate price for this specific date (handles weekends/peaks properly)
    let price = await calculatePrice(
      data.courtId,
      data.bookingType,
      weekStartTime,
      data.durationHours,
      data.coachingTypeSelected || null
    );

    // Add add-on prices
    if (formData.wantsBasket) {
      const { BASKET_RENTAL_PRICE } = await import("@/lib/booking-utils");
      price += BASKET_RENTAL_PRICE;
    }
    if (formData.wantsRacket) {
      const { RACKET_RENTAL_PRICE } = await import("@/lib/booking-utils");
      price += RACKET_RENTAL_PRICE;
    }

    let finalNotes = data.notes || null;
    if (data.bookingType === "coaching_session" && data.coachingTypeSelected) {
      const { COACHING_LABELS } = await import("@/lib/booking-utils");
      const label = COACHING_LABELS[data.coachingTypeSelected as keyof typeof COACHING_LABELS];
      finalNotes = finalNotes ? `${label}\n---\n${finalNotes}` : label;
    }

    if (week === 0) firstWeekPrice = price;

    bookings.push({
      user_id: userId,
      court_id: data.courtId,
      coach_id: data.coachId || null,
      start_time: weekStartTime.toISOString(),
      end_time: weekEndTime.toISOString(),
      duration_hours: data.durationHours,
      booking_type: data.bookingType,
      status: "confirmed" as const,
      total_price: price,
      notes: finalNotes || null,
      customer_name: data.customerName,
      customer_email: data.customerEmail || "",
      customer_phone: data.customerPhone,
      is_recurring: data.isRecurring || false,
      recurring_group_id: recurringGroupId,
    });
  }

  // RETURNING only anon-readable columns (guests lack SELECT on personal
  // columns); the customer fields are merged back below from the input.
  const { data: created, error } = await supabase
    .from("bookings")
    .insert(bookings)
    .select(PUBLIC_BOOKING_COLUMNS);

  if (error) {
    console.error("Booking creation error:", error);
    if (error.code === "23P01") {
      return { error: "Кортът вече е зает в избраното време." };
    }
    return { error: "Грешка при създаване на резервацията." };
  }

  const createdWithCustomer = (created || []).map((b) => ({
    ...b,
    customer_name: data.customerName,
    customer_phone: data.customerPhone,
    customer_email: data.customerEmail || "",
  }));

  // Send confirmation email
  if (data.customerEmail) {
    try {
      await sendBookingConfirmation({
        email: data.customerEmail,
        name: data.customerName,
        date: data.date,
        time: data.time,
        durationHours: data.durationHours,
        courtId: data.courtId,
        totalPrice: firstWeekPrice,
        bookingType: data.bookingType,
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);
      // Don't fail the booking if email fails
    }
  }

  revalidatePath("/booking");
  revalidatePath("/admin");


  return {
    success: true,
    booking: createdWithCustomer[0],
    // All rows created in this call (recurring bookings create one per week);
    // clients should use these instead of fabricating local copies.
    bookings: createdWithCustomer,
    totalBookings: bookings.length,
  };
}

export async function cancelBooking(bookingId: string) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Cancellation requires an authenticated user (admin or booking owner).
  // Checked BEFORE any reads — guests also lack SELECT on personal columns.
  if (!user) {
    return { error: "Трябва да сте влезли в акаунта си, за да отмените резервация." };
  }

  // Get the booking first
  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return { error: "Резервацията не е намерена." };
  }

  // Check permission (user can cancel own, admin can cancel any)
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && booking.user_id !== user.id) {
    return { error: "Нямате право да отмените тази резервация." };
  }

  // Check if booking is in the past
  if (new Date(booking.start_time) < new Date()) {
    return { error: "Не можете да отмените минала резервация." };
  }

  const { data: updatedRows, error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .select("id");

  if (error) {
    return { error: "Грешка при отмяна на резервацията." };
  }

  // RLS can silently block the update (0 rows affected) — treat as failure,
  // otherwise the UI shows "cancelled" while the DB still says "confirmed".
  if (!updatedRows || updatedRows.length === 0) {
    return { error: "Резервацията не беше отменена — нямате права за тази операция." };
  }

  revalidatePath("/booking");
  revalidatePath("/admin");


  return { success: true };
}

export async function cancelRecurringBookings(recurringGroupId: string) {
  const supabase = await createServerSupabaseClient();

  // Check authentication and authorization
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    isAdmin = profile?.role === "admin";
  }

  // Verify ownership: if not admin, ensure the user owns the booking or it is an anonymous booking (when guest)
  if (!isAdmin) {
    const { data: groupBookings } = await supabase
      .from("bookings")
      .select("user_id")
      .eq("recurring_group_id", recurringGroupId)
      .limit(1);

    if (!groupBookings || groupBookings.length === 0) {
      return { error: "Повтарящата се резервация не е намерена." };
    }

    if (!user) {
      // Cancellation requires an authenticated user (admin or booking owner)
      return { error: "Трябва да сте влезли в акаунта си, за да отмените тази поредица." };
    }
    if (groupBookings[0].user_id !== user.id) {
      return { error: "Нямате право да отмените тази поредица резервации." };
    }
  }

  const { data: updatedRows, error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("recurring_group_id", recurringGroupId)
    .eq("status", "confirmed")
    .gt("start_time", new Date().toISOString())
    .select("id");

  if (error) {
    return { error: "Грешка при отмяна на повтарящите се резервации." };
  }

  if (!updatedRows || updatedRows.length === 0) {
    return { error: "Няма отменени резервации — или нямате права, или всички часове от поредицата са минали." };
  }

  revalidatePath("/booking");
  revalidatePath("/admin");

  return { success: true };
}

/**
 * Convert an inclusive Sofia-local date range into UTC ISO bounds.
 */
function rangeToUTC(startDate: string, endDate: string): { startUTC: string; endUTC: string } {
  const [ey, em, ed] = endDate.split("-").map(Number);
  const endLocal = new Date(ey, em - 1, ed);
  endLocal.setDate(endLocal.getDate() + 1);
  const nextDayStr = `${endLocal.getFullYear()}-${String(endLocal.getMonth() + 1).padStart(2, "0")}-${String(endLocal.getDate()).padStart(2, "0")}`;
  return {
    startUTC: sofiaToUTC(startDate, "00:00"),
    endUTC: sofiaToUTC(nextDayStr, "00:00"),
  };
}

/**
 * PUBLIC availability data for a date range (inclusive) — only the columns
 * needed to show free/busy slots, no customer personal data. This is what
 * the public booking page uses.
 */
export async function getPublicBookingsForDateRange(startDate: string, endDate: string) {
  if (!isSupabaseConfigured()) {
    // Supabase not configured — return empty to let caller use mock data
    return [];
  }

  const supabase = await createServerSupabaseClient();
  const { startUTC, endUTC } = rangeToUTC(startDate, endDate);

  const { data, error } = await supabase
    .from("bookings")
    .select(PUBLIC_BOOKING_COLUMNS)
    .gte("start_time", startUTC)
    .lt("start_time", endUTC)
    .neq("status", "cancelled");

  if (error) {
    console.error("Error fetching public bookings for range:", error);
    return [];
  }

  // Rows lack the personal columns (notes/customer_*) by design; consumers
  // only use them for availability and guard those fields.
  return (data as unknown as Booking[]) || [];
}

/**
 * Fetch all non-cancelled bookings for a date range (inclusive).
 * Full rows (incl. customer data) only for a logged-in admin; anyone else
 * gets the public columns. Coaches use getCoachBookingsForRange instead.
 */
export async function getBookingsForDateRange(startDate: string, endDate: string) {
  if (!isSupabaseConfigured()) {
    // Supabase not configured — return empty to let caller use mock data
    return [];
  }

  const admin = await requireAdmin();
  if (!admin.ok) {
    return getPublicBookingsForDateRange(startDate, endDate);
  }

  const supabase = await createServerSupabaseClient();
  const { startUTC, endUTC } = rangeToUTC(startDate, endDate);

  const { data, error } = await supabase
    .from("bookings")
    .select("*, court:courts(*), coach:coaches(*)")
    .gte("start_time", startUTC)
    .lt("start_time", endUTC)
    .neq("status", "cancelled");

  if (error) {
    console.error("Error fetching bookings for range:", error);
    return [];
  }

  return data || [];
}

/**
 * Full rows for the bookings of ONE coach, authenticated by PIN. Runs through
 * a SECURITY DEFINER RPC because the anon role can't read personal columns.
 */
export async function getCoachBookingsForRange(
  startDate: string,
  endDate: string,
  coachAuth: { coachId: string; pin: string }
) {
  if (!isSupabaseConfigured() || !coachAuth?.coachId || !coachAuth?.pin) {
    return [];
  }

  const supabase = await createServerSupabaseClient();
  const { startUTC, endUTC } = rangeToUTC(startDate, endDate);

  const { data, error } = await supabase.rpc("get_coach_bookings", {
    coach_id_input: coachAuth.coachId,
    pin_input: coachAuth.pin,
    start_ts: startUTC,
    end_ts: endUTC,
  });

  if (error) {
    // Function not deployed yet or invalid PIN — calendar still works from
    // the public data, only client names are missing.
    console.error("get_coach_bookings RPC error:", error);
    return [];
  }

  return data || [];
}

/**
 * Cancel a booking from the coach portal (PIN-authenticated). Uses a
 * SECURITY DEFINER RPC: the anon role has no UPDATE permission on bookings.
 */
export async function cancelBookingAsCoach(
  bookingId: string,
  coachAuth: { coachId: string; pin: string }
) {
  if (!coachAuth?.coachId || !coachAuth?.pin) {
    return { error: "Липсва треньорска сесия. Излезте и влезте отново с вашия PIN." };
  }
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  const supabase = await createServerSupabaseClient();
  const { data: cancelled, error } = await supabase.rpc("cancel_coach_booking", {
    booking_id_input: bookingId,
    coach_id_input: coachAuth.coachId,
    pin_input: coachAuth.pin,
  });

  if (error) {
    console.error("cancel_coach_booking RPC error:", error);
    return { error: "Грешка при отмяна на резервацията." };
  }

  if (!cancelled) {
    return { error: "Резервацията не беше отменена — тя не е ваша, вече е минала или е отменена." };
  }

  revalidatePath("/coach");
  revalidatePath("/admin");
  revalidatePath("/booking");
  return { success: true };
}

export async function getUserBookings() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Не сте влезли в акаунта си.", bookings: [] };
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("*, court:courts(*), coach:coaches(*)")
    .eq("user_id", user.id)
    .order("start_time", { ascending: false });

  if (error) {
    return { error: "Грешка при зареждане на резервациите.", bookings: [] };
  }

  return { bookings: data || [] };
}

export async function getUserCoachInfo() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не сте влезли в акаунта си." };

  const { data: profile } = await supabase
    .from("users")
    .select("role, coach_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "coach" || !profile.coach_id) {
    return { error: "Нямате достъп до треньорския портал." };
  }

  const { data: coach } = await supabase
    .from("coaches")
    .select("*")
    .eq("id", profile.coach_id)
    .single();

  return { coach };
}

export async function loginCoachByPin(pin: string) {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase не е конфигуриран." };
  }

  const supabase = await createServerSupabaseClient();
  const { data: coach, error } = await supabase
    .from("coaches")
    .select("id, name, specialization, hourly_rate")
    .eq("pin", pin)
    .single();

  if (error || !coach) {
    return { error: "Невалиден PIN код." };
  }

  return { coach };
}

export async function createCoach(formData: {
  name: string;
  specialization?: string;
  hourlyRate?: number;
  pin: string;
}) {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase не е конфигуриран." };
  }

  const admin = await requireAdmin();
  if (!admin.ok) {
    return { error: admin.error };
  }

  const supabase = await createServerSupabaseClient();

  // Check if PIN already exists
  const { data: existing } = await supabase
    .from("coaches")
    .select("id")
    .eq("pin", formData.pin)
    .single();

  if (existing) {
    return { error: "Този PIN код вече е зает. Изберете друг." };
  }

  const { data, error } = await supabase
    .from("coaches")
    .insert({
      name: formData.name,
      specialization: formData.specialization || null,
      hourly_rate: formData.hourlyRate || 80,
      pin: formData.pin,
    })
    .select()
    .single();

  if (error) {
    return { error: "Грешка при създаване на треньор." };
  }

  revalidatePath("/admin");
  return { success: true, coach: data };
}

export type CoachSummary = {
  id: string;
  name: string;
  specialization: string | null;
  hourly_rate: number;
  // Present only when the caller is a logged-in admin
  pin?: string | null;
  created_at: string;
};

export async function getCoaches(): Promise<CoachSummary[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }
  const supabase = await createServerSupabaseClient();

  // PIN codes are sensitive — return them only to a logged-in admin.
  // (The coach portal only needs id/name for its booking form.)
  const admin = await requireAdmin();
  const columns = admin.ok
    ? "id, name, specialization, hourly_rate, pin, created_at"
    : "id, name, specialization, hourly_rate, created_at";

  const { data } = await supabase
    .from("coaches")
    .select(columns)
    .order("created_at", { ascending: false });
  return (data as unknown as CoachSummary[]) || [];
}

export async function deleteCoach(coachId: string) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return { error: admin.error };
  }
  const supabase = await createServerSupabaseClient();
  const { data: deleted, error } = await supabase
    .from("coaches")
    .delete()
    .eq("id", coachId)
    .select("id");
  if (error) return { error: "Грешка при изтриване." };
  if (!deleted || deleted.length === 0) {
    return { error: "Треньорът не беше изтрит — нямате права за тази операция." };
  }
  revalidatePath("/admin");
  return { success: true };
}

export async function getCourts() {
  if (!isSupabaseConfigured()) {
    // Supabase not configured — return empty to let caller use mock data
    return [];
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .order("name");

  if (error) {
    return [];
  }

  return data || [];
}

// ============================================
// Pricing Helpers
// ============================================

async function calculatePrice(
  courtId: string,
  bookingType: string,
  startTime: Date,
  durationHours: number,
  coachingTypeSelected: string | null
): Promise<number> {
  const { calculateLocalPrice } = await import("@/lib/booking-utils");
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Sofia',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const time = formatter.format(startTime);

  return calculateLocalPrice(
    time,
    durationHours,
    startTime,
    bookingType as any,
    coachingTypeSelected as any
  );
}

// ============================================
// Email Confirmation
// ============================================

async function sendBookingConfirmation(data: {
  email: string;
  name: string;
  date: string;
  time: string;
  durationHours: number;
  courtId: string;
  totalPrice: number;
  bookingType: string;
}) {
  // Only send if Resend API key is configured
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.log("RESEND_API_KEY not configured, skipping email");
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(resendApiKey);

  const typeLabel =
    data.bookingType === "court_rental" ? "Наем на корт" : "Урок с треньор";

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Tennis Club Oasis <noreply@tenniscluboasis.bg>",
    to: data.email,
    subject: "Потвърждение на резервация - Tennis Club Oasis",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #ea580c, #f97316); border-radius: 12px; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">TOP<span style="color: #fbbf24;">S</span>PIN</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0;">Tennis Club</p>
        </div>
        
        <h2 style="color: #1a1a1a; margin-bottom: 16px;">Резервацията е потвърдена!</h2>
        <p style="color: #666;">Здравейте, ${data.name}! Вашата резервация беше успешно създадена.</p>
        
        <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #888; width: 120px;">Тип:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #1a1a1a;">${typeLabel}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888;">Дата:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #1a1a1a;">${data.date}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888;">Час:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #1a1a1a;">${data.time} (${data.durationHours} ч.)</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888;">Цена:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #ea580c; font-size: 18px;">${data.totalPrice} €</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #888; font-size: 12px; text-align: center; margin-top: 24px;">
          Tennis Club Oasis | Всички права запазени
        </p>
      </div>
    `,
  });
}

// ============================================
// Coach Unavailability
// ============================================

/**
 * Coaches log in with a PIN (no Supabase auth session), so the PIN is
 * re-verified here before writing. The old Supabase-auth path is kept as a
 * fallback for users with role "coach".
 */
export async function createCoachBlock(
  startTime: string,
  endTime: string,
  reason?: string,
  coachAuth?: { coachId: string; pin: string }
) {
  const supabase = await createServerSupabaseClient();

  let coachId: string | null = null;

  if (coachAuth?.coachId && coachAuth?.pin) {
    const { data: coach } = await supabase
      .from("coaches")
      .select("id")
      .eq("id", coachAuth.coachId)
      .eq("pin", coachAuth.pin)
      .single();
    if (coach) coachId = coach.id;
  }

  if (!coachId) {
    const info = await getUserCoachInfo();
    if (info.error || !info.coach) {
      return { error: "Нямате права да блокирате време. Излезте и влезте отново с вашия PIN." };
    }
    coachId = info.coach.id;
  }

  const { data, error } = await supabase
    .from("coach_unavailability")
    .insert({
      coach_id: coachId,
      start_time: startTime,
      end_time: endTime,
      reason: reason || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Coach block insert error:", error);
    return { error: "Грешка при блокиране на времето." };
  }

  revalidatePath("/coach");
  return { success: true, block: data };
}

export async function deleteCoachBlock(
  blockId: string,
  coachAuth?: { coachId: string; pin: string }
) {
  const supabase = await createServerSupabaseClient();

  let query = supabase.from("coach_unavailability").delete().eq("id", blockId);

  if (coachAuth?.coachId && coachAuth?.pin) {
    const { data: coach } = await supabase
      .from("coaches")
      .select("id")
      .eq("id", coachAuth.coachId)
      .eq("pin", coachAuth.pin)
      .single();
    if (!coach) {
      return { error: "Невалидна треньорска сесия. Излезте и влезте отново с вашия PIN." };
    }
    query = query.eq("coach_id", coach.id);
  }

  const { data: deleted, error } = await query.select("id");

  if (error) {
    return { error: "Грешка при изтриване на блокираното време." };
  }

  if (!deleted || deleted.length === 0) {
    return { error: "Блокираното време не беше изтрито — нямате права за тази операция." };
  }

  revalidatePath("/coach");
  return { success: true };
}

export async function getCoachBlocks(startDate: string, endDate: string, coachId?: string) {
  if (!isSupabaseConfigured()) {
    return [];
  }
  const supabase = await createServerSupabaseClient();
  
  let query = supabase
    .from("coach_unavailability")
    .select("*")
    .gte("start_time", `${startDate}T00:00:00+00:00`)
    .lte("start_time", `${endDate}T23:59:59+00:00`);
    
  if (coachId) {
    query = query.eq("coach_id", coachId);
  }

  const { data, error } = await query;
  if (error) return [];
  return data;
}

// ============================================
// Group Training Actions (Bug #5)
// ============================================

export async function getGroupTrainings() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("group_trainings")
    .select("*")
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });
  if (error) {
    console.error("Error fetching group trainings:", error);
    return [];
  }
  return data || [];
}

/**
 * Full registrations (incl. parent names and phones) — admin only.
 */
export async function getGroupRegistrations() {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return [];
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("group_training_registrations")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching group registrations:", error);
    return [];
  }
  return data || [];
}

/**
 * Slimmed-down registrations for the PUBLIC group-training calendar: only
 * what is needed to count free spots, no personal data.
 */
export async function getGroupRegistrationCounts() {
  if (!isSupabaseConfigured()) {
    return [];
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("group_training_registrations")
    .select("id, group_training_id, date, status");
  if (error) {
    console.error("Error fetching group registration counts:", error);
    return [];
  }
  return data || [];
}

export async function createGroupTrainingAction(formData: {
  ageGroup: "kids_5_8" | "kids_8_11";
  date: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
}) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return { error: admin.error };
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("group_trainings")
    .insert({
      age_group: formData.ageGroup,
      date: formData.date,
      start_time: formData.startTime,
      end_time: formData.endTime,
      max_participants: formData.maxParticipants,
    })
    .select()
    .single();
  if (error) {
    console.error("Error creating group training:", error);
    return { error: "Грешка при създаване на групова тренировка." };
  }
  revalidatePath("/booking");
  revalidatePath("/admin");
  return { success: true, training: data };
}

export async function deleteGroupTrainingAction(id: string) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return { error: admin.error };
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("group_trainings")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("Error deleting group training:", error);
    return { error: "Грешка при изтриване на групова тренировка." };
  }
  revalidatePath("/booking");
  revalidatePath("/admin");
  return { success: true };
}

export async function toggleGroupTrainingAction(id: string, isActive?: boolean) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return { error: admin.error };
  }
  const supabase = await createServerSupabaseClient();
  let targetActive = isActive;
  if (targetActive === undefined) {
    const { data, error: fetchErr } = await supabase
      .from("group_trainings")
      .select("is_active")
      .eq("id", id)
      .single();
    if (fetchErr || !data) {
      console.error("Error fetching group training to toggle:", fetchErr);
      return { error: "Неуспешно намиране на тренировката." };
    }
    targetActive = !data.is_active;
  }

  const { error } = await supabase
    .from("group_trainings")
    .update({ is_active: targetActive })
    .eq("id", id);
  if (error) {
    console.error("Error toggling group training:", error);
    return { error: "Грешка при промяна на статуса." };
  }
  revalidatePath("/booking");
  revalidatePath("/admin");
  return { success: true };
}

export async function registerForGroupTrainingAction(formData: {
  groupTrainingId: string;
  parentName: string;
  childName: string;
  childAge: number;
  phone: string;
  date: string;
}) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("group_training_registrations")
    .insert({
      group_training_id: formData.groupTrainingId,
      parent_name: formData.parentName,
      child_name: formData.childName,
      child_age: formData.childAge,
      phone: formData.phone,
      date: formData.date,
      status: "confirmed",
    })
    .select()
    .single();
  if (error) {
    console.error("Error creating group training registration:", error);
    return { error: error.message || "Грешка при записване за тренировка." };
  }
  revalidatePath("/booking");
  revalidatePath("/admin");
  return { success: true, registration: data };
}

export async function cancelGroupRegistrationAction(id: string) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return { error: admin.error };
  }
  const supabase = await createServerSupabaseClient();
  const { data: updated, error } = await supabase
    .from("group_training_registrations")
    .update({ status: "cancelled" })
    .eq("id", id)
    .select("id");
  if (error) {
    console.error("Error cancelling registration:", error);
    return { error: "Грешка при отмяна на регистрацията." };
  }
  if (!updated || updated.length === 0) {
    return { error: "Регистрацията не беше отменена — нямате права за тази операция." };
  }
  revalidatePath("/booking");
  revalidatePath("/admin");
  return { success: true };
}
