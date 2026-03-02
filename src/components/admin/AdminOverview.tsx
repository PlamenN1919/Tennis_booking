"use client";

import { useMemo } from "react";
import { format, isToday, isTomorrow, startOfDay } from "date-fns";
import { bg } from "date-fns/locale";
import {
  Calendar,
  TrendingUp,
  MapPin,
  Users,
  Clock,
  ArrowRight,
  DollarSign,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockCourts, mockCoaches } from "@/lib/mock-data";
import type { Booking } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { OPENING_HOUR, CLOSING_HOUR, COURT_A_ID, COURT_B_ID } from "@/lib/booking-utils";

interface AdminOverviewProps {
  bookings: Booking[];
  onNavigate: (view: "calendar" | "bookings" | "create") => void;
}

export default function AdminOverview({ bookings, onNavigate }: AdminOverviewProps) {
  const confirmed = useMemo(() => bookings.filter((b) => b.status === "confirmed"), [bookings]);

  const stats = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);

    const todayBookings = confirmed.filter((b) => {
      const d = new Date(b.start_time);
      return isToday(d);
    });

    const tomorrowBookings = confirmed.filter((b) => {
      const d = new Date(b.start_time);
      return isTomorrow(d);
    });

    const thisMonth = confirmed.filter((b) => {
      const d = new Date(b.start_time);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const lastMonth = confirmed.filter((b) => {
      const d = new Date(b.start_time);
      const lm = new Date(now);
      lm.setMonth(lm.getMonth() - 1);
      return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
    });

    const thisMonthRevenue = thisMonth.reduce((s, b) => s + b.total_price, 0);
    const lastMonthRevenue = lastMonth.reduce((s, b) => s + b.total_price, 0);
    const revenueGrowth =
      lastMonthRevenue > 0
        ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : 0;

    const todayRevenue = todayBookings.reduce((s, b) => s + b.total_price, 0);
    const totalSlots = (CLOSING_HOUR - OPENING_HOUR) * 2; // 2 courts × hours
    // Count occupied slot-hours (a 2h booking occupies 2 slots, not 1)
    const occupiedSlotHours = todayBookings.reduce((sum, b) => {
      const bStart = new Date(b.start_time).getHours();
      const bEnd = new Date(b.end_time).getHours();
      return sum + (bEnd - bStart);
    }, 0);
    const todayUtilization = totalSlots > 0 ? Math.round((occupiedSlotHours / totalSlots) * 100) : 0;

    // Hourly distribution for today
    const hourlyToday: Record<number, { courtA: boolean; courtB: boolean }> = {};
    for (let h = OPENING_HOUR; h < CLOSING_HOUR; h++) {
      hourlyToday[h] = { courtA: false, courtB: false };
    }
    todayBookings.forEach((b) => {
      const bStartHour = new Date(b.start_time).getHours();
      const bEndHour = new Date(b.end_time).getHours();
      // Mark ALL hours the booking spans, not just the start hour
      for (let h = bStartHour; h < bEndHour && h < CLOSING_HOUR; h++) {
        if (hourlyToday[h]) {
          if (b.court_id === COURT_A_ID) hourlyToday[h].courtA = true;
          else if (b.court_id === COURT_B_ID) hourlyToday[h].courtB = true;
        }
      }
    });

    // Peak hour — count all occupied slot-hours, not just start hours
    const hourCounts: Record<number, number> = {};
    confirmed.forEach((b) => {
      const bStartHour = new Date(b.start_time).getHours();
      const bEndHour = new Date(b.end_time).getHours();
      for (let h = bStartHour; h < bEndHour; h++) {
        hourCounts[h] = (hourCounts[h] || 0) + 1;
      }
    });
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      totalBookings: confirmed.length,
      todayBookings,
      tomorrowBookings,
      thisMonthBookings: thisMonth.length,
      thisMonthRevenue,
      lastMonthRevenue,
      revenueGrowth,
      todayRevenue,
      todayUtilization,
      hourlyToday,
      peakHour: peakHour ? `${peakHour[0]}:00` : "N/A",
      courtRentals: confirmed.filter((b) => b.booking_type === "court_rental").length,
      coachingSessions: confirmed.filter((b) => b.booking_type === "coaching_session").length,
    };
  }, [confirmed]);

  // Upcoming bookings (next 5)
  const upcoming = useMemo(() => {
    const now = new Date();
    return confirmed
      .filter((b) => new Date(b.start_time) >= now)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 6);
  }, [confirmed]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <h1 className="text-2xl font-bold mb-1">Добре дошли в панела 👋</h1>
          <p className="text-gray-400 text-sm">
            {format(new Date(), "EEEE, d MMMM yyyy", { locale: bg })} •{" "}
            {stats.todayBookings.length} резервации днес
          </p>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={() => onNavigate("create")}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-full gap-2 text-sm"
            >
              <Calendar className="w-4 h-4" />
              Нова резервация
            </Button>
            <Button
              onClick={() => onNavigate("calendar")}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 rounded-full gap-2 text-sm"
            >
              Виж календара
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-600 border-0 font-semibold">
                Днес
              </Badge>
            </div>
            <p className="text-3xl font-black text-gray-900">{stats.todayBookings.length}</p>
            <p className="text-xs text-gray-500 mt-1">
              резервации • {stats.tomorrowBookings.length} утре
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              {stats.revenueGrowth !== 0 && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] border-0 font-semibold",
                    stats.revenueGrowth > 0
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-600"
                  )}
                >
                  {stats.revenueGrowth > 0 ? "+" : ""}
                  {stats.revenueGrowth}%
                </Badge>
              )}
            </div>
            <p className="text-3xl font-black text-gray-900">
              {stats.thisMonthRevenue}
              <span className="text-sm font-bold text-gray-400 ml-1">€</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">приход този месец</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900">
              {stats.todayUtilization}
              <span className="text-sm font-bold text-gray-400 ml-1">%</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">заетост днес</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900">{stats.totalBookings}</p>
            <p className="text-xs text-gray-500 mt-1">
              общо ({stats.courtRentals} наема, {stats.coachingSessions} урока)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Timeline + Upcoming */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Today's Court Timeline */}
        <Card className="border-0 shadow-sm rounded-2xl lg:col-span-3">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Днешен график</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-full text-xs gap-1"
                onClick={() => onNavigate("calendar")}
              >
                Пълен календар
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>

            {/* Mini Timeline */}
            <div className="space-y-1">
              <div className="grid grid-cols-[50px_1fr_1fr] gap-2 mb-2">
                <div />
                <div className="text-center">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    Корт A
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    Корт B
                  </span>
                </div>
              </div>

              {Object.entries(stats.hourlyToday).map(([hour, courts]) => {
                const h = parseInt(hour);
                const now = new Date();
                const isCurrentHour = isToday(now) && now.getHours() === h;

                // Find booking details — use overlap detection for multi-hour bookings
                const courtABooking = stats.todayBookings.find((b) => {
                  if (b.court_id !== COURT_A_ID) return false;
                  const bStart = new Date(b.start_time).getHours();
                  const bEnd = new Date(b.end_time).getHours();
                  return bStart <= h && bEnd > h;
                });
                const courtBBooking = stats.todayBookings.find((b) => {
                  if (b.court_id !== COURT_B_ID) return false;
                  const bStart = new Date(b.start_time).getHours();
                  const bEnd = new Date(b.end_time).getHours();
                  return bStart <= h && bEnd > h;
                });

                return (
                  <div
                    key={hour}
                    className={cn(
                      "grid grid-cols-[50px_1fr_1fr] gap-2 items-center rounded-lg py-1 px-1",
                      isCurrentHour && "bg-orange-50 ring-1 ring-orange-200"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-mono text-center",
                      isCurrentHour ? "text-orange-600 font-bold" : "text-gray-400"
                    )}>
                      {String(h).padStart(2, "0")}:00
                    </span>
                    <div
                      className={cn(
                        "h-7 rounded-lg flex items-center justify-center text-[10px] font-medium transition-all",
                        courts.courtA
                          ? courtABooking?.booking_type === "coaching_session"
                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                          : "bg-gray-50 text-gray-300 border border-dashed border-gray-200"
                      )}
                    >
                      {courts.courtA
                        ? courtABooking?.booking_type === "coaching_session"
                          ? "🎾 Урок"
                          : "🏟️ Наем"
                        : "—"}
                    </div>
                    <div
                      className={cn(
                        "h-7 rounded-lg flex items-center justify-center text-[10px] font-medium transition-all",
                        courts.courtB
                          ? courtBBooking?.booking_type === "coaching_session"
                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                            : "bg-green-100 text-green-700 border border-green-200"
                          : "bg-gray-50 text-gray-300 border border-dashed border-gray-200"
                      )}
                    >
                      {courts.courtB
                        ? courtBBooking?.booking_type === "coaching_session"
                          ? "🎾 Урок"
                          : "🏟️ Наем"
                        : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Bookings */}
        <Card className="border-0 shadow-sm rounded-2xl lg:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Предстоящи</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-full text-xs gap-1"
                onClick={() => onNavigate("bookings")}
              >
                Всички
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>

            <div className="space-y-3">
              {upcoming.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Няма предстоящи резервации</p>
                </div>
              ) : (
                upcoming.map((booking) => {
                  const startTime = new Date(booking.start_time);
                  const courtName =
                    mockCourts.find((c) => c.id === booking.court_id)?.name || booking.court_id;
                  const isCoaching = booking.booking_type === "coaching_session";

                  return (
                    <div
                      key={booking.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div
                        className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                          isCoaching ? "bg-purple-100" : "bg-blue-100"
                        )}
                      >
                        {isCoaching ? (
                          <Users className="w-4 h-4 text-purple-600" />
                        ) : (
                          <MapPin className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {booking.notes?.split("\n")[0] ||
                            (isCoaching ? "Урок с треньор" : "Наем на корт")}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {isToday(startTime)
                            ? "Днес"
                            : isTomorrow(startTime)
                            ? "Утре"
                            : format(startTime, "d MMM", { locale: bg })}{" "}
                          • {format(startTime, "HH:mm")} • {courtName}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-gray-900 flex-shrink-0">
                        {booking.total_price}€
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Пиков час</p>
                <p className="text-lg font-bold text-gray-900">{stats.peakHour}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Приход днес</p>
                <p className="text-lg font-bold text-gray-900">{stats.todayRevenue}€</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Месечни резервации</p>
                <p className="text-lg font-bold text-gray-900">{stats.thisMonthBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
