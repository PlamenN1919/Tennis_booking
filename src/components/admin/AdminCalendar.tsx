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
  Phone,
  Mail,
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
} from "@/lib/booking-utils";
import { mockCourts, mockCoaches } from "@/lib/mock-data";
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

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const hours = Array.from(
    { length: CLOSING_HOUR - OPENING_HOUR },
    (_, i) => OPENING_HOUR + i
  );

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");

  const getBookingForSlot = (day: Date, hour: number, courtId: string) => {
    const dayStr = format(day, "yyyy-MM-dd");
    return confirmedBookings.find((b) => {
      const bDate = format(new Date(b.start_time), "yyyy-MM-dd");
      const bHour = new Date(b.start_time).getHours();
      return bDate === dayStr && bHour === hour && b.court_id === courtId;
    });
  };

  const getCourtName = (id: string) =>
    mockCourts.find((c) => c.id === id)?.name || id;

  const getCoachName = (id: string | null) => {
    if (!id) return null;
    return mockCoaches.find((c) => c.id === id)?.name || null;
  };

  const goToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // For mobile/small screens show a single-day view, for larger show full week
  const displayDays = selectedDay ? [selectedDay] : weekDays;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Седмичен календар</h2>
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
            className="rounded-full text-xs"
          >
            Днес
          </Button>
          <div className="flex items-center bg-white border border-gray-200 rounded-full overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-orange-100 border border-orange-300" />
          <span>Наем на корт</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-100 border border-blue-300" />
          <span>Тренировка</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-50 border border-gray-200" />
          <span>Свободно</span>
        </div>
      </div>

      {/* Day Selector for mobile */}
      <div className="flex sm:hidden gap-1 overflow-x-auto pb-2">
        {weekDays.map((day) => {
          const dayIsToday = isToday(day);
          const isSelected = selectedDay && format(selectedDay, "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              className={cn(
                "flex flex-col items-center px-3 py-2 rounded-xl text-xs font-medium transition-all min-w-[48px]",
                isSelected
                  ? "bg-orange-500 text-white"
                  : dayIsToday
                    ? "bg-orange-50 text-orange-600 border border-orange-200"
                    : "bg-white text-gray-600 border border-gray-200"
              )}
            >
              <span>{format(day, "EEE", { locale: bg })}</span>
              <span className="text-sm font-bold">{format(day, "d")}</span>
            </button>
          );
        })}
      </div>

      {/* Calendar Grid */}
      <Card className="overflow-hidden border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="w-16 p-2 text-xs font-semibold text-gray-400 text-center border-b border-r border-gray-100">
                    Час
                  </th>
                  {displayDays.map((day) => {
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
                            {format(day, "EEE", { locale: bg })}
                          </span>
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
                          {/* Sub headers for courts */}
                          <div className="flex gap-0 w-full mt-1">
                            <span className="flex-1 text-[9px] text-gray-400 font-medium">Корт A</span>
                            <span className="flex-1 text-[9px] text-gray-400 font-medium">Корт B</span>
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
                  const isCurrentHour = hour === currentHour;
                  return (
                    <tr
                      key={hour}
                      className={cn(
                        "group transition-colors",
                        hour % 2 === 0 ? "bg-white" : "bg-gray-50/50",
                        isCurrentHour && "bg-orange-50/40"
                      )}
                    >
                      <td className="p-2 text-xs font-mono text-gray-400 text-center border-r border-gray-100 relative">
                        {String(hour).padStart(2, "0")}:00
                        {isCurrentHour && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-500" />
                        )}
                      </td>
                      {displayDays.map((day) => {
                        const courtABooking = getBookingForSlot(day, hour, COURT_A_ID);
                        const courtBBooking = getBookingForSlot(day, hour, COURT_B_ID);
                        const dayStr = format(day, "yyyy-MM-dd");
                        const timeStr = `${String(hour).padStart(2, "0")}:00`;

                        return (
                          <td
                            key={day.toISOString()}
                            colSpan={2}
                            className="border-r border-gray-100 last:border-r-0 p-0"
                          >
                            <div className="flex">
                              {/* Court A Cell */}
                              <div className="flex-1 border-r border-gray-100/50 min-h-[48px] p-0.5">
                                {courtABooking ? (
                                  <button
                                    onClick={() => setSelectedBooking(courtABooking)}
                                    className={cn(
                                      "w-full h-full min-h-[44px] rounded-lg p-1.5 text-left transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer",
                                      courtABooking.booking_type === "coaching_session"
                                        ? "bg-blue-100 border border-blue-200 text-blue-800"
                                        : "bg-orange-100 border border-orange-200 text-orange-800"
                                    )}
                                  >
                                    <p className="text-[10px] font-bold truncate leading-tight">
                                      {courtABooking.booking_type === "coaching_session" ? "Тренировка" : "Наем"}
                                    </p>
                                    {courtABooking.notes && (
                                      <p className="text-[9px] opacity-70 truncate mt-0.5">
                                        {courtABooking.notes.split("\n")[0].substring(0, 20)}
                                      </p>
                                    )}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => onCreateFromSlot(dayStr, timeStr, COURT_A_ID)}
                                    className="w-full h-full min-h-[44px] rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-orange-50 border border-dashed border-transparent hover:border-orange-200"
                                  >
                                    <Plus className="w-3.5 h-3.5 text-orange-400" />
                                  </button>
                                )}
                              </div>
                              {/* Court B Cell */}
                              <div className="flex-1 min-h-[48px] p-0.5">
                                {courtBBooking ? (
                                  <button
                                    onClick={() => setSelectedBooking(courtBBooking)}
                                    className={cn(
                                      "w-full h-full min-h-[44px] rounded-lg p-1.5 text-left transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer",
                                      courtBBooking.booking_type === "coaching_session"
                                        ? "bg-blue-100 border border-blue-200 text-blue-800"
                                        : "bg-orange-100 border border-orange-200 text-orange-800"
                                    )}
                                  >
                                    <p className="text-[10px] font-bold truncate leading-tight">
                                      {courtBBooking.booking_type === "coaching_session" ? "Тренировка" : "Наем"}
                                    </p>
                                    {courtBBooking.notes && (
                                      <p className="text-[9px] opacity-70 truncate mt-0.5">
                                        {courtBBooking.notes.split("\n")[0].substring(0, 20)}
                                      </p>
                                    )}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => onCreateFromSlot(dayStr, timeStr, COURT_B_ID)}
                                    className="w-full h-full min-h-[44px] rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-50 border border-dashed border-transparent hover:border-blue-200"
                                  >
                                    <Plus className="w-3.5 h-3.5 text-blue-400" />
                                  </button>
                                )}
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
          </div>
        </CardContent>
      </Card>

      {/* Booking Detail Dialog */}
      <Dialog
        open={!!selectedBooking}
        onOpenChange={() => setSelectedBooking(null)}
      >
        <DialogContent className="max-w-md rounded-2xl">
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
                    {selectedBooking.total_price} лв.
                  </p>
                </div>
                {selectedBooking.status === "confirmed" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-xl gap-2"
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
