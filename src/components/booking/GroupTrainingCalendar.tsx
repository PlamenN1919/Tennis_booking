"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  Baby,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Phone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  GroupTraining,
  GroupTrainingRegistration,
  AgeGroup,
} from "@/lib/supabase";
import { AGE_GROUP_LABELS, DAY_NAMES_BG } from "@/lib/supabase";
import {
  getStoredGroupTrainings,
  getStoredRegistrations,
  saveRegistrations,
} from "@/lib/group-training-storage";

function getWeekDates(baseDate: Date): Date[] {
  const start = new Date(baseDate);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Start from Monday
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

const SHORT_DAY_NAMES: Record<number, string> = {
  0: "Нед",
  1: "Пон",
  2: "Вто",
  3: "Сря",
  4: "Чет",
  5: "Пет",
  6: "Съб",
};

const MONTH_NAMES = [
  "Януари",
  "Февруари",
  "Март",
  "Април",
  "Май",
  "Юни",
  "Юли",
  "Август",
  "Септември",
  "Октомври",
  "Ноември",
  "Декември",
];

export default function GroupTrainingCalendar() {
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [selectedTraining, setSelectedTraining] = useState<{
    training: GroupTraining;
    date: Date;
  } | null>(null);
  const [registrationForm, setRegistrationForm] = useState({
    parentName: "",
    childName: "",
    childAge: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);
  const [filterAge, setFilterAge] = useState<AgeGroup | "all">("all");

  // Read from shared localStorage so admin-created trainings appear here
  const [trainings, setTrainings] = useState<GroupTraining[]>(() => getStoredGroupTrainings());
  const [registrations, setRegistrations] = useState<
    GroupTrainingRegistration[]
  >(() => getStoredRegistrations());

  // Listen for changes from admin panel (same tab via custom events)
  useEffect(() => {
    const handleTrainingsUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail as GroupTraining[];
      setTrainings(detail);
    };
    const handleRegistrationsUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail as GroupTrainingRegistration[];
      setRegistrations(detail);
    };
    window.addEventListener("group-trainings-updated", handleTrainingsUpdate);
    window.addEventListener("group-registrations-updated", handleRegistrationsUpdate);

    // Also re-read on focus (covers navigating back from admin)
    const handleFocus = () => {
      setTrainings(getStoredGroupTrainings());
      setRegistrations(getStoredRegistrations());
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("group-trainings-updated", handleTrainingsUpdate);
      window.removeEventListener("group-registrations-updated", handleRegistrationsUpdate);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const weekDates = useMemo(
    () => getWeekDates(currentWeekStart),
    [currentWeekStart]
  );

  const activeTrainings = useMemo(
    () => trainings.filter((t) => t.is_active),
    [trainings]
  );

  const filteredTrainings = useMemo(
    () =>
      filterAge === "all"
        ? activeTrainings
        : activeTrainings.filter((t) => t.age_group === filterAge),
    [activeTrainings, filterAge]
  );

  const getRegistrationCount = (trainingId: string, dateStr: string) => {
    return registrations.filter(
      (r) =>
        r.group_training_id === trainingId &&
        r.date === dateStr &&
        r.status === "confirmed"
    ).length;
  };

  const getTrainingsForDate = (dateStr: string) => {
    return filteredTrainings.filter((t) => t.date === dateStr);
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentWeekStart(newDate);
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(new Date());
  };

  const handleRegister = () => {
    if (!selectedTraining) return;

    const { training, date } = selectedTraining;
    const dateStr = training.date;
    const currentCount = getRegistrationCount(training.id, dateStr);

    if (currentCount >= training.max_participants) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const newReg: GroupTrainingRegistration = {
        id: `gtr-${Date.now()}`,
        group_training_id: training.id,
        parent_name: registrationForm.parentName,
        child_name: registrationForm.childName,
        child_age: parseInt(registrationForm.childAge),
        phone: registrationForm.phone,
        date: dateStr,
        status: "confirmed",
        created_at: new Date().toISOString(),
      };

      setRegistrations((prev) => {
        const updated = [...prev, newReg];
        saveRegistrations(updated);
        return updated;
      });
      setIsSubmitting(false);
      setJustRegistered(true);
      setRegistrationForm({
        parentName: "",
        childName: "",
        childAge: "",
        phone: "",
      });

      setTimeout(() => {
        setJustRegistered(false);
        setSelectedTraining(null);
      }, 3000);
    }, 800);
  };

  const isFormValid =
    registrationForm.parentName.trim() &&
    registrationForm.childName.trim() &&
    registrationForm.childAge &&
    registrationForm.phone.trim();

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          Групови тренировки за деца
        </h2>
        <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto">
          Избери удобен ден и час за групова тренировка. Максимум 10 деца на
          група за индивидуално внимание.
        </p>
      </div>

      {/* Filter by age group */}
      <div className="flex justify-center gap-2">
        {[
          { key: "all" as const, label: "Всички" },
          { key: "kids_5_8" as const, label: "5–8 години" },
          { key: "kids_8_11" as const, label: "8–11 години" },
        ].map((f) => (
          <Button
            key={f.key}
            variant="ghost"
            size="sm"
            onClick={() => setFilterAge(f.key)}
            className={cn(
              "rounded-full px-4 text-sm transition-all",
              filterAge === f.key
                ? "bg-orange-600 text-white hover:bg-orange-700"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
            )}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateWeek(-1)}
          className="text-gray-400 hover:text-white rounded-xl px-2 sm:px-3"
        >
          <ChevronLeft className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">Предишна</span>
        </Button>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm font-medium text-white">{monthLabel}</span>
          {!isCurrentWeek && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goToCurrentWeek}
              className="text-xs text-orange-400 hover:text-orange-300 rounded-lg px-2"
            >
              Днес
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateWeek(1)}
          className="text-gray-400 hover:text-white rounded-xl px-2 sm:px-3"
        >
          <span className="hidden sm:inline">Следваща</span>
          <ChevronRight className="w-4 h-4 sm:ml-1" />
        </Button>
      </div>

      {/* Calendar Grid — Desktop: 7 cols, Mobile: vertical list */}
      {/* Desktop view */}
      <div className="hidden sm:grid grid-cols-7 gap-2">
        {weekDates.map((date) => {
          const dayOfWeek = date.getDay();
          const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
          const dayTrainings = getTrainingsForDate(dateStr);
          const isToday = date.toDateString() === new Date().toDateString();
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

          return (
            <div
              key={date.toISOString()}
              className={cn(
                "rounded-xl border p-2 min-h-[120px] transition-all",
                isToday
                  ? "border-orange-500/50 bg-orange-500/5"
                  : "border-white/10 bg-white/[0.02]",
                isPast && "opacity-50"
              )}
            >
              {/* Day Header */}
              <div className="text-center mb-2">
                <p className="text-[10px] text-gray-500 uppercase">
                  {SHORT_DAY_NAMES[dayOfWeek]}
                </p>
                <p
                  className={cn(
                    "text-sm font-bold",
                    isToday ? "text-orange-400" : "text-white"
                  )}
                >
                  {date.getDate()}
                </p>
              </div>

              {/* Trainings */}
              <div className="space-y-1.5">
                {dayTrainings.map((training) => {
                  const regCount = getRegistrationCount(training.id, training.date);
                  const isFull = regCount >= training.max_participants;
                  const spotsLeft = training.max_participants - regCount;

                  return (
                    <button
                      key={training.id}
                      onClick={() => {
                        if (!isPast && !isFull) {
                          setSelectedTraining({ training, date });
                          setJustRegistered(false);
                        }
                      }}
                      disabled={isPast || isFull}
                      className={cn(
                        "w-full rounded-lg p-1.5 text-left transition-all text-[10px] leading-tight",
                        isPast
                          ? "bg-gray-800/50 text-gray-600 cursor-not-allowed"
                          : isFull
                          ? "bg-red-900/20 text-red-400/60 cursor-not-allowed"
                          : training.age_group === "kids_5_8"
                          ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 cursor-pointer"
                          : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 cursor-pointer"
                      )}
                    >
                      <span className="font-semibold block">
                        {training.start_time}
                      </span>
                      <span className="block mt-0.5 opacity-75">
                        {training.age_group === "kids_5_8"
                          ? "5-8г."
                          : "8-11г."}
                      </span>
                      <span
                        className={cn(
                          "block mt-0.5",
                          isFull ? "text-red-400" : "opacity-60"
                        )}
                      >
                        {isFull ? "Пълна" : `${spotsLeft} места`}
                      </span>
                    </button>
                  );
                })}

                {dayTrainings.length === 0 && (
                  <p className="text-[10px] text-gray-600 text-center py-2">
                    —
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile view — vertical cards */}
      <div className="sm:hidden space-y-2">
        {weekDates.map((date) => {
          const dayOfWeek = date.getDay();
          const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
          const dayTrainings = getTrainingsForDate(dateStr);
          const isToday = date.toDateString() === new Date().toDateString();
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

          // On mobile, skip days without trainings to save space
          if (dayTrainings.length === 0) return null;

          return (
            <div
              key={date.toISOString()}
              className={cn(
                "rounded-xl border p-3 transition-all",
                isToday
                  ? "border-orange-500/50 bg-orange-500/5"
                  : "border-white/10 bg-white/[0.02]",
                isPast && "opacity-50"
              )}
            >
              {/* Day Header — horizontal on mobile */}
              <div className="flex items-center gap-3 mb-2.5">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0",
                    isToday ? "bg-orange-500/20" : "bg-white/5"
                  )}
                >
                  <p className="text-[9px] text-gray-500 uppercase leading-none">
                    {SHORT_DAY_NAMES[dayOfWeek]}
                  </p>
                  <p
                    className={cn(
                      "text-sm font-bold leading-tight",
                      isToday ? "text-orange-400" : "text-white"
                    )}
                  >
                    {date.getDate()}
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  {DAY_NAMES_BG[dayOfWeek]},{" "}
                  {date.getDate()}.{(date.getMonth() + 1).toString().padStart(2, "0")}
                </p>
              </div>

              {/* Training slots — stack vertically on mobile */}
              <div className="space-y-2">
                {dayTrainings.map((training) => {
                  const regCount = getRegistrationCount(training.id, training.date);
                  const isFull = regCount >= training.max_participants;
                  const spotsLeft = training.max_participants - regCount;

                  return (
                    <button
                      key={training.id}
                      onClick={() => {
                        if (!isPast && !isFull) {
                          setSelectedTraining({ training, date });
                          setJustRegistered(false);
                        }
                      }}
                      disabled={isPast || isFull}
                      className={cn(
                        "w-full rounded-xl p-3 text-left transition-all",
                        isPast
                          ? "bg-gray-800/50 text-gray-600 cursor-not-allowed"
                          : isFull
                          ? "bg-red-900/20 text-red-400/60 cursor-not-allowed"
                          : training.age_group === "kids_5_8"
                          ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 active:bg-blue-500/30 cursor-pointer"
                          : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 active:bg-purple-500/30 cursor-pointer"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold">
                          {training.start_time} – {training.end_time}
                        </span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] px-1.5 py-0",
                            training.age_group === "kids_5_8"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-purple-500/20 text-purple-400"
                          )}
                        >
                          {training.age_group === "kids_5_8" ? "5-8г." : "8-11г."}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3 h-3 opacity-60" />
                        <span
                          className={cn(
                            "text-xs",
                            isFull ? "text-red-400 font-medium" : "opacity-70"
                          )}
                        >
                          {isFull ? "Пълна група" : `${spotsLeft} свободни места`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Show message if no trainings at all this week */}
        {weekDates.every(
          (date) => {
            const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
            return getTrainingsForDate(dateStr).length === 0;
          }
        ) && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Няма тренировки тази седмица</p>
          </div>
        )}
      </div>

      {/* Registration Modal/Card */}
      {selectedTraining && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full sm:max-w-md border-0 shadow-2xl bg-gray-950 text-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">
                  {justRegistered
                    ? "Успешна регистрация!"
                    : "Записване за тренировка"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTraining(null)}
                  className="text-gray-400 hover:text-white rounded-lg"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {justRegistered ? (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                  <p className="text-green-400 font-medium">
                    Детето е записано успешно!
                  </p>
                  <p className="text-sm text-gray-400">
                    Ще получите потвърждение на телефона.
                  </p>
                </div>
              ) : (
                <>
                  {/* Training Info */}
                  <div className="bg-white/5 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          "text-[10px]",
                          selectedTraining.training.age_group === "kids_5_8"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-purple-500/20 text-purple-400"
                        )}
                      >
                        {
                          AGE_GROUP_LABELS[
                            selectedTraining.training.age_group
                          ]
                        }
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-300">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {DAY_NAMES_BG[
                          selectedTraining.date.getDay()
                        ]},{" "}
                        {selectedTraining.date.getDate()}.
                        {(
                          selectedTraining.date.getMonth() + 1
                        )
                          .toString()
                          .padStart(2, "0")}
                        .{selectedTraining.date.getFullYear()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-500" />
                        {selectedTraining.training.start_time} –{" "}
                        {selectedTraining.training.end_time}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400">
                        Свободни места:{" "}
                        <span className="font-bold text-orange-400">
                          {selectedTraining.training.max_participants -
                            getRegistrationCount(
                              selectedTraining.training.id,
                              selectedTraining.training.date
                            )}
                        </span>{" "}
                        / {selectedTraining.training.max_participants}
                      </span>
                    </div>
                  </div>

                  {/* Registration Form */}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-400">
                        Име на родител
                      </Label>
                      <Input
                        value={registrationForm.parentName}
                        onChange={(e) =>
                          setRegistrationForm((f) => ({
                            ...f,
                            parentName: e.target.value,
                          }))
                        }
                        placeholder="Иван Иванов"
                        className="rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-400">
                          Име на детето
                        </Label>
                        <Input
                          value={registrationForm.childName}
                          onChange={(e) =>
                            setRegistrationForm((f) => ({
                              ...f,
                              childName: e.target.value,
                            }))
                          }
                          placeholder="Мария"
                          className="rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-400">
                          Възраст
                        </Label>
                        <Input
                          type="number"
                          min={
                            selectedTraining.training.age_group === "kids_5_8"
                              ? 5
                              : 8
                          }
                          max={
                            selectedTraining.training.age_group === "kids_5_8"
                              ? 8
                              : 11
                          }
                          value={registrationForm.childAge}
                          onChange={(e) =>
                            setRegistrationForm((f) => ({
                              ...f,
                              childAge: e.target.value,
                            }))
                          }
                          placeholder={
                            selectedTraining.training.age_group === "kids_5_8"
                              ? "5-8"
                              : "8-11"
                          }
                          className="rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-400">
                        Телефон за връзка
                      </Label>
                      <Input
                        type="tel"
                        value={registrationForm.phone}
                        onChange={(e) =>
                          setRegistrationForm((f) => ({
                            ...f,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="0888 123 456"
                        className="rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  {/* Price Info */}
                  <div className="bg-orange-500/10 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-sm text-orange-300">
                      Цена на тренировка
                    </span>
                    <span className="text-lg font-bold text-orange-400">
                      20 лв.
                    </span>
                  </div>

                  {/* Submit */}
                  <Button
                    onClick={handleRegister}
                    disabled={!isFormValid || isSubmitting}
                    className="w-full rounded-xl bg-orange-600 hover:bg-orange-700 text-white h-11 text-sm font-medium"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Записване...
                      </span>
                    ) : (
                      "Запиши дете"
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 text-[10px] sm:text-xs text-gray-500 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-500/20" />
          <span>Деца 5–8 г.</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-purple-500/20" />
          <span>Деца 8–11 г.</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-900/30" />
          <span>Пълна група</span>
        </div>
      </div>
    </div>
  );
}
