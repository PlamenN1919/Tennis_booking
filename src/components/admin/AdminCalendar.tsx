"use client";

import { useState } from "react";
import { format, addDays, startOfWeek, addWeeks, subWeeks, isToday } from "date-fns";
import { bg } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  MapPin,
  X,
  StickyNote,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  OPENING_HOUR,
  CLOSING_HOUR,
  COURT_A_ID,
  COURT_B_ID,
  getCourtNameById,
} from "@/lib/booking-utils";
import { mockCoaches } from "@/lib/mock-data";
import type { Booking } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface AdminCalendarProps {
  bookings: Booking[];
  onCancelBooking: (id: string) => void;
  onCreateFromSlot: (date: string, time: string, court: string) => void;
}

export default function AdminCalendar({
  bookings,
  onCancelBooking,
  onCreateFromSlot,
}: AdminCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const hours = Array.from(
    { length: CLOSING_HOUR - OPENING_HOUR },
    (_, i) => OPENING_HOUR + i
  );

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");

  const getBookingForSlot = (day: Date, hour: number, courtId: string) => {
    const dayStr = format(day, "yyyy-MM-dd");
    // Build a 1-hour window for the slot
    const slotStart = new Date(day);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(day);
    slotEnd.setHours(hour + 1, 0, 0, 0);

    return confirmedBookings.find((b) => {
      if (b.court_id !== courtId) return false;
      const bDate = format(new Date(b.start_time), "yyyy-MM-dd");
      if (bDate !== dayStr) {
        // Also check for bookings that span midnight or started on a different date
        const bEnd = new Date(b.end_time);
        if (bEnd <= slotStart) return false;
        const bStart = new Date(b.start_time);
        if (bStart >= slotEnd) return false;
        return true;
      }
      // Overlap detection: (bookingStart < slotEnd) AND (bookingEnd > slotStart)
      const bookingStart = new Date(b.start_time);
      const bookingEnd = new Date(b.end_time);
      return bookingStart < slotEnd && bookingEnd > slotStart;
    });
  };

  const getBookingsCountForDay = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    return confirmedBookings.filter(
      (b) => format(new Date(b.start_time), "yyyy-MM-dd") === dayStr
    ).length;
  };

  const getCourtName = (id: string) => getCourtNameById(id);

  const getCoachName = (id: string | null) => {
    if (!id) return null;
    return mockCoaches.find((c) => c.id === id)?.name || null;
  };

  const goToToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
    setSelectedDay(new Date());
  };

  // On mobile a single day is always displayed (defaults to today)
  const mobileDay = selectedDay ?? new Date();

  const renderBookingCell = (booking: Booking | undefined, day: Date, hour: number, courtId: string) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const timeStr = `${String(hour).padStart(2, "0")}:00`;
    const isCourtA = courtId === COURT_A_ID;

    if (booking) {
      const isVirtualGT = booking.id.startsWith("virtual-gt-");
      return (
        <button
          onClick={() => !isVirtualGT && setSelectedBooking(booking)}
          className={cn(
            "w-full h-full min-h-[44px] rounded-lg p-1.5 text-left transition-all",
            isVirtualGT
              ? "bg-green-100 border border-green-200 text-green-800 cursor-default"
              : booking.booking_type === "coaching_session"
              ? "bg-blue-100 border border-blue-200 text-blue-800 hover:shadow-md hover:scale-[1.02] cursor-pointer"
              : "bg-orange-100 border border-orange-200 text-orange-800 hover:shadow-md hover:scale-[1.02] cursor-pointer"
          )}
        >
          <p className="text-[10px] font-bold truncate leading-tight">
            {isVirtualGT
              ? "Групова"
              : booking.customer_name
              || (booking.booking_type === "coaching_session" ? "Тренировка" : "Наем")}
          </p>
          {(booking.customer_name || booking.notes) && (
            <p className="text-[9px] opacity-70 truncate mt-0.5">
              {isVirtualGT
                ? (booking.notes || "").split("\n")[0].substring(0, 20)
                : booking.booking_type === "coaching_session" ? "Тренировка" : "Наем"}
            </p>
          )}
        </button>
      );
    }

    // Свободен слот — „+" е винаги видим (hover не съществува на телефон)
    return (
      <button
        onClick={() => onCreateFromSlot(dayStr, timeStr, courtId)}
        className={cn(
          "w-full h-full min-h-[44px] rounded-lg flex items-center justify-center transition-all border border-dashed border-gray-200 text-gray-300",
          isCourtA
            ? "hover:bg-orange-50 hover:border-orange-300 hover:text-orange-400 active:bg-orange-100"
            : "hover:bg-blue-50 hover:border-blue-300 hover:text-blue-400 active:bg-blue-100"
        )}
        aria-label={`Създай резервация ${timeStr}`}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    );
  };

  const renderTable = (days: Date[]) => {
    const isSingleDay = days.length === 1;
    const showNowIndicator = days.some((d) => isToday(d));

    return (
      <table
        className={cn(
          "w-full border-collapse",
          !isSingleDay && "min-w-[800px]"
        )}
      >
        <thead>
          <tr className="bg-gray-50">
            <th className="w-12 sm:w-16 p-2 text-xs font-semibold text-gray-400 text-center border-b border-r border-gray-100">
              Час
            </th>
            {days.map((day) => {
              const dayIsToday = isToday(day);
              return (
                <th
                  key={day.toISOString()}
                  colSpan={2}
                  className={cn(
                    "p-2 text-center border-b border-r border-gray-100 last:border-r-0",
                    dayIsToday && "bg-orange-50"
                  )}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
                      {isSingleDay
                        ? format(day, "EEEE, d MMMM", { locale: bg })
                        : format(day, "EEE", { locale: bg })}
                    </span>
                    {!isSingleDay && (
                      <span
                        className={cn(
                          "text-sm font-bold",
                          dayIsToday
                            ? "w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center"
                            : "text-gray-700"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                    )}
                    {/* Sub headers for courts */}
                    <div className="flex gap-0 w-full mt-1">
                      <span className={cn("flex-1 font-medium text-gray-400", isSingleDay ? "text-[11px] font-bold text-blue-500" : "text-[9px]")}>Корт A</span>
                      <span className={cn("flex-1 font-medium text-gray-400", isSingleDay ? "text-[11px] font-bold text-green-600" : "text-[9px]")}>Корт B</span>
                    </div>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {hours.map((hour) => {
            const currentHour = new Date().getHours();
            const isCurrentHour = showNowIndicator && hour === currentHour;
            return (
              <tr
                key={hour}
                className={cn(
                  "group transition-colors",
                  hour % 2 === 0 ? "bg-white" : "bg-gray-50/50",
                  isCurrentHour && "bg-orange-50/40"
                )}
              >
                <td className="p-1 sm:p-2 text-[11px] sm:text-xs font-mono text-gray-400 text-center border-r border-gray-100 relative">
                  {String(hour).padStart(2, "0")}:00
                  {isCurrentHour && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-500" />
                  )}
                </td>
                {days.map((day) => {
                  const courtABooking = getBookingForSlot(day, hour, COURT_A_ID);
                  const courtBBooking = getBookingForSlot(day, hour, COURT_B_ID);

                  return (
                    <td
                      key={day.toISOString()}
                      colSpan={2}
                      className="border-r border-gray-100 last:border-r-0 p-0"
                    >
                      <div className="flex">
                        {/* Court A Cell */}
                        <div className="flex-1 border-r border-gray-100/50 min-h-[48px] p-0.5">
                          {renderBookingCell(courtABooking, day, hour, COURT_A_ID)}
                        </div>
                        {/* Court B Cell */}
                        <div className="flex-1 min-h-[48px] p-0.5">
                          {renderBookingCell(courtBBooking, day, hour, COURT_B_ID)}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 items-center justify-center shadow-lg shadow-blue-500/20">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Седмичен календар</h2>
            <p className="text-sm text-gray-500">
              {format(currentWeekStart, "d MMM", { locale: bg })} —{" "}
              {format(addDays(currentWeekStart, 6), "d MMM yyyy", { locale: bg })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="rounded-full text-xs h-9 px-4"
          >
            Днес
          </Button>
          <div className="flex items-center bg-white border border-gray-200 rounded-full overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9"
              onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
              aria-label="Предишна седмица"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9"
              onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
              aria-label="Следваща седмица"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-orange-100 border border-orange-300" />
          <span>Наем на корт</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-100 border border-blue-300" />
          <span>Тренировка</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
          <span>Групова тренировка</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-50 border border-dashed border-gray-200" />
          <span>Свободно</span>
        </div>
      </div>

      {/* Day Selector — телефон: избор на ден от седмицата */}
      <div className="flex sm:hidden gap-1.5 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4">
        {weekDays.map((day) => {
          const dayIsToday = isToday(day);
          const isSelected =
            format(mobileDay, "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
          const count = getBookingsCountForDay(day);
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "flex flex-col items-center px-1 py-2 rounded-xl text-xs font-medium transition-all flex-1 min-w-[44px]",
                isSelected
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                  : dayIsToday
                    ? "bg-orange-50 text-orange-600 border border-orange-200"
                    : "bg-white text-gray-600 border border-gray-200 active:bg-gray-50"
              )}
            >
              <span className="text-[10px] uppercase">{format(day, "EEE", { locale: bg })}</span>
              <span className="text-sm font-bold">{format(day, "d")}</span>
              <span
                className={cn(
                  "mt-0.5 min-w-3.5 h-3.5 px-1 rounded-full text-[9px] font-bold flex items-center justify-center",
                  count === 0
                    ? "opacity-0"
                    : isSelected
                      ? "bg-white/25 text-white"
                      : "bg-orange-100 text-orange-600"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Calendar Grid */}
      <Card className="py-0 overflow-hidden border-gray-200 shadow-sm">
        <CardContent className="p-0">
          {/* Телефон: един ден, побира се на екрана без скрол */}
          <div className="sm:hidden">{renderTable([mobileDay])}</div>
          {/* Таблет/десктоп: цяла седмица */}
          <div className="hidden sm:block overflow-x-auto">{renderTable(weekDays)}</div>
        </CardContent>
      </Card>

      {/* Booking Detail Dialog */}
      <Dialog
        open={!!selectedBooking}
        onOpenChange={() => setSelectedBooking(null)}
      >
        <DialogContent className="max-w-md rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-orange-500" />
              Детайли за резервация
            </DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
                    Дата
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {format(new Date(selectedBooking.start_time), "d MMMM yyyy", { locale: bg })}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
                    Час
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {format(new Date(selectedBooking.start_time), "HH:mm")} –{" "}
                    {format(new Date(selectedBooking.end_time), "HH:mm")}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                      Корт
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {getCourtName(selectedBooking.court_id)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
                    Тип
                  </p>
                  <Badge
                    variant={
                      selectedBooking.booking_type === "coaching_session"
                        ? "default"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {selectedBooking.booking_type === "coaching_session"
                      ? "Тренировка"
                      : "Наем на корт"}
                  </Badge>
                </div>
              </div>

              {selectedBooking.coach_id && (
                <div className="flex items-center gap-2 bg-blue-50 rounded-xl p-3">
                  <Users className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-[11px] text-blue-400 uppercase tracking-wider font-semibold">
                      Треньор
                    </p>
                    <p className="text-sm font-semibold text-blue-900">
                      {getCoachName(selectedBooking.coach_id)}
                    </p>
                  </div>
                </div>
              )}

              {selectedBooking.notes && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <StickyNote className="w-3 h-3 text-gray-400" />
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                      Бележки
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <p className="text-xs text-gray-400">Цена</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedBooking.total_price} €
                  </p>
                </div>
                {selectedBooking.status === "confirmed" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-xl gap-2 h-10"
                    onClick={() => {
                      onCancelBooking(selectedBooking.id);
                      setSelectedBooking(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                    Отмени
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
