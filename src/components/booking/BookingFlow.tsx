"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { bg } from "date-fns/locale";
import {
  ArrowLeft,
  MapPin,
  User,
  GraduationCap,
  CheckCircle2,
  Calendar,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import DatePicker from "@/components/booking/DatePicker";
import TimeSlotGrid from "@/components/booking/TimeSlotGrid";
import {
  getTimeSlotsWithAvailability,
  findAvailableCourt,
  formatDateBG,
  formatTimeRange,
  getCourtHourlyPrice,
  COACHING_PRICES,
  COACHING_LABELS,
  type CoachingType,
  COURT_A_ID,
  COURT_B_ID,
} from "@/lib/booking-utils";
import { mockBookings, mockCoaches, mockCourts } from "@/lib/mock-data";
import type { Booking } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type BookingType = "court_rental" | "coaching_session";
type Step = "service" | "datetime" | "details" | "confirmation";

export default function BookingFlow() {
  const [currentStep, setCurrentStep] = useState<Step>("service");
  const [bookingType, setBookingType] = useState<BookingType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // All bookings (mock + new ones created in this session)
  const [allBookings, setAllBookings] = useState<Booking[]>(mockBookings);

  // Calculate available slots
  const timeSlots = useMemo(
    () => getTimeSlotsWithAvailability(selectedDate, allBookings),
    [selectedDate, allBookings]
  );

  // Find which court is available for selected time
  const assignedCourt = useMemo(() => {
    if (!selectedTime) return null;
    return findAvailableCourt(selectedDate, selectedTime, allBookings);
  }, [selectedDate, selectedTime, allBookings]);

  const assignedCourtName = assignedCourt
    ? mockCourts.find((c) => c.id === assignedCourt)?.name || assignedCourt
    : null;

  const selectedCoachData = selectedCoach
    ? mockCoaches.find((c) => c.id === selectedCoach)
    : null;

  const totalPrice = useMemo(() => {
    if (bookingType === "court_rental" && selectedTime) {
      const [startHour] = selectedTime.split(":").map(Number);
      return getCourtHourlyPrice(startHour);
    }
    if (bookingType === "coaching_session" && selectedCoachData) {
      return selectedCoachData.hourly_rate;
    }
    return 0;
  }, [bookingType, selectedCoachData, selectedTime]);

  const canProceedToDetails =
    selectedDate && selectedTime && assignedCourt;
  const canSubmit = customerName && customerEmail && customerPhone;

  const handleSubmit = async () => {
    if (!selectedTime || !assignedCourt || !bookingType) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const [hours] = selectedTime.split(":").map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(hours, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      user_id: "guest",
      court_id: assignedCourt,
      coach_id: selectedCoach,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      booking_type: bookingType,
      status: "confirmed",
      total_price: totalPrice,
      notes: notes || null,
      created_at: new Date().toISOString(),
    };

    setAllBookings((prev) => [...prev, newBooking]);
    setBookingConfirmed(true);
    setIsSubmitting(false);
    setCurrentStep("confirmation");
  };

  const resetBooking = () => {
    setCurrentStep("service");
    setBookingType(null);
    setSelectedTime(null);
    setSelectedCoach(null);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setNotes("");
    setBookingConfirmed(false);
  };

  // Step indicators
  const steps: { key: Step; label: string }[] = [
    { key: "service", label: "Услуга" },
    { key: "datetime", label: "Дата и час" },
    { key: "details", label: "Детайли" },
    { key: "confirmation", label: "Потвърждение" },
  ];

  const stepIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Резервация</h1>
            <p className="text-sm text-gray-500">TopSpin Tennis Club</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto px-6 pb-4">
          <div className="flex items-center gap-2">
            {steps.map((step, i) => (
              <div key={step.key} className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    "flex items-center gap-2 text-xs font-medium",
                    i <= stepIndex ? "text-orange-600" : "text-gray-400"
                  )}
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                      i < stepIndex
                        ? "bg-orange-600 text-white"
                        : i === stepIndex
                        ? "bg-orange-100 text-orange-700 ring-2 ring-orange-300"
                        : "bg-gray-100 text-gray-400"
                    )}
                  >
                    {i < stepIndex ? "✓" : i + 1}
                  </div>
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 rounded",
                      i < stepIndex ? "bg-orange-400" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Step 1: Choose Service */}
        {currentStep === "service" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Какво желаете?
              </h2>
              <p className="text-gray-500">
                Изберете типа услуга, която ви интересува.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Court Rental */}
              <button
                onClick={() => {
                  setBookingType("court_rental");
                  setCurrentStep("datetime");
                }}
                className={cn(
                  "flex flex-col items-start p-6 rounded-2xl border-2 transition-all text-left group hover:shadow-lg",
                  bookingType === "court_rental"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-orange-300 bg-white"
                )}
              >
                <div className="w-14 h-14 rounded-xl bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center mb-4 transition-colors">
                  <MapPin className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Наем на корт
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  Резервирайте корт за свободна игра с партньор.
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-orange-600">от 15</span>
                  <span className="text-sm font-bold text-gray-500">€/час</span>
                </div>
              </button>

              {/* Coaching Session */}
              <button
                onClick={() => {
                  setBookingType("coaching_session");
                  setCurrentStep("datetime");
                }}
                className={cn(
                  "flex flex-col items-start p-6 rounded-2xl border-2 transition-all text-left group hover:shadow-lg",
                  bookingType === "coaching_session"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-orange-300 bg-white"
                )}
              >
                <div className="w-14 h-14 rounded-xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center mb-4 transition-colors">
                  <GraduationCap className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Урок с треньор
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  Индивидуална тренировка с професионален треньор.
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-blue-600">от 20</span>
                  <span className="text-sm font-bold text-gray-500">€</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Date & Time Selection */}
        {currentStep === "datetime" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Изберете дата и час
                </h2>
                <p className="text-gray-500">
                  {bookingType === "court_rental"
                    ? "Система автоматично ще избере свободен корт."
                    : "Изберете удобно време за вашата тренировка."}
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setCurrentStep("service")}
                className="text-gray-500"
              >
                ← Назад
              </Button>
            </div>

            {/* Date Picker */}
            <Card className="border-0 shadow-md rounded-2xl">
              <CardContent className="p-6">
                <DatePicker
                  selectedDate={selectedDate}
                  onDateSelect={(date) => {
                    setSelectedDate(date);
                    setSelectedTime(null); // Reset time on date change
                  }}
                />
              </CardContent>
            </Card>

            {/* Time Slots */}
            <Card className="border-0 shadow-md rounded-2xl">
              <CardContent className="p-6">
                <TimeSlotGrid
                  slots={timeSlots}
                  selectedTime={selectedTime}
                  onTimeSelect={setSelectedTime}
                />
              </CardContent>
            </Card>

            {/* Coach Selection (for coaching sessions) */}
            {bookingType === "coaching_session" && (
              <Card className="border-0 shadow-md rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <GraduationCap className="w-5 h-5 text-orange-600" />
                    Изберете треньор
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {mockCoaches.map((coach) => (
                      <button
                        key={coach.id}
                        onClick={() => setSelectedCoach(coach.id)}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                          selectedCoach === coach.id
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-orange-300"
                        )}
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                          {coach.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{coach.name}</p>
                          <p className="text-xs text-gray-500">{coach.specialization}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{coach.hourly_rate}€</p>
                          <p className="text-xs text-gray-400">/час</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Selected slot info */}
            {selectedTime && assignedCourt && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-700 font-medium">
                      Избрано:
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatDateBG(selectedDate)} • {formatTimeRange(selectedTime)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Автоматично назначен: <strong>{assignedCourtName}</strong>
                    </p>
                  </div>
                  <Button
                    onClick={() => setCurrentStep("details")}
                    className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6"
                    disabled={
                      bookingType === "coaching_session" && !selectedCoach
                    }
                  >
                    Продължи →
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Customer Details */}
        {currentStep === "details" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Вашите данни
                </h2>
                <p className="text-gray-500">
                  Моля, попълнете информацията за контакт.
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setCurrentStep("datetime")}
                className="text-gray-500"
              >
                ← Назад
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Form */}
              <Card className="border-0 shadow-md rounded-2xl">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium mb-1.5">
                      Име и фамилия *
                    </Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Иван Петров"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium mb-1.5">
                      Имейл адрес *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="ivan@example.com"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium mb-1.5">
                      Телефон *
                    </Label>
                    <Input
                      id="phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+359 888 123 456"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes" className="text-sm font-medium mb-1.5">
                      Забележки (по желание)
                    </Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Допълнителна информация..."
                      className="rounded-xl resize-none"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card className="border-0 shadow-md rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">Обобщение</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="text-xs text-gray-500">Дата</p>
                        <p className="text-sm font-medium">
                          {formatDateBG(selectedDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="text-xs text-gray-500">Час</p>
                        <p className="text-sm font-medium">
                          {selectedTime && formatTimeRange(selectedTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="text-xs text-gray-500">Корт</p>
                        <p className="text-sm font-medium">{assignedCourtName}</p>
                      </div>
                    </div>
                    {bookingType === "coaching_session" && selectedCoachData && (
                      <div className="flex items-center gap-3">
                        <GraduationCap className="w-4 h-4 text-orange-600" />
                        <div>
                          <p className="text-xs text-gray-500">Треньор</p>
                          <p className="text-sm font-medium">
                            {selectedCoachData.name}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="text-xs text-gray-500">Тип</p>
                        <p className="text-sm font-medium">
                          {bookingType === "court_rental"
                            ? "Наем на корт"
                            : "Урок с треньор"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Обща цена:</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-gray-900">
                        {totalPrice}
                      </span>
                      <span className="text-sm font-bold text-gray-500">€</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-full h-12 text-base font-bold"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Обработване...
                      </span>
                    ) : (
                      "Потвърди резервацията"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {currentStep === "confirmation" && bookingConfirmed && (
          <div className="max-w-md mx-auto text-center space-y-6 py-12">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Резервацията е потвърдена!
              </h2>
              <p className="text-gray-500">
                Ще получите потвърждение на {customerEmail}
              </p>
            </div>

            <Card className="border-0 shadow-md rounded-2xl text-left">
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Дата:</span>
                  <span className="font-medium">{formatDateBG(selectedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Час:</span>
                  <span className="font-medium">
                    {selectedTime && formatTimeRange(selectedTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Корт:</span>
                  <span className="font-medium">{assignedCourtName}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-500">Цена:</span>
                  <span className="font-bold text-lg">{totalPrice}€</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={resetBooking}
                className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8"
              >
                Нова резервация
              </Button>
              <Link href="/">
                <Button
                  variant="outline"
                  className="rounded-full px-8"
                >
                  Към началото
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
