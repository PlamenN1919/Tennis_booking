"use client";

import { useState, useMemo, useEffect } from "react";
import { format, addDays, isToday } from "date-fns";
import { bg } from "date-fns/locale";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  User,
  Phone,
  Mail,
  StickyNote,
  CheckCircle2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  OPENING_HOUR,
  CLOSING_HOUR,
  COURT_A_ID,
  COURT_B_ID,
  isSlotAvailable,
} from "@/lib/booking-utils";
import { mockCourts, mockCoaches } from "@/lib/mock-data";
import type { Booking } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface AdminCreateBookingProps {
  bookings: Booking[];
  onBookingCreated: (booking: Booking) => void;
  prefillDate?: string;
  prefillTime?: string;
  prefillCourt?: string;
}

type Step = "type" | "datetime" | "details" | "confirm";

export default function AdminCreateBooking({
  bookings,
  onBookingCreated,
  prefillDate,
  prefillTime,
  prefillCourt,
}: AdminCreateBookingProps) {
  const [step, setStep] = useState<Step>("type");
  const [bookingType, setBookingType] = useState<"court_rental" | "coaching_session">("court_rental");
  const [selectedDate, setSelectedDate] = useState<string>(prefillDate || format(new Date(), "yyyy-MM-dd"));
  const [selectedTime, setSelectedTime] = useState<string>(prefillTime || "");
  const [selectedCourt, setSelectedCourt] = useState<string>(prefillCourt || "");
  const [selectedCoach, setSelectedCoach] = useState<string>("");
  const [durationHours, setDurationHours] = useState<number>(1);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringWeeks, setRecurringWeeks] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-advance to datetime if we have prefill data
  useEffect(() => {
    if (prefillDate && prefillTime && prefillCourt) {
      setStep("datetime");
    }
  }, [prefillDate, prefillTime, prefillCourt]);

  const hours = Array.from({ length: CLOSING_HOUR - OPENING_HOUR }, (_, i) => OPENING_HOUR + i);

  // Get available slots for selected date
  const availableSlots = useMemo(() => {
    if (!selectedDate) return {};
    const date = new Date(selectedDate);
    const result: Record<string, { courtA: boolean; courtB: boolean }> = {};

    hours.forEach((h) => {
      const time = `${String(h).padStart(2, "0")}:00`;
      // Check for multi-hour availability
      let courtAFree = true;
      let courtBFree = true;
      for (let d = 0; d < durationHours; d++) {
        const checkTime = `${String(h + d).padStart(2, "0")}:00`;
        if (h + d >= CLOSING_HOUR) {
          courtAFree = false;
          courtBFree = false;
          break;
        }
        if (!isSlotAvailable(date, checkTime, COURT_A_ID, bookings)) courtAFree = false;
        if (!isSlotAvailable(date, checkTime, COURT_B_ID, bookings)) courtBFree = false;
      }
      result[time] = { courtA: courtAFree, courtB: courtBFree };
    });

    return result;
  }, [selectedDate, bookings, durationHours, hours]);

  // Auto-select court when time is selected
  useEffect(() => {
    if (selectedTime && !selectedCourt) {
      const slot = availableSlots[selectedTime];
      if (slot) {
        if (slot.courtA) setSelectedCourt(COURT_A_ID);
        else if (slot.courtB) setSelectedCourt(COURT_B_ID);
      }
    }
  }, [selectedTime, selectedCourt, availableSlots]);

  const calculatePrice = () => {
    let basePrice = 40 * durationHours; // base court rental

    if (bookingType === "coaching_session" && selectedCoach) {
      const coach = mockCoaches.find((c) => c.id === selectedCoach);
      if (coach) {
        basePrice = coach.hourly_rate * durationHours;
      }
    }

    return basePrice;
  };

  const totalPrice = calculatePrice();

  const canProceedToDetails =
    selectedDate && selectedTime && selectedCourt;

  const canSubmit = customerName.trim().length >= 2 && customerPhone.trim().length >= 7;

  const handleSubmit = () => {
    if (!canSubmit || !selectedTime || !selectedCourt) return;

    setIsSubmitting(true);

    const [h] = selectedTime.split(":").map(Number);
    const date = new Date(selectedDate);
    const startTime = new Date(date);
    startTime.setHours(h, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + durationHours);

    // Create booking(s)
    const weeksToBook = isRecurring ? recurringWeeks : 1;

    for (let week = 0; week < weeksToBook; week++) {
      const weekStart = new Date(startTime);
      weekStart.setDate(weekStart.getDate() + week * 7);
      const weekEnd = new Date(endTime);
      weekEnd.setDate(weekEnd.getDate() + week * 7);

      const newBooking: Booking = {
        id: `admin-${Date.now()}-${week}`,
        user_id: "admin",
        court_id: selectedCourt,
        coach_id: bookingType === "coaching_session" ? selectedCoach || null : null,
        start_time: weekStart.toISOString(),
        end_time: weekEnd.toISOString(),
        booking_type: bookingType,
        status: "confirmed",
        total_price: totalPrice,
        notes: notes || `Резервация: ${customerName}`,
        created_at: new Date().toISOString(),
        // Extra fields
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
      } as any;

      onBookingCreated(newBooking);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 800);
  };

  const resetForm = () => {
    setStep("type");
    setBookingType("court_rental");
    setSelectedDate(format(new Date(), "yyyy-MM-dd"));
    setSelectedTime("");
    setSelectedCourt("");
    setSelectedCoach("");
    setDurationHours(1);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setNotes("");
    setIsRecurring(false);
    setRecurringWeeks(4);
    setIsSuccess(false);
  };

  // Quick date buttons
  const quickDates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(today, i);
      return {
        date: format(d, "yyyy-MM-dd"),
        label: i === 0 ? "Днес" : i === 1 ? "Утре" : format(d, "EEE d", { locale: bg }),
        isToday: i === 0,
      };
    });
  }, []);

  // Success screen
  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="border-0 shadow-lg rounded-2xl max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Резервацията е създадена!</h2>
            <p className="text-sm text-gray-500 mb-6">
              {customerName} • {format(new Date(selectedDate), "d MMMM yyyy", { locale: bg })} •{" "}
              {selectedTime} • {mockCourts.find((c) => c.id === selectedCourt)?.name}
              {isRecurring && ` • ${recurringWeeks} седмици`}
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-2xl font-black text-orange-600">
                {totalPrice * (isRecurring ? recurringWeeks : 1)} лв
                {isRecurring && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({totalPrice} лв × {recurringWeeks} седмици)
                  </span>
                )}
              </p>
            </div>
            <Button
              onClick={resetForm}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-full w-full gap-2"
            >
              Нова резервация
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Нова резервация</h2>
          <p className="text-sm text-gray-500">Създайте резервация за клиент</p>
        </div>
        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {(["type", "datetime", "details", "confirm"] as Step[]).map((s, i) => {
            const labels = ["Тип", "Дата", "Детайли", "Преглед"];
            const isActive = step === s;
            const isPassed = ["type", "datetime", "details", "confirm"].indexOf(step) > i;
            return (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
                    isPassed
                      ? "bg-orange-600 text-white"
                      : isActive
                      ? "bg-orange-100 text-orange-700 ring-2 ring-orange-300"
                      : "bg-gray-100 text-gray-400"
                  )}
                >
                  {isPassed ? "✓" : i + 1}
                </div>
                <span className={cn(
                  "text-xs font-medium hidden sm:inline",
                  isActive ? "text-orange-600" : "text-gray-400"
                )}>
                  {labels[i]}
                </span>
                {i < 3 && <div className={cn(
                  "w-6 h-0.5 rounded",
                  isPassed ? "bg-orange-400" : "bg-gray-200"
                )} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Type Selection */}
      {step === "type" && (
        <div className="space-y-4">
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Изберете тип услуга</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setBookingType("court_rental")}
                  className={cn(
                    "rounded-2xl p-6 text-left transition-all border-2",
                    bookingType === "court_rental"
                      ? "border-orange-500 bg-orange-50 shadow-md"
                      : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-gray-900">Наем на корт</h4>
                  <p className="text-xs text-gray-500 mt-1">Резервация на тенис корт без треньор</p>
                  <p className="text-lg font-black text-orange-600 mt-3">от 40 лв/час</p>
                </button>

                <button
                  onClick={() => setBookingType("coaching_session")}
                  className={cn(
                    "rounded-2xl p-6 text-left transition-all border-2",
                    bookingType === "coaching_session"
                      ? "border-orange-500 bg-orange-50 shadow-md"
                      : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-bold text-gray-900">Урок с треньор</h4>
                  <p className="text-xs text-gray-500 mt-1">Индивидуална сесия с професионалист</p>
                  <p className="text-lg font-black text-orange-600 mt-3">от 80 лв/час</p>
                </button>
              </div>

              {/* Coach Selection */}
              {bookingType === "coaching_session" && (
                <div className="mt-6">
                  <Label className="text-sm font-semibold text-gray-700 mb-3 block">Изберете треньор</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {mockCoaches.map((coach) => (
                      <button
                        key={coach.id}
                        onClick={() => setSelectedCoach(coach.id)}
                        className={cn(
                          "rounded-xl p-4 text-left transition-all border-2",
                          selectedCoach === coach.id
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-100 hover:border-gray-200"
                        )}
                      >
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                          <User className="w-5 h-5 text-purple-600" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{coach.name}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{coach.specialization}</p>
                        <p className="text-sm font-bold text-purple-600 mt-2">{coach.hourly_rate} лв/час</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={() => setStep("datetime")}
                className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white rounded-full h-11"
                disabled={bookingType === "coaching_session" && !selectedCoach}
              >
                Продължи
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Date & Time */}
      {step === "datetime" && (
        <div className="space-y-4">
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              {/* Date Selection */}
              <div className="mb-6">
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">Дата</Label>
                {/* Quick date buttons */}
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                  {quickDates.map((qd) => (
                    <button
                      key={qd.date}
                      onClick={() => {
                        setSelectedDate(qd.date);
                        setSelectedTime("");
                        setSelectedCourt("");
                      }}
                      className={cn(
                        "px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                        selectedDate === qd.date
                          ? "bg-orange-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      {qd.label}
                    </button>
                  ))}
                </div>
                {/* Date input */}
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime("");
                    setSelectedCourt("");
                  }}
                  className="rounded-xl"
                />
              </div>

              {/* Duration */}
              <div className="mb-6">
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">Продължителност</Label>
                <div className="flex gap-2">
                  {[1, 1.5, 2, 3].map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setDurationHours(d);
                        setSelectedTime("");
                        setSelectedCourt("");
                      }}
                      className={cn(
                        "px-5 py-2.5 rounded-full text-sm font-medium transition-all",
                        durationHours === d
                          ? "bg-orange-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      {d} {d === 1 ? "час" : "часа"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots Grid */}
              <div className="mb-6">
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Час
                  <span className="font-normal text-gray-400 ml-2">
                    ({format(new Date(selectedDate), "d MMMM", { locale: bg })})
                  </span>
                </Label>
                <div className="grid grid-cols-5 gap-2">
                  {hours.filter(h => h + durationHours <= CLOSING_HOUR).map((h) => {
                    const time = `${String(h).padStart(2, "0")}:00`;
                    const slot = availableSlots[time];
                    const isAvailable = slot && (slot.courtA || slot.courtB);
                    const isSelected = selectedTime === time;

                    return (
                      <button
                        key={h}
                        onClick={() => {
                          if (!isAvailable) return;
                          setSelectedTime(time);
                          // Auto-select court
                          if (slot.courtA && !slot.courtB) setSelectedCourt(COURT_A_ID);
                          else if (!slot.courtA && slot.courtB) setSelectedCourt(COURT_B_ID);
                          else setSelectedCourt(""); // Let user choose
                        }}
                        disabled={!isAvailable}
                        className={cn(
                          "py-2.5 rounded-xl text-sm font-medium transition-all relative",
                          isSelected
                            ? "bg-orange-600 text-white shadow-md"
                            : isAvailable
                            ? "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-100"
                            : "bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-50"
                        )}
                      >
                        {time}
                        {isAvailable && !isSelected && (
                          <div className="flex gap-0.5 justify-center mt-1">
                            {slot.courtA && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            )}
                            {slot.courtB && (
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Court Selection */}
              {selectedTime && (() => {
                const slot = availableSlots[selectedTime];
                const bothAvailable = slot?.courtA && slot?.courtB;

                return bothAvailable ? (
                  <div className="mb-6">
                    <Label className="text-sm font-semibold text-gray-700 mb-3 block">Корт</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSelectedCourt(COURT_A_ID)}
                        className={cn(
                          "rounded-xl p-4 text-center transition-all border-2",
                          selectedCourt === COURT_A_ID
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-100 hover:border-gray-200"
                        )}
                      >
                        <span className="text-sm font-bold">Корт A</span>
                        <p className="text-[10px] text-gray-500 mt-1">Основен корт</p>
                      </button>
                      <button
                        onClick={() => setSelectedCourt(COURT_B_ID)}
                        className={cn(
                          "rounded-xl p-4 text-center transition-all border-2",
                          selectedCourt === COURT_B_ID
                            ? "border-green-500 bg-green-50"
                            : "border-gray-100 hover:border-gray-200"
                        )}
                      >
                        <span className="text-sm font-bold">Корт B</span>
                        <p className="text-[10px] text-gray-500 mt-1">Втори корт</p>
                      </button>
                    </div>
                  </div>
                ) : null;
              })()}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("type")}
                  className="rounded-full gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Назад
                </Button>
                <Button
                  onClick={() => setStep("details")}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-full h-11"
                  disabled={!canProceedToDetails}
                >
                  Продължи
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Customer Details */}
      {step === "details" && (
        <div className="space-y-4">
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Данни на клиента</h3>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-600">
                    Име на клиент <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Иван Петров"
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">
                    Телефон <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+359 888 123 456"
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">Имейл (по избор)</Label>
                  <div className="relative mt-1">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="ivan@email.com"
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">Бележки</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Допълнителна информация..."
                    className="rounded-xl mt-1 min-h-[80px]"
                  />
                </div>

                {/* Recurring Option */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Repeat className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Повтаряща се резервация</p>
                        <p className="text-[11px] text-gray-500">Резервирай същия час за няколко седмици</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsRecurring(!isRecurring)}
                      className={cn(
                        "w-11 h-6 rounded-full transition-all relative",
                        isRecurring ? "bg-orange-600" : "bg-gray-300"
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm",
                          isRecurring ? "left-5.5" : "left-0.5"
                        )}
                      />
                    </button>
                  </div>
                  {isRecurring && (
                    <div className="mt-3 flex items-center gap-3">
                      <Label className="text-xs text-gray-500 flex-shrink-0">Брой седмици:</Label>
                      <div className="flex gap-1">
                        {[2, 4, 6, 8, 12].map((w) => (
                          <button
                            key={w}
                            onClick={() => setRecurringWeeks(w)}
                            className={cn(
                              "px-3 py-1 rounded-full text-xs font-medium transition-all",
                              recurringWeeks === w
                                ? "bg-orange-600 text-white"
                                : "bg-white text-gray-600 hover:bg-gray-100"
                            )}
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep("datetime")}
                  className="rounded-full gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Назад
                </Button>
                <Button
                  onClick={() => setStep("confirm")}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-full h-11"
                  disabled={!canSubmit}
                >
                  Преглед и потвърждение
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === "confirm" && (
        <div className="space-y-4">
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Преглед на резервацията</h3>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                {/* Type */}
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    bookingType === "coaching_session" ? "bg-purple-100" : "bg-blue-100"
                  )}>
                    {bookingType === "coaching_session" ? (
                      <Users className="w-5 h-5 text-purple-600" />
                    ) : (
                      <MapPin className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {bookingType === "coaching_session" ? "Урок с треньор" : "Наем на корт"}
                    </p>
                    {bookingType === "coaching_session" && selectedCoach && (
                      <p className="text-xs text-gray-500">
                        {mockCoaches.find((c) => c.id === selectedCoach)?.name}
                      </p>
                    )}
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Date/Time/Court */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Дата</p>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                      <p className="text-sm font-semibold">
                        {format(new Date(selectedDate), "d MMM yyyy", { locale: bg })}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Час</p>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <p className="text-sm font-semibold">
                        {selectedTime} ({durationHours}ч.)
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Корт</p>
                    <Badge variant="secondary" className="text-xs">
                      {mockCourts.find((c) => c.id === selectedCourt)?.name}
                    </Badge>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Customer */}
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Клиент</p>
                  <p className="text-sm font-bold text-gray-900">{customerName}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {customerPhone}
                    </span>
                    {customerEmail && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {customerEmail}
                      </span>
                    )}
                  </div>
                </div>

                {notes && (
                  <>
                    <hr className="border-gray-200" />
                    <div className="flex items-start gap-2">
                      <StickyNote className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                      <p className="text-xs text-gray-600">{notes}</p>
                    </div>
                  </>
                )}

                {isRecurring && (
                  <>
                    <hr className="border-gray-200" />
                    <div className="flex items-center gap-2">
                      <Repeat className="w-3.5 h-3.5 text-orange-500" />
                      <p className="text-xs text-orange-600 font-medium">
                        Повтаряща се: {recurringWeeks} седмици
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Total Price */}
              <div className="mt-4 bg-orange-50 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Обща цена</span>
                <div className="text-right">
                  <p className="text-2xl font-black text-orange-600">
                    {totalPrice * (isRecurring ? recurringWeeks : 1)} лв
                  </p>
                  {isRecurring && (
                    <p className="text-[10px] text-gray-500">
                      {totalPrice} лв × {recurringWeeks} седмици
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep("details")}
                  className="rounded-full gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Назад
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-full h-12 text-base font-bold gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Създаване...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Потвърди резервацията
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
