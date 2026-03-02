"use client";

import { useState, useMemo, useEffect } from "react";
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
import GroupTrainingCalendar from "@/components/booking/GroupTrainingCalendar";
import {
  getTimeSlotsWithAvailability,
  findAvailableCourt,
  isCourtAvailableForDuration,
  getMaxAvailableDuration,
  formatDateBG,
  formatTimeRange,
  getCourtHourlyPrice,
  calculateLocalPrice,
  COACHING_PRICES,
  COACHING_LABELS,
  type CoachingType,
  COURT_A_ID,
  COURT_B_ID,
  CLOSING_HOUR,
  BASKET_RENTAL_PRICE,
  RACKET_RENTAL_PRICE,
  groupTrainingsToVirtualBookings,
  setCourtIds,
} from "@/lib/booking-utils";
import { mockBookings, mockCourts } from "@/lib/mock-data";
import { getStoredGroupTrainings } from "@/lib/group-training-storage";
import { getStoredBookings, saveBookings, addStoredBooking } from "@/lib/booking-storage";
import { createBooking, getCourts, getBookingsForDateRange } from "@/lib/actions";
import type { Booking } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type BookingType = "court_rental" | "coaching_session";
type Step = "service" | "coaching_type" | "group_calendar" | "datetime" | "details" | "confirmation";

export default function BookingFlow() {
  const [currentStep, setCurrentStep] = useState<Step>("service");
  const [bookingType, setBookingType] = useState<BookingType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<string | null>("any");
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [selectedCoachingType, setSelectedCoachingType] = useState<CoachingType | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [wantsBasket, setWantsBasket] = useState(false);
  const [wantsRacket, setWantsRacket] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // All bookings (stored + new ones created in this session)
  const [allBookings, setAllBookings] = useState<Booking[]>(() => getStoredBookings());

  // On mount: attempt to load real courts from Supabase.
  // If available, update the global court IDs so all booking-utils functions
  // use real Supabase UUIDs instead of the mock "court-a"/"court-b" strings.
  const [courts, setCourts] = useState(mockCourts);
  useEffect(() => {
    getCourts().then((serverCourts) => {
      if (serverCourts.length >= 2) {
        // Sort by name to ensure consistent A/B ordering
        const sorted = [...serverCourts].sort((a, b) => a.name.localeCompare(b.name));
        setCourtIds(sorted[0].id, sorted[1].id);
        setCourts(sorted);
      }
    }).catch(() => {
      // Supabase not available — keep using mock court IDs
    });

    // Try loading real bookings from server (30-day window)
    const today = new Date();
    const startStr = format(today, "yyyy-MM-dd");
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 30);
    const endStr = format(endDate, "yyyy-MM-dd");

    getBookingsForDateRange(startStr, endStr)
      .then((serverBookings) => {
        if (serverBookings.length > 0) {
          setAllBookings(serverBookings);
          saveBookings(serverBookings);
        }
      })
      .catch(() => {
        // Supabase not available — keep using stored bookings
      });
  }, []);

  // Listen for booking changes to keep state up-to-date
  useEffect(() => {
    const handleBookingsUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail as Booking[];
      setAllBookings(detail);
    };
    window.addEventListener("bookings-updated", handleBookingsUpdate);
    return () => window.removeEventListener("bookings-updated", handleBookingsUpdate);
  }, []);

  // Track group training changes to keep virtual bookings up-to-date
  const [gtVersion, setGtVersion] = useState(0);
  useEffect(() => {
    const handleGTUpdate = () => setGtVersion((v) => v + 1);
    const handleFocus = () => setGtVersion((v) => v + 1);
    window.addEventListener("group-trainings-updated", handleGTUpdate);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("group-trainings-updated", handleGTUpdate);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Merge group-training virtual bookings so court availability checks account for them
  const allBookingsWithGT = useMemo(() => {
    const storedGT = getStoredGroupTrainings();
    const virtualBookings = groupTrainingsToVirtualBookings(storedGT, allBookings);
    return [...allBookings, ...virtualBookings];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allBookings, gtVersion]);

  // Calculate available slots
  const timeSlots = useMemo(
    () => getTimeSlotsWithAvailability(selectedDate, allBookingsWithGT),
    [selectedDate, allBookingsWithGT]
  );

  // For court_rental: user picks court (or "any" for auto-assign); for coaching: auto-assign
  const assignedCourt = useMemo(() => {
    if (bookingType === "court_rental") {
      if (selectedCourt === "any" && selectedTime) {
        // Auto-assign best available court that fits the duration
        return findAvailableCourt(selectedDate, selectedTime, allBookingsWithGT);
      }
      return selectedCourt;
    }
    if (!selectedTime) return null;
    return findAvailableCourt(selectedDate, selectedTime, allBookingsWithGT);
  }, [bookingType, selectedCourt, selectedDate, selectedTime, allBookingsWithGT]);

  const assignedCourtName = useMemo(() => {
    if (selectedCourt === "any") return "Без значение (автоматично)";
    return assignedCourt
      ? courts.find((c) => c.id === assignedCourt)?.name || assignedCourt
      : null;
  }, [selectedCourt, assignedCourt, courts]);

  // Available courts for the selected time (court_rental)
  const availableCourts = useMemo(() => {
    if (!selectedTime) return [];
    return courts.filter((court) =>
      isCourtAvailableForDuration(
        selectedDate,
        selectedTime,
        court.id,
        selectedDuration,
        allBookingsWithGT
      )
    );
  }, [selectedDate, selectedTime, selectedDuration, allBookingsWithGT, courts]);

  // Max available duration for the selected court
  const maxDuration = useMemo(() => {
    if (!selectedTime || !selectedCourt) return 3;
    if (selectedCourt === "any") {
      // For "any" court, take the best (max) duration across all courts
      return Math.max(
        ...courts.map((c) =>
          getMaxAvailableDuration(selectedDate, selectedTime, c.id, allBookingsWithGT, 3)
        )
      );
    }
    return getMaxAvailableDuration(
      selectedDate,
      selectedTime,
      selectedCourt,
      allBookingsWithGT,
      3
    );
  }, [selectedDate, selectedTime, selectedCourt, allBookingsWithGT, courts]);

  // Clamp duration when max changes
  const effectiveDuration = bookingType === "court_rental"
    ? Math.min(selectedDuration, maxDuration)
    : 1;

  const totalPrice = useMemo(() => {
    let base = 0;
    if (bookingType === "court_rental" && selectedTime) {
      base = calculateLocalPrice(
        selectedTime,
        effectiveDuration,
        selectedDate,
        "court_rental",
        null
      );
      if (wantsBasket) base += BASKET_RENTAL_PRICE;
      if (wantsRacket) base += RACKET_RENTAL_PRICE;
    } else if (bookingType === "coaching_session" && selectedCoachingType) {
      base = COACHING_PRICES[selectedCoachingType];
    }
    return base;
  }, [bookingType, selectedCoachingType, selectedTime, effectiveDuration, selectedDate, wantsBasket, wantsRacket]);

  const canProceedToDetails =
    selectedDate && selectedTime && assignedCourt && effectiveDuration >= 1
    && (bookingType === "court_rental" || selectedCoachingType !== null);
  const canSubmit = customerName && customerPhone;

  const handleSubmit = async () => {
    if (!selectedTime || !assignedCourt || !bookingType) return;

    // Validate end time doesn't exceed closing hour
    const [hours] = selectedTime.split(":").map(Number);
    if (hours + effectiveDuration > CLOSING_HOUR) {
      alert("Резервацията надвишава работното време (до 24:00).");
      return;
    }

    setIsSubmitting(true);

    // Helper: build a local Booking object for immediate UI update
    const buildLocalBooking = (serverId?: string): Booking => {
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + effectiveDuration);

      return {
        id: serverId || `booking-${Date.now()}`,
        user_id: "guest",
        court_id: assignedCourt,
        coach_id: bookingType === "coaching_session" ? null : null,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        booking_type: bookingType,
        status: "confirmed",
        total_price: totalPrice,
        notes: notes || null,
        created_at: new Date().toISOString(),
      };
    };

    try {
      // Try persisting via server action (works when Supabase is configured)
      const result = await createBooking({
        bookingType,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime,
        durationHours: effectiveDuration,
        courtId: assignedCourt,
        coachId: null,
        coachingTypeSelected: selectedCoachingType,
        customerName,
        customerEmail: customerEmail || undefined,
        customerPhone,
        notes,
        wantsBasket,
        wantsRacket,
      });

      if (result && "error" in result && result.error) {
        alert(result.error);
        setIsSubmitting(false);
        return;
      }

      // Server persisted — update local state and storage for immediate UI feedback
      const serverBookingId = result?.booking?.id;
      const newBooking = buildLocalBooking(serverBookingId);
      setAllBookings((prev) => [...prev, newBooking]);
      addStoredBooking(newBooking);
      setBookingConfirmed(true);
      setCurrentStep("confirmation");
    } catch (err: unknown) {
      // If Supabase is not configured, fall back to local-only mode (dev)
      const message = err instanceof Error ? err.message : "";
      if (message.includes("Supabase not configured")) {
        const newBooking = buildLocalBooking();
        setAllBookings((prev) => [...prev, newBooking]);
        addStoredBooking(newBooking);
        setBookingConfirmed(true);
        setCurrentStep("confirmation");
      } else {
        console.error("Booking error:", err);
        alert("Грешка при създаване на резервацията. Моля, опитайте отново.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setCurrentStep("service");
    setBookingType(null);
    setSelectedTime(null);
    setSelectedCourt("any");
    setSelectedDuration(1);
    setSelectedCoachingType(null);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setNotes("");
    setWantsBasket(false);
    setWantsRacket(false);
    setBookingConfirmed(false);
  };

  const isGroupTraining = selectedCoachingType === "kids_5_8" || selectedCoachingType === "kids_8_11";

  const steps: { key: Step; label: string }[] = bookingType === "coaching_session"
    ? isGroupTraining
      ? [
          { key: "service", label: "Услуга" },
          { key: "coaching_type", label: "Тренировка" },
          { key: "group_calendar", label: "Календар" },
        ]
      : [
          { key: "service", label: "Услуга" },
          { key: "coaching_type", label: "Тренировка" },
          { key: "datetime", label: "Дата и час" },
          { key: "details", label: "Детайли" },
          { key: "confirmation", label: "Потвърждение" },
        ]
    : [
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
            <p className="text-sm text-gray-500">Tennis Club Oasis</p>
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
                  setSelectedCoachingType(null);
                  setCurrentStep("coaching_type");
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

        {/* Step 1.5: Coaching Type Selection */}
        {currentStep === "coaching_type" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Изберете тип тренировка
                </h2>
                <p className="text-gray-500">
                  Всички цени включват наем на корт + ракета.
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

            <div className="grid gap-3">
              {(Object.keys(COACHING_PRICES) as CoachingType[]).map((type) => {
                const isSelected = selectedCoachingType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedCoachingType(type)}
                    className={cn(
                      "flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left",
                      isSelected
                        ? "border-orange-500 bg-orange-50 shadow-md"
                        : "border-gray-200 hover:border-orange-300 bg-white hover:shadow-sm"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        isSelected ? "bg-orange-600 text-white" : "bg-orange-100 text-orange-600"
                      )}>
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <p className="font-medium text-sm text-gray-900">{COACHING_LABELS[type]}</p>
                    </div>
                    <span className={cn(
                      "font-bold text-base shrink-0 ml-3",
                      isSelected ? "text-orange-600" : "text-gray-700"
                    )}>{COACHING_PRICES[type]}€</span>
                  </button>
                );
              })}
            </div>

            {selectedCoachingType && (
              <Button
                onClick={() => setCurrentStep(
                  selectedCoachingType === "kids_5_8" || selectedCoachingType === "kids_8_11"
                    ? "group_calendar"
                    : "datetime"
                )}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-full h-12 text-base font-bold"
              >
                Продължи →
              </Button>
            )}
          </div>
        )}

        {/* Step: Group Training Calendar */}
        {currentStep === "group_calendar" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Групови тренировки
                </h2>
                <p className="text-gray-500">
                  {selectedCoachingType === "kids_5_8"
                    ? "Избери ден и час за групова тренировка за деца 5–8 години."
                    : "Избери ден и час за групова тренировка за деца 8–11 години."}
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setCurrentStep("coaching_type")}
                className="text-gray-500"
              >
                ← Назад
              </Button>
            </div>

            <div className="bg-gray-900 rounded-2xl p-6">
              <GroupTrainingCalendar />
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
                    ? "Изберете дата, час, корт и продължителност."
                    : "Изберете удобно време за вашата тренировка."}
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(bookingType === "coaching_session" ? "coaching_type" : "service")}
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
                    setSelectedCourt("any");
                    setSelectedDuration(1);
                  }}
                />
              </CardContent>
            </Card>

            {/* Time Slots + Court & Duration (inline for court rental) */}
            <Card className="border-0 shadow-md rounded-2xl">
              <CardContent className="p-6 space-y-6">
                <TimeSlotGrid
                  slots={timeSlots}
                  selectedTime={selectedTime}
                  onTimeSelect={(time) => {
                    setSelectedTime(time);
                    setSelectedCourt("any");
                    setSelectedDuration(1);
                  }}
                />

                {/* Court & Duration inline (court rental only) */}
                {bookingType === "court_rental" && selectedTime && (
                  <>
                    <Separator />

                    {/* Court + Duration side by side */}
                    <div className="grid sm:grid-cols-2 gap-6">
                      {/* Court Selection */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange-600" />
                          <p className="text-sm font-bold text-gray-900">Корт</p>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {/* "Any court" option */}
                          <button
                            onClick={() => {
                              setSelectedCourt("any");
                              setSelectedDuration(1);
                            }}
                            className={cn(
                              "flex flex-col items-center p-2 rounded-xl border-2 transition-all min-w-0 overflow-hidden",
                              selectedCourt === "any"
                                ? "border-orange-500 bg-orange-50 shadow-md"
                                : "border-gray-200 hover:border-orange-300 bg-white"
                            )}
                          >
                            <div
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                                selectedCourt === "any"
                                  ? "bg-orange-600 text-white"
                                  : "bg-gray-100 text-gray-500"
                              )}
                            >
                              ✦
                            </div>
                            <p className="font-bold text-[11px] text-gray-900 mt-1 text-center leading-tight truncate w-full">Без зн.</p>
                          </button>

                          {courts.map((court) => {
                            const courtAvailable = isCourtAvailableForDuration(
                              selectedDate,
                              selectedTime,
                              court.id,
                              selectedDuration,
                              allBookingsWithGT
                            );
                            const isSelected = selectedCourt === court.id;

                            return (
                              <button
                                key={court.id}
                                disabled={!courtAvailable}
                                onClick={() => {
                                  setSelectedCourt(court.id);
                                  const max = getMaxAvailableDuration(
                                    selectedDate,
                                    selectedTime,
                                    court.id,
                                    allBookingsWithGT,
                                    3
                                  );
                                  if (selectedDuration > max) setSelectedDuration(max);
                                }}
                                className={cn(
                                  "flex flex-col items-center p-2 rounded-xl border-2 transition-all min-w-0 overflow-hidden",
                                  isSelected
                                    ? "border-orange-500 bg-orange-50 shadow-md"
                                    : courtAvailable
                                    ? "border-gray-200 hover:border-orange-300 bg-white"
                                    : "border-gray-100 bg-gray-50 cursor-not-allowed opacity-50"
                                )}
                              >
                                <div
                                  className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                                    isSelected
                                      ? "bg-orange-600 text-white"
                                      : courtAvailable
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-gray-200 text-gray-400"
                                  )}
                                >
                                  {court.name.split(" ")[1]}
                                </div>
                                <p className="font-bold text-[11px] text-gray-900 mt-1 truncate w-full text-center">{court.name}</p>
                                <p className="text-[10px] text-gray-500">
                                  {courtAvailable ? "Свободен" : "Зает"}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Duration Selection */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-600" />
                          <p className="text-sm font-bold text-gray-900">Продължителност</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[1, 2, 3].map((hours) => {
                            const canSelect = (selectedCourt && selectedCourt !== null) ? hours <= maxDuration : false;
                            const isSelected = selectedCourt && effectiveDuration === hours;
                            const priceForDuration = selectedTime && canSelect
                              ? calculateLocalPrice(selectedTime, hours, selectedDate, "court_rental", null)
                              : 0;

                            return (
                              <button
                                key={hours}
                                disabled={!canSelect}
                                onClick={() => setSelectedDuration(hours)}
                                className={cn(
                                  "flex flex-col items-center py-2.5 px-2 rounded-xl border-2 transition-all",
                                  isSelected
                                    ? "border-orange-500 bg-orange-50 shadow-md"
                                    : canSelect
                                    ? "border-gray-200 hover:border-orange-300 bg-white"
                                    : "border-gray-100 bg-gray-50 cursor-not-allowed opacity-50"
                                )}
                              >
                                <span className="text-base font-black text-gray-900">
                                  {hours} ч.
                                </span>
                                <span className={cn(
                                  "text-xs font-bold mt-0.5",
                                  isSelected ? "text-orange-600" : "text-gray-500"
                                )}>
                                  {canSelect ? `${priceForDuration}€` : "—"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Selected slot info */}
            {selectedTime && assignedCourt && canProceedToDetails && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-700 font-medium">
                      Избрано:
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatDateBG(selectedDate)} • {formatTimeRange(selectedTime, effectiveDuration)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {bookingType === "court_rental" ? (
                        <><strong>{assignedCourtName}</strong> • {effectiveDuration} {effectiveDuration === 1 ? "час" : "часа"} • <strong>{totalPrice}€</strong></>
                      ) : (
                        <>{selectedCoachingType && COACHING_LABELS[selectedCoachingType]} • <strong>{totalPrice}€</strong></>
                      )}
                    </p>
                  </div>
                  <Button
                    onClick={() => setCurrentStep("details")}
                    className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6"
                    disabled={!canProceedToDetails}
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
                    <Label htmlFor="email" className="text-sm font-medium mb-1.5">
                      Имейл (за потвърждение)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="ivan@email.com"
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

                  <Separator />

                  {/* Add-on Services — only for court rental */}
                  {bookingType === "court_rental" && (
                    <div className="space-y-2.5">
                    <p className="text-sm font-medium text-gray-700">Допълнителни услуги</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setWantsBasket((v) => !v)}
                        className={cn(
                          "inline-flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all text-sm font-medium",
                          wantsBasket
                            ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                            : "bg-white text-gray-700 border-gray-300 hover:border-orange-400 hover:bg-orange-50"
                        )}
                      >
                        🧺 Кош с топки
                        <span className={cn(
                          "font-bold",
                          wantsBasket ? "text-white/90" : "text-orange-600"
                        )}>+{BASKET_RENTAL_PRICE}€</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setWantsRacket((v) => !v)}
                        className={cn(
                          "inline-flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all text-sm font-medium",
                          wantsRacket
                            ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                            : "bg-white text-gray-700 border-gray-300 hover:border-orange-400 hover:bg-orange-50"
                        )}
                      >
                        🎾 Ракета + 3 топки
                        <span className={cn(
                          "font-bold",
                          wantsRacket ? "text-white/90" : "text-orange-600"
                        )}>+{RACKET_RENTAL_PRICE}€</span>
                      </button>
                    </div>
                  </div>
                  )}
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
                          {selectedTime && formatTimeRange(selectedTime, effectiveDuration)}
                        </p>
                      </div>
                    </div>
                    {bookingType === "court_rental" && (
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <div>
                          <p className="text-xs text-gray-500">Продължителност</p>
                          <p className="text-sm font-medium">
                            {effectiveDuration} {effectiveDuration === 1 ? "час" : "часа"}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="text-xs text-gray-500">Корт</p>
                        <p className="text-sm font-medium">{assignedCourtName}</p>
                      </div>
                    </div>
                    {bookingType === "coaching_session" && selectedCoachingType && (
                      <div className="flex items-center gap-3">
                        <GraduationCap className="w-4 h-4 text-orange-600" />
                        <div>
                          <p className="text-xs text-gray-500">Тренировка</p>
                          <p className="text-sm font-medium">
                            {COACHING_LABELS[selectedCoachingType]}
                          </p>
                          <p className="text-[11px] text-gray-400">Вкл. наем на корт + ракета</p>
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

                  {/* Add-ons in summary */}
                  {(wantsBasket || wantsRacket) && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 font-medium">Допълнителни</p>
                      {wantsBasket && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Наем на кош</span>
                          <span className="font-medium">{BASKET_RENTAL_PRICE}€</span>
                        </div>
                      )}
                      {wantsRacket && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Ракета + 3 топки</span>
                          <span className="font-medium">{RACKET_RENTAL_PRICE}€</span>
                        </div>
                      )}
                      <Separator />
                    </div>
                  )}

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
                Ще получите потвърждение по телефон.
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
                    {selectedTime && formatTimeRange(selectedTime, effectiveDuration)}
                  </span>
                </div>
                {bookingType === "court_rental" && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Продължителност:</span>
                    <span className="font-medium">{effectiveDuration} {effectiveDuration === 1 ? "час" : "часа"}</span>
                  </div>
                )}
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
