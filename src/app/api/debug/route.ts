import { NextResponse } from "next/server";
import { getCourts, getBookingsForDateRange } from "@/lib/actions";

export async function GET() {
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
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || error,
    });
  }
}
