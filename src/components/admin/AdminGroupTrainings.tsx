"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  Users,
  Clock,
  Calendar,
  Baby,
  GraduationCap,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Phone,
  User,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type {
  GroupTraining,
  GroupTrainingRegistration,
  AgeGroup,
  Booking,
} from "@/lib/supabase";
import { AGE_GROUP_LABELS, DAY_NAMES_BG } from "@/lib/supabase";
import { COURT_A_ID, COURT_B_ID } from "@/lib/booking-utils";

interface AdminGroupTrainingsProps {
  groupTrainings: GroupTraining[];
  registrations: GroupTrainingRegistration[];
  bookings: Booking[];
  onAddTraining: (training: GroupTraining) => void;
  onRemoveTraining: (id: string) => void;
  onToggleActive: (id: string) => void;
  onCancelRegistration: (id: string) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => {
  const h = i + 8; // 08:00 - 20:00
  return `${h.toString().padStart(2, "0")}:00`;
});

const MONTH_NAMES = [
  "Януари", "Февруари", "Март", "Април", "Май", "Юни",
  "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември",
];

const SHORT_DAY_NAMES: Record<number, string> = {
  0: "Нед", 1: "Пон", 2: "Вто", 3: "Сря", 4: "Чет", 5: "Пет", 6: "Съб",
};

function getWeekDates(baseDate: Date): Date[] {
  const start = new Date(baseDate);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateStr(str: string | undefined): Date {
  if (!str || typeof str !== "string") return new Date();
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default function AdminGroupTrainings({
  groupTrainings,
  registrations,
  bookings,
  onAddTraining,
  onRemoveTraining,
  onToggleActive,
  onCancelRegistration,
}: AdminGroupTrainingsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAgeGroup, setNewAgeGroup] = useState<AgeGroup>("kids_5_8");
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [newStartTime, setNewStartTime] = useState("16:00");
  const [newEndTime, setNewEndTime] = useState("17:00");
  const [expandedTraining, setExpandedTraining] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [activeTab, setActiveTab] = useState<"calendar" | "schedule">("calendar");

  const weekDates = useMemo(() => getWeekDates(currentWeekStart), [currentWeekStart]);

  const weekMonth = weekDates[0].getMonth();
  const weekMonth2 = weekDates[6].getMonth();
  const weekYear = weekDates[0].getFullYear();
  const monthLabel =
    weekMonth === weekMonth2
      ? `${MONTH_NAMES[weekMonth]} ${weekYear}`
      : `${MONTH_NAMES[weekMonth]} – ${MONTH_NAMES[weekMonth2]} ${weekYear}`;

  const isCurrentWeek = useMemo(() => {
    const now = new Date();
    const thisWeek = getWeekDates(now);
    return weekDates[0].toDateString() === thisWeek[0].toDateString();
  }, [weekDates]);

  const navigateWeek = (direction: number) => {
    const newDateVal = new Date(currentWeekStart);
    newDateVal.setDate(newDateVal.getDate() + direction * 7);
    setCurrentWeekStart(newDateVal);
  };

  // Dates that have trainings (for calendar highlights)
  const trainingDates = useMemo(() => {
    return groupTrainings
      .filter((t) => t.is_active)
      .map((t) => parseDateStr(t.date));
  }, [groupTrainings]);

  const handleAdd = () => {
    if (!newDate) return;
    const ds = formatDateStr(newDate);
    // Validate: check that there's at least one free court for every hour in the range
    const startH = parseInt(newStartTime.split(":")[0]);
    const endH = parseInt(newEndTime.split(":")[0]);
    for (let h = startH; h < endH; h++) {
      const hourStr = `${h.toString().padStart(2, "0")}:00`;
      const slot = getSlotStatus(ds, hourStr);
      if (!slot.canAddTraining) {
        alert(`Няма свободен корт в ${hourStr} на ${DAY_NAMES_BG[newDate.getDay()]}, ${newDate.getDate()}.${(newDate.getMonth() + 1).toString().padStart(2, "0")}.${newDate.getFullYear()}. Моля изберете друг час.`);
        return;
      }
    }
    const training: GroupTraining = {
      id: `gt-${Date.now()}`,
      age_group: newAgeGroup,
      date: ds,
      start_time: newStartTime,
      end_time: newEndTime,
      max_participants: 10,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    onAddTraining(training);
    setShowAddForm(false);
    setNewDate(undefined);
  };

  const getRegistrationsForTrainingOnDate = (trainingId: string, dateStr: string) => {
    return registrations.filter(
      (r) => r.group_training_id === trainingId && r.date === dateStr && r.status === "confirmed"
    );
  };

  const getRegistrationsForTraining = (trainingId: string) => {
    return registrations.filter(
      (r) => r.group_training_id === trainingId && r.status === "confirmed"
    );
  };

  const getTrainingsForDate = (dateStr: string) => {
    return groupTrainings.filter((t) => t.date === dateStr && t.is_active);
  };

  // ── Court booking helpers ──────────────────────
  /** Get confirmed court bookings for a specific date */
  const getBookingsForDate = (dateStr: string): Booking[] => {
    return bookings.filter((b) => {
      if (b.status === "cancelled") return false;
      const d = new Date(b.start_time);
      const bDateStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
      return bDateStr === dateStr;
    });
  };

  /** Check if a specific court is booked at a given hour on a given date */
  const isCourtBookedAt = (dateStr: string, hour: string, courtId: string): Booking | null => {
    const hourNum = parseInt(hour.split(":")[0]);
    const dayBookings = getBookingsForDate(dateStr);
    return dayBookings.find((b) => {
      if (b.court_id !== courtId) return null;
      const bStart = new Date(b.start_time);
      const bEnd = new Date(b.end_time);
      const slotStart = new Date(parseDateStr(dateStr));
      slotStart.setHours(hourNum, 0, 0, 0);
      const slotEnd = new Date(slotStart);
      slotEnd.setHours(hourNum + 1, 0, 0, 0);
      // Overlap: (start < slotEnd) && (end > slotStart)
      return bStart < slotEnd && bEnd > slotStart;
    }) || null;
  };

  /** Get full slot status for a date+hour: court availability + group training */
  const getSlotStatus = (dateStr: string, hour: string) => {
    const courtABooking = isCourtBookedAt(dateStr, hour, COURT_A_ID);
    const courtBBooking = isCourtBookedAt(dateStr, hour, COURT_B_ID);
    const groupTraining = groupTrainings.find(
      (t) => t.date === dateStr && t.start_time <= hour && t.end_time > hour && t.is_active
    ) || null;
    const courtAFree = !courtABooking;
    const courtBFree = !courtBBooking;
    const hasGroupTraining = !!groupTraining;
    // A group training needs at least one free court
    const canAddTraining = (courtAFree || courtBFree) && !hasGroupTraining;
    const bothCourtsBusy = !courtAFree && !courtBFree;
    return { courtABooking, courtBBooking, courtAFree, courtBFree, groupTraining, hasGroupTraining, canAddTraining, bothCourtsBusy };
  };

  const COURT_NAMES: Record<string, string> = {
    [COURT_A_ID]: "Корт A",
    [COURT_B_ID]: "Корт B",
  };

  // Group trainings by age group
  const kids5_8 = groupTrainings.filter((t) => t.age_group === "kids_5_8");
  const kids8_11 = groupTrainings.filter((t) => t.age_group === "kids_8_11");

  const totalActiveTrainings = groupTrainings.filter((t) => t.is_active).length;
  const totalRegistrations = registrations.filter(
    (r) => r.status === "confirmed"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">
                  {totalActiveTrainings}
                </p>
                <p className="text-xs text-blue-600/70">Активни тренировки</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {totalRegistrations}
                </p>
                <p className="text-xs text-green-600/70">
                  Общо записани деца
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-700">
                  {groupTrainings.length}
                </p>
                <p className="text-xs text-orange-600/70">Общо графици</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("calendar")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === "calendar"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Calendar className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
          Седмичен календар
        </button>
        <button
          onClick={() => setActiveTab("schedule")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === "schedule"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Clock className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
          Управление на графика
        </button>
      </div>

      {/* ========== WEEKLY CALENDAR TAB ========== */}
      {activeTab === "calendar" && (
        <>
          {/* Week Navigation */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateWeek(-1)}
                  className="rounded-xl gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Предишна
                </Button>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">{monthLabel}</span>
                  {!isCurrentWeek && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentWeekStart(new Date())}
                      className="text-xs text-orange-600 hover:text-orange-700 rounded-lg"
                    >
                      Тази седмица
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateWeek(1)}
                  className="rounded-xl gap-1"
                >
                  Следваща
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 text-[11px] text-gray-500 mb-2">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-50 border border-amber-200" />Наем корт</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-indigo-50 border border-indigo-200" />Тренировка</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-50 border border-blue-200" />Деца 5-8г.</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-purple-50 border border-purple-200" />Деца 8-11г.</span>
              </div>

              {/* Week Grid */}
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date) => {
                  const dayOfWeek = date.getDay();
                  const dateStr = formatDateStr(date);
                  const dayTrainings = getTrainingsForDate(dateStr);
                  const dayBookings = getBookingsForDate(dateStr);
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                  const totalEvents = dayTrainings.length + dayBookings.length;

                  return (
                    <div
                      key={date.toISOString()}
                      className={cn(
                        "rounded-xl border p-2.5 min-h-[130px] transition-all",
                        isToday
                          ? "border-orange-400 bg-orange-50/50 ring-1 ring-orange-200"
                          : "border-gray-200 bg-white",
                        isPast && "opacity-50"
                      )}
                    >
                      {/* Day Header */}
                      <div className="text-center mb-2 pb-1.5 border-b border-gray-100">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                          {SHORT_DAY_NAMES[dayOfWeek]}
                        </p>
                        <p
                          className={cn(
                            "text-lg font-bold",
                            isToday ? "text-orange-600" : "text-gray-900"
                          )}
                        >
                          {date.getDate()}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {MONTH_NAMES[date.getMonth()].slice(0, 3)}
                        </p>
                      </div>

                      {/* All Events (trainings + bookings) */}
                      <div className="space-y-1.5">
                        {/* Court bookings */}
                        {dayBookings.map((booking) => {
                          const bStart = new Date(booking.start_time);
                          const bEnd = new Date(booking.end_time);
                          const timeLabel = `${bStart.getHours().toString().padStart(2, "0")}:${bStart.getMinutes().toString().padStart(2, "0")}`;
                          const courtName = COURT_NAMES[booking.court_id] || booking.court_id;
                          const isCoaching = booking.booking_type === "coaching_session";

                          return (
                            <div
                              key={booking.id}
                              className={cn(
                                "w-full rounded-lg p-2 text-left text-[11px] leading-tight",
                                isCoaching
                                  ? "bg-indigo-50 text-indigo-700"
                                  : "bg-amber-50 text-amber-700"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold">{timeLabel}</span>
                                <span className="text-[9px] opacity-70">{courtName}</span>
                              </div>
                              <span className="block mt-0.5 opacity-75">
                                {isCoaching ? "Тренировка" : "Наем корт"}
                              </span>
                            </div>
                          );
                        })}

                        {/* Group trainings */}
                        {dayTrainings.map((training) => {
                          const regsOnDate = getRegistrationsForTrainingOnDate(training.id, dateStr);
                          const regCount = regsOnDate.length;
                          const isFull = regCount >= training.max_participants;
                          const isExpanded = expandedTraining === `${training.id}-${dateStr}`;

                          return (
                            <button
                              key={training.id}
                              onClick={() =>
                                setExpandedTraining(
                                  isExpanded ? null : `${training.id}-${dateStr}`
                                )
                              }
                              className={cn(
                                "w-full rounded-lg p-2 text-left transition-all text-[11px] leading-tight",
                                training.age_group === "kids_5_8"
                                  ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                  : "bg-purple-50 text-purple-700 hover:bg-purple-100",
                                isFull && "ring-1 ring-red-300"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold">
                                  {training.start_time}
                                </span>
                                {isFull && (
                                  <span className="text-[9px] bg-red-100 text-red-600 px-1 rounded font-bold">
                                    ПЪЛНА
                                  </span>
                                )}
                              </div>
                              <span className="block mt-0.5 opacity-75">
                                {training.age_group === "kids_5_8" ? "5-8г." : "8-11г."}
                              </span>
                              <span className="block mt-0.5 font-medium">
                                {regCount}/{training.max_participants} деца
                              </span>
                            </button>
                          );
                        })}

                        {totalEvents === 0 && (
                          <p className="text-[10px] text-gray-300 text-center py-3">
                            —
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Expanded Registration Details (shown below calendar) */}
          {expandedTraining && (() => {
            const training = groupTrainings.find((t) => expandedTraining.startsWith(t.id));
            if (!training) return null;
            const dateStr = expandedTraining.replace(training.id + "-", "");
            const date = parseDateStr(dateStr);
            if (isNaN(date.getTime())) return null;
            const regsOnDate = getRegistrationsForTrainingOnDate(training.id, dateStr);
            const formattedDate = `${DAY_NAMES_BG[date.getDay()]}, ${date.getDate()}.${(date.getMonth() + 1).toString().padStart(2, "0")}.${date.getFullYear()}`;

            return (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center",
                        training.age_group === "kids_5_8" ? "bg-blue-500/10" : "bg-purple-500/10"
                      )}>
                        {training.age_group === "kids_5_8"
                          ? <Baby className="w-5 h-5 text-blue-600" />
                          : <GraduationCap className="w-5 h-5 text-purple-600" />
                        }
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">
                          {AGE_GROUP_LABELS[training.age_group]}
                        </CardTitle>
                        <p className="text-xs text-gray-500">
                          {formattedDate} • {training.start_time} – {training.end_time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={regsOnDate.length >= training.max_participants ? "destructive" : "secondary"} className="text-xs">
                        {regsOnDate.length} / {training.max_participants} записани
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedTraining(null)}
                        className="text-gray-400 hover:text-gray-600 rounded-lg"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {regsOnDate.length === 0 ? (
                    <div className="text-center py-6 text-gray-400">
                      <Users className="w-6 h-6 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Няма записани деца за тази дата</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {regsOnDate.map((reg) => (
                        <div
                          key={reg.id}
                          className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                              <User className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {reg.child_name}{" "}
                                <span className="text-gray-400 font-normal">
                                  ({reg.child_age} г.)
                                </span>
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>Родител: {reg.parent_name}</span>
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {reg.phone}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                            onClick={() => onCancelRegistration(reg.id)}
                          >
                            Отмени
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })()}
        </>
      )}

      {/* ========== SCHEDULE MANAGEMENT TAB ========== */}
      {activeTab === "schedule" && (
        <>
          {/* Add New Training */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  График на груповите тренировки
                </CardTitle>
                <Button
                  onClick={() => setShowAddForm(!showAddForm)}
                  size="sm"
                  className={cn(
                    "rounded-xl gap-2",
                    showAddForm
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-orange-600 hover:bg-orange-700 text-white"
                  )}
                >
                  {showAddForm ? (
                    "Отказ"
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Добави тренировка
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            {showAddForm && (
              <CardContent className="pt-0">
                <div className="bg-gray-50 rounded-xl p-4 space-y-5 border border-gray-100">
                  <p className="text-sm font-medium text-gray-700">
                    Нова групова тренировка
                  </p>

                  {/* Age Group Selection */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Възрастова група</Label>
                    <Select
                      value={newAgeGroup}
                      onValueChange={(v) => setNewAgeGroup(v as AgeGroup)}
                    >
                      <SelectTrigger className="rounded-xl w-full sm:w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kids_5_8">Деца 5–8 години</SelectItem>
                        <SelectItem value="kids_8_11">Деца 8–11 години</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Calendar + Time Grid side by side */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Date Picker Calendar */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">Избери дата</Label>
                      <div className="bg-white rounded-xl border border-gray-200 p-2 flex justify-center">
                        <CalendarPicker
                          mode="single"
                          selected={newDate}
                          onSelect={setNewDate}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                          modifiers={{
                            hasTraining: trainingDates,
                          }}
                          modifiersClassNames={{
                            hasTraining: "!bg-orange-100 !text-orange-700 font-bold",
                          }}
                          className="rounded-xl"
                        />
                      </div>
                      {newDate && (
                        <p className="text-xs text-center text-gray-500">
                          Избрана дата:{" "}
                          <span className="font-semibold text-gray-700">
                            {DAY_NAMES_BG[newDate.getDay()]}, {newDate.getDate()}.{(newDate.getMonth() + 1).toString().padStart(2, "0")}.{newDate.getFullYear()}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Time Slots Visual — shows ALL reservations */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">
                        Избери час {newDate ? `(${newDate.getDate()}.${(newDate.getMonth() + 1).toString().padStart(2, "0")})` : ""}
                      </Label>
                      {!newDate ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center justify-center text-gray-400 min-h-[300px]">
                          <Calendar className="w-10 h-10 mb-3 opacity-30" />
                          <p className="text-sm">Първо избери дата от календара</p>
                        </div>
                      ) : (
                        <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-1.5 max-h-[420px] overflow-y-auto">
                          {/* Legend */}
                          <div className="flex flex-wrap gap-3 text-[10px] text-gray-500 pb-2 border-b border-gray-100 mb-1">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" />Свободно</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />Наем корт</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" />5-8г.</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400" />8-11г.</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />Всичко заето</span>
                          </div>
                          {HOURS.map((hour) => {
                            const ds = formatDateStr(newDate);
                            const slot = getSlotStatus(ds, hour);
                            const isSelected = newStartTime === hour;
                            const isPastSlot = (() => {
                              const now = new Date();
                              const slotDate = new Date(newDate);
                              slotDate.setHours(parseInt(hour.split(":")[0]), 0, 0, 0);
                              return slotDate < now;
                            })();
                            const isDisabled = !slot.canAddTraining || isPastSlot;

                            return (
                              <button
                                key={hour}
                                disabled={isDisabled}
                                onClick={() => {
                                  setNewStartTime(hour);
                                  const h = parseInt(hour.split(":")[0]) + 1;
                                  setNewEndTime(`${h.toString().padStart(2, "0")}:00`);
                                }}
                                className={cn(
                                  "w-full rounded-lg text-sm transition-all text-left",
                                  isPastSlot
                                    ? "bg-gray-50 text-gray-300 cursor-not-allowed px-3 py-2.5"
                                    : slot.bothCourtsBusy && slot.hasGroupTraining
                                    ? "bg-red-50 text-red-400 cursor-not-allowed px-3 py-2.5"
                                    : slot.hasGroupTraining
                                    ? "bg-red-50/70 text-red-400 cursor-not-allowed px-3 py-2.5"
                                    : slot.bothCourtsBusy
                                    ? "bg-red-50 text-red-400 cursor-not-allowed px-3 py-2.5"
                                    : isSelected
                                    ? "bg-orange-100 text-orange-700 ring-2 ring-orange-400 font-semibold px-3 py-2.5"
                                    : "bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer px-3 py-2.5"
                                )}
                              >
                                {/* Top row: hour + status */}
                                <div className="flex items-center gap-3">
                                  <Clock className="w-4 h-4 flex-shrink-0" />
                                  <span className="font-medium">{hour}</span>
                                  <span className="flex-1" />
                                  {isPastSlot ? (
                                    <span className="text-xs text-gray-300">Минало</span>
                                  ) : isSelected && slot.canAddTraining ? (
                                    <span className="flex items-center gap-1 text-xs">
                                      <Check className="w-3.5 h-3.5" />
                                      Избрано
                                    </span>
                                  ) : slot.hasGroupTraining ? (
                                    <span className="text-xs flex items-center gap-1.5">
                                      <span className={cn(
                                        "w-2 h-2 rounded-full",
                                        slot.groupTraining!.age_group === "kids_5_8" ? "bg-blue-400" : "bg-purple-400"
                                      )} />
                                      {AGE_GROUP_LABELS[slot.groupTraining!.age_group]}
                                    </span>
                                  ) : slot.bothCourtsBusy ? (
                                    <span className="text-xs text-red-400 font-medium">Няма свободен корт</span>
                                  ) : slot.canAddTraining ? (
                                    <span className="text-xs text-green-500">Свободно</span>
                                  ) : null}
                                </div>

                                {/* Bottom row: court details (only if there's any booking) */}
                                {!isPastSlot && (slot.courtABooking || slot.courtBBooking || slot.hasGroupTraining) && (
                                  <div className="flex gap-2 mt-1.5 ml-7">
                                    {/* Court A chip */}
                                    <span className={cn(
                                      "text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1",
                                      slot.courtABooking
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-green-100 text-green-600"
                                    )}>
                                      A: {slot.courtABooking
                                        ? (slot.courtABooking.booking_type === "coaching_session" ? "Тренировка" : "Наем")
                                        : "Свободен"}
                                    </span>
                                    {/* Court B chip */}
                                    <span className={cn(
                                      "text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1",
                                      slot.courtBBooking
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-green-100 text-green-600"
                                    )}>
                                      B: {slot.courtBBooking
                                        ? (slot.courtBBooking.booking_type === "coaching_session" ? "Тренировка" : "Наем")
                                        : "Свободен"}
                                    </span>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* End time selector */}
                      {newDate && (
                        <div className="flex items-center gap-3 mt-3">
                          <Label className="text-xs text-gray-500 whitespace-nowrap">Краен час:</Label>
                          <Select
                            value={newEndTime}
                            onValueChange={(v) => setNewEndTime(v)}
                          >
                            <SelectTrigger className="rounded-xl flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {HOURS.filter((h) => h > newStartTime).map((h) => (
                                <SelectItem key={h} value={h}>
                                  {h}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary & Add */}
                  {newDate && (
                    <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-3 flex-wrap gap-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          {newAgeGroup === "kids_5_8"
                            ? <Baby className="w-4 h-4 text-blue-500" />
                            : <GraduationCap className="w-4 h-4 text-purple-500" />
                          }
                          {AGE_GROUP_LABELS[newAgeGroup]}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {DAY_NAMES_BG[newDate.getDay()]}, {newDate.getDate()}.{(newDate.getMonth() + 1).toString().padStart(2, "0")}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {newStartTime} – {newEndTime}
                        </span>
                      </div>
                      <Button
                        onClick={handleAdd}
                        disabled={!newDate}
                        className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Добави
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Age Group Sections */}
          {[
            {
              group: "kids_5_8" as AgeGroup,
              trainings: kids5_8,
              icon: Baby,
              color: "blue",
            },
            {
              group: "kids_8_11" as AgeGroup,
              trainings: kids8_11,
              icon: GraduationCap,
              color: "purple",
            },
          ].map(({ group, trainings, icon: Icon, color }) => (
            <Card key={group} className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center",
                      color === "blue"
                        ? "bg-blue-500/10"
                        : "bg-purple-500/10"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5",
                        color === "blue" ? "text-blue-600" : "text-purple-600"
                      )}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {AGE_GROUP_LABELS[group]}
                    </CardTitle>
                    <p className="text-xs text-gray-500">
                      {trainings.length} тренировки в графика
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {trainings.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Няма добавени тренировки</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trainings
                      .sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time))
                      .map((training) => {
                      const regs = getRegistrationsForTraining(training.id);
                      const isExpanded = expandedTraining === training.id;
                      const spotsLeft = training.max_participants - regs.length;

                      const trainingDate = parseDateStr(training.date);
                      const isPast = trainingDate < new Date(new Date().setHours(0, 0, 0, 0));

                      return (
                        <div
                          key={training.id}
                          className={cn(
                            "border rounded-xl overflow-hidden transition-all",
                            training.is_active
                              ? "border-gray-200 bg-white"
                              : "border-gray-100 bg-gray-50 opacity-60",
                            isPast && "opacity-40"
                          )}
                        >
                          {/* Training Row */}
                          <div className="flex items-center gap-3 p-4">
                            <div className="flex-1 flex items-center gap-4 flex-wrap">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium">
                                  {DAY_NAMES_BG[trainingDate.getDay()]}, {trainingDate.getDate()}.{(trainingDate.getMonth() + 1).toString().padStart(2, "0")}.{trainingDate.getFullYear()}
                                </span>
                                {isPast && (
                                  <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                    Минала
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {training.start_time} – {training.end_time}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">
                                  <span
                                    className={cn(
                                      "font-semibold",
                                      spotsLeft <= 2
                                        ? "text-red-600"
                                        : spotsLeft <= 5
                                        ? "text-orange-600"
                                        : "text-green-600"
                                    )}
                                  >
                                    {regs.length}
                                  </span>
                                  <span className="text-gray-400">
                                    {" / "}
                                    {training.max_participants}
                                  </span>
                                </span>
                              </div>
                              {spotsLeft === 0 && (
                                <Badge
                                  variant="destructive"
                                  className="text-[10px] px-2"
                                >
                                  ПЪЛНА
                                </Badge>
                              )}
                              {!training.is_active && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-2"
                                >
                                  НЕАКТИВНА
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg"
                                onClick={() => onToggleActive(training.id)}
                                title={
                                  training.is_active
                                    ? "Деактивирай"
                                    : "Активирай"
                                }
                              >
                                {training.is_active ? (
                                  <Eye className="w-4 h-4 text-green-600" />
                                ) : (
                                  <EyeOff className="w-4 h-4 text-gray-400" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg"
                                onClick={() =>
                                  setExpandedTraining(
                                    isExpanded ? null : training.id
                                  )
                                }
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-gray-500" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-gray-500" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => onRemoveTraining(training.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Expanded Registrations */}
                          {isExpanded && (
                            <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                              <p className="text-xs font-medium text-gray-500 mb-3">
                                Записани деца ({regs.length} /{" "}
                                {training.max_participants})
                              </p>
                              {regs.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">
                                  Все още няма записани деца
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {regs.map((reg) => (
                                    <div
                                      key={reg.id}
                                      className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                          <User className="w-4 h-4 text-orange-600" />
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">
                                            {reg.child_name}{" "}
                                            <span className="text-gray-400 font-normal">
                                              ({reg.child_age} г.)
                                            </span>
                                          </p>
                                          <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span>Родител: {reg.parent_name}</span>
                                            <span className="flex items-center gap-1">
                                              <Phone className="w-3 h-3" />
                                              {reg.phone}
                                            </span>
                                            <span className="text-gray-400">
                                              Дата: {reg.date}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                        onClick={() =>
                                          onCancelRegistration(reg.id)
                                        }
                                      >
                                        Отмени
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
