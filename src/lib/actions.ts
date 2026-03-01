"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { bookingSubmitSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

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
}) {
  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl === "https://your-project.supabase.co") {
    throw new Error("Supabase not configured — using local mock");
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

  const userId = user?.id || null;

  // Check booking limits for authenticated users
  if (userId) {
    const { data: profile } = await supabase
      .from("users")
      .select("max_daily_bookings")
      .eq("id", userId)
      .single();

    const maxDaily = profile?.max_daily_bookings || 3;

    const { count } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "confirmed")
      .gte("start_time", `${data.date}T00:00:00`)
      .lte("start_time", `${data.date}T23:59:59`);

    if ((count || 0) >= maxDaily) {
      return {
        error: `Достигнахте лимита от ${maxDaily} резервации на ден.`,
      };
    }
  }

  // Build time values
  const [hours] = data.time.split(":").map(Number);
  const baseStartTime = new Date(data.date);
  baseStartTime.setHours(hours, 0, 0, 0);
  const baseEndTime = new Date(baseStartTime);
  baseEndTime.setHours(baseEndTime.getHours() + data.durationHours);

  // Calculate weeks to book
  const weeksToBook = data.isRecurring ? data.recurringWeeks || 4 : 1;
  const recurringGroupId = data.isRecurring ? uuidv4() : null;
  const bookings = [];
  let firstWeekPrice = 0;

  // Check availability for ALL dates in the series before creating anything
  for (let week = 0; week < weeksToBook; week++) {
    const weekStartTime = new Date(baseStartTime);
    weekStartTime.setDate(weekStartTime.getDate() + week * 7);
    const weekEndTime = new Date(baseEndTime);
    weekEndTime.setDate(weekEndTime.getDate() + week * 7);

    // Check coach availability
    if (data.bookingType === "coaching_session" && data.coachId) {
      const { data: conflictingCoach } = await supabase
        .from("bookings")
        .select("id")
        .eq("coach_id", data.coachId)
        .eq("status", "confirmed")
        .lt("start_time", weekEndTime.toISOString())
        .gt("end_time", weekStartTime.toISOString());

      if (conflictingCoach && conflictingCoach.length > 0) {
        const formattedDate = weekStartTime.toLocaleDateString('bg-BG');
        return { error: `Треньорът е вече зает на ${formattedDate}. Моля, изберете друг час за поредицата.` };
      }
    }

    // Check court availability
    const { data: conflictingCourt } = await supabase
      .from("bookings")
      .select("id")
      .eq("court_id", data.courtId)
      .eq("status", "confirmed")
      .lt("start_time", weekEndTime.toISOString())
      .gt("end_time", weekStartTime.toISOString());

    if (conflictingCourt && conflictingCourt.length > 0) {
      const formattedDate = weekStartTime.toLocaleDateString('bg-BG');
      return { error: `Кортът е вече зает на ${formattedDate}. Моля, изберете друг час за поредицата.` };
    }

    // Calculate price for this specific date (handles weekends/peaks properly)
    const price = await calculatePrice(
      data.courtId,
      data.bookingType,
      weekStartTime,
      data.durationHours,
      data.coachingTypeSelected || null
    );

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

  const { data: created, error } = await supabase
    .from("bookings")
    .insert(bookings)
    .select();

  if (error) {
    console.error("Booking creation error:", error);
    if (error.code === "23P01") {
      return { error: "Кортът вече е зает в избраното време." };
    }
    return { error: "Грешка при създаване на резервацията." };
  }

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
    booking: created?.[0],
    totalBookings: bookings.length,
  };
}

export async function cancelBooking(bookingId: string) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin" && booking.user_id !== user.id) {
      return { error: "Нямате право да отмените тази резервация." };
    }
  }

  // Check if booking is in the past
  if (new Date(booking.start_time) < new Date()) {
    return { error: "Не можете да отмените минала резервация." };
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId);

  if (error) {
    return { error: "Грешка при отмяна на резервацията." };
  }

  revalidatePath("/booking");
  revalidatePath("/admin");


  return { success: true };
}

export async function cancelRecurringBookings(recurringGroupId: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("recurring_group_id", recurringGroupId)
    .eq("status", "confirmed")
    .gt("start_time", new Date().toISOString());

  if (error) {
    return { error: "Грешка при отмяна на повтарящите се резервации." };
  }

  revalidatePath("/booking");
  revalidatePath("/admin");


  return { success: true };
}

export async function getBookingsForDate(date: string) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("bookings")
    .select("*, court:courts(*), coach:coaches(*)")
    .gte("start_time", `${date}T00:00:00`)
    .lte("start_time", `${date}T23:59:59`)
    .neq("status", "cancelled");

  if (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }

  return data || [];
}

export async function getBookingsForWeek(weekStart: string) {
  const supabase = await createServerSupabaseClient();

  const startDate = new Date(weekStart);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  const { data, error } = await supabase
    .from("bookings")
    .select("*, court:courts(*), coach:coaches(*)")
    .gte("start_time", startDate.toISOString())
    .lt("start_time", endDate.toISOString())
    .neq("status", "cancelled");

  if (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }

  return data || [];
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

export async function getCourts() {
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

export async function getCoaches() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("coaches")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    return [];
  }

  return data || [];
}

export async function getAdminStats() {
  const supabase = await createServerSupabaseClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("status", "confirmed");

  const allBookings = bookings || [];

  const now = new Date();
  const thisMonth = allBookings.filter((b) => {
    const d = new Date(b.start_time);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const lastMonth = allBookings.filter((b) => {
    const d = new Date(b.start_time);
    const lastMonthDate = new Date(now);
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    return (
      d.getMonth() === lastMonthDate.getMonth() &&
      d.getFullYear() === lastMonthDate.getFullYear()
    );
  });

  const thisMonthRevenue = thisMonth.reduce((s, b) => s + b.total_price, 0);
  const lastMonthRevenue = lastMonth.reduce((s, b) => s + b.total_price, 0);

  const revenueGrowth =
    lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

  // Hourly distribution
  const hourlyDistribution: Record<number, number> = {};
  for (let h = 7; h < 22; h++) hourlyDistribution[h] = 0;
  allBookings.forEach((b) => {
    const hour = new Date(b.start_time).getHours();
    if (hourlyDistribution[hour] !== undefined) {
      hourlyDistribution[hour]++;
    }
  });

  // Daily distribution (for this week)
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const dailyDistribution: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split("T")[0];
    dailyDistribution[key] = allBookings.filter((b) => {
      const bd = new Date(b.start_time).toISOString().split("T")[0];
      return bd === key;
    }).length;
  }

  return {
    totalBookings: allBookings.length,
    totalRevenue: allBookings.reduce((s, b) => s + b.total_price, 0),
    thisMonthBookings: thisMonth.length,
    thisMonthRevenue,
    lastMonthRevenue,
    revenueGrowth: Math.round(revenueGrowth),
    courtRentals: allBookings.filter((b) => b.booking_type === "court_rental").length,
    coachingSessions: allBookings.filter((b) => b.booking_type === "coaching_session").length,
    hourlyDistribution,
    dailyDistribution,
  };
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
  const time = `${String(startTime.getHours()).padStart(2, "0")}:${String(startTime.getMinutes()).padStart(2, "0")}`;

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
