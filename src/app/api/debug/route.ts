import { NextResponse } from "next/server";
import { getCourts, getBookingsForDateRange } from "@/lib/actions";
import { isSupabaseConfigured, isServerUserAdmin } from "@/lib/supabase-server";

export async function GET() {
  // Debug data (incl. customer names/phones) is admin-only
  if (isSupabaseConfigured() && !(await isServerUserAdmin())) {
    return NextResponse.json(
      { success: false, error: "Admin login required" },
      { status: 403 }
    );
  }

  try {
    const courts = await getCourts();
    const bookings = await getBookingsForDateRange("2026-06-04", "2026-07-04");
    return NextResponse.json({
      success: true,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "not set",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "set" : "not set",
      },
      courts,
      bookingsCount: bookings.length,
      bookings,
    });
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
