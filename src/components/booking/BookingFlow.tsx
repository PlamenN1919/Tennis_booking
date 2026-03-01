"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  User,
  GraduationCap,
  CheckCircle2,
  Calendar,
  Clock,
  Repeat,
  AlertCircle,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import DatePicker from "@/components/booking/DatePicker";
import TimeSlotGrid from "@/components/booking/TimeSlotGrid";
import {
  getTimeSlotsWithAvailability,
  findAvailableCourt,
  isSlotAvailable,
  formatDateBG,
  formatTimeRange,
  calculateLocalPrice,
  isCoachAvailable,
  getMaxConsecutiveHours,
  COURT_A_ID,
  COURT_B_ID,
  COACHING_PRICES,
  COACHING_LABELS,
  type CoachingType,
} from "@/lib/booking-utils";
import { mockBookings, mockCoaches, mockCourts } from "@/lib/mock-data";
import { bookingFormSchema } from "@/lib/validations";
import { createBooking } from "@/lib/actions";
import type { Booking } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type BookingType = "court_rental" | "coaching_session";
type Step = "service" | "training" | "datetime" | "details" | "confirmation";

export default function BookingFlow() {
  const [currentStep, setCurrentStep] = useState<Step>("service");
  const [bookingType, setBookingType] = useState<BookingType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const [coachingTypeSelected, setCoachingTypeSelected] = useState<CoachingType | null>(null);
  const [durationHours, setDurationHours] = useState(1);
  const [preferredCourt, setPreferredCourt] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [hasBallBasket, setHasBallBasket] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringWeeks, setRecurringWeeks] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [courtConflictDialog, setCourtConflictDialog] = useState<{
    open: boolean;
    time: string;
    alternativeCourt: string;
    alternativeCourtName: string;
    preferredCourtName: string;
  }>({ open: false, time: "", alternativeCourt: "", alternativeCourtName: "", preferredCourtName: "" });

  const [allBookings, setAllBookings] = useState<Booking[]>(mockBookings);

  const timeSlots = useMemo(() => {
    let slots = getTimeSlotsWithAvailability(selectedDate, allBookings, durationHours);
    if (bookingType === "coaching_session" && selectedCoach) {
      slots = slots.map(slot => ({
        ...slot,
        available: slot.available && isCoachAvailable(selectedDate, slot.time, selectedCoach, allBookings, durationHours)
      }));
    }
    return slots;
  }, [selectedDate, allBookings, durationHours, bookingType, selectedCoach]);

  const assignedCourt = useMemo(() => {
    if (!selectedTime) return null;
    return findAvailableCourt(
      selectedDate,
      selectedTime,
      allBookings,
      durationHours,
      preferredCourt
    );
  }, [selectedDate, selectedTime, allBookings, durationHours, preferredCourt]);

  const assignedCourtName = assignedCourt
    ? mockCourts.find((c) => c.id === assignedCourt)?.name || assignedCourt
    : null;

  const selectedCoachData = selectedCoach
    ? mockCoaches.find((c) => c.id === selectedCoach)
    : null;

  const coachAvailable = useMemo(() => {
    if (!selectedCoach || !selectedTime) return true;
    return isCoachAvailable(
      selectedDate,
      selectedTime,
      selectedCoach,
      allBookings,
      durationHours
    );
  }, [selectedDate, selectedTime, selectedCoach, allBookings, durationHours]);

  const totalPrice = useMemo(() => {
    if (!selectedTime || !bookingType) return 0;
    const courtData = mockCourts.find((c) => c.id === assignedCourt);
    const basePrice = calculateLocalPrice(
      selectedTime,
      durationHours,
      selectedDate,
      bookingType,
      coachingTypeSelected
    );
    return basePrice + (hasBallBasket ? 10 : 0);
  }, [bookingType, selectedTime, durationHours, selectedDate, coachingTypeSelected, assignedCourt, hasBallBasket]);

  const handleTimeSelect = (time: string) => {
    if (preferredCourt) {
      const preferredFree = isSlotAvailable(selectedDate, time, preferredCourt, allBookings, durationHours);
      if (!preferredFree) {
        const otherCourtId = preferredCourt === COURT_A_ID ? COURT_B_ID : COURT_A_ID;
        const otherFree = isSlotAvailable(selectedDate, time, otherCourtId, allBookings, durationHours);
        if (otherFree) {
          const prefName = mockCourts.find((c) => c.id === preferredCourt)?.name || preferredCourt;
          const altName = mockCourts.find((c) => c.id === otherCourtId)?.name || otherCourtId;
          setCourtConflictDialog({
            open: true,
            time,
            alternativeCourt: otherCourtId,
            alternativeCourtName: altName,
            preferredCourtName: prefName,
          });
          return;
        }
      }
    }
    setSelectedTime(time);
  };

  const canProceedToDetails =
    selectedDate && selectedTime && assignedCourt &&
    (bookingType !== "coaching_session" || (selectedCoach && coachAvailable));

  const canSubmit = customerName && customerPhone;

  const handleSubmit = async () => {
    if (!selectedTime || !assignedCourt || !bookingType) return;

    const validation = bookingFormSchema.safeParse({
      customerName,
      customerPhone,
      notes,
    });

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        errors[err.path[0] as string] = err.message;
      });
      setFormErrors(errors);
      toast.error("Моля, коригирайте грешките във формата");
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      const result = await createBooking({
        bookingType,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime,
        durationHours,
        courtId: assignedCourt,
        coachId: selectedCoach,
        coachingTypeSelected,
        customerName,
        customerEmail: "",
        customerPhone,
        notes,
        isRecurring,
        recurringWeeks: isRecurring ? recurringWeeks : undefined,
      });

      if (result.error) {
        toast.error(result.error);
        setIsSubmitting(false);
        return;
      }

      if (result.success) {
        toast.success(
          isRecurring
            ? `Създадени са ${recurringWeeks} повтарящи се резервации!`
            : "Резервацията е потвърдена!"
        );
        setBookingConfirmed(true);
        setCurrentStep("confirmation");
        setIsSubmitting(false);
        return;
      }
    } catch {
      console.log("Server action unavailable, using local mock");
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const [hours] = selectedTime.split(":").map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(hours, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + durationHours);

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      user_id: "guest",
      court_id: assignedCourt,
      coach_id: selectedCoach,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_hours: durationHours,
      booking_type: bookingType,
      status: "confirmed",
      total_price: totalPrice,
      notes: (notes || "") + (hasBallBasket ? (notes ? "\n" : "") + "[Добавен наем на кош топки]" : ""),
      customer_name: customerName,
      customer_email: "",
      customer_phone: customerPhone,
      is_recurring: isRecurring,
      recurring_group_id: null,
      created_at: new Date().toISOString(),
    };

    setAllBookings((prev) => [...prev, newBooking]);
    toast.success("Резервацията е потвърдена!");
    setBookingConfirmed(true);
    setIsSubmitting(false);
    setCurrentStep("confirmation");
  };

  const resetBooking = () => {
    setCurrentStep("service");
    setBookingType(null);
    setSelectedTime(null);
    setSelectedCoach(null);
    setCoachingTypeSelected(null);
    setDurationHours(1);
    setPreferredCourt(null);
    setCustomerName("");
    setCustomerPhone("");
    setNotes("");
    setHasBallBasket(false);
    setIsRecurring(false);
    setRecurringWeeks(4);
    setBookingConfirmed(false);
    setFormErrors({});
  };

  const steps: { key: Step; label: string }[] = [
    { key: "service", label: "Услуга" },
    ...(bookingType === "coaching_session" ? [{ key: "training" as Step, label: "Тренировка" }] : []),
    { key: "datetime", label: "Дата и час" },
    { key: "details", label: "Детайли" },
    { key: "confirmation", label: "Потвърждение" },
  ];

  const stepIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden noise-overlay mesh-gradient-hero">
      {/* Animated mesh gradient blobs */}
      <div className="mesh-blob mesh-blob-1" />
      <div className="mesh-blob mesh-blob-2" />
      <div className="mesh-blob mesh-blob-3" />

      {/* Main Content wrapper */}
      <div className="relative z-10 w-full h-full">
        <div className="bg-[#111111]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Резервация</h1>
              <p className="text-sm text-white/50">Tennis Club Oasis</p>
            </div>
          </div>
          <div className="max-w-4xl mx-auto px-6 pb-4">
            <div className="flex items-center gap-2">
              {steps.map((step, i) => (
                <div key={step.key} className="flex items-center gap-2 flex-1">
                  <div
                    className={cn(
                      "flex items-center gap-2 text-xs font-medium",
                      i <= stepIndex ? "text-[#FF6600]" : "text-white/40"
                    )}
                  >
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                        i < stepIndex
                          ? "bg-orange-600 text-white"
                          : i === stepIndex
                            ? "bg-[#FF6600]/20 text-[#FF6600] ring-2 ring-[#FF6600]/40"
                            : "bg-white/5 text-white/40"
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
                        i < stepIndex ? "bg-orange-400" : "bg-white/10"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          {currentStep === "service" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Какво желаете?</h2>
                <p className="text-white/50">Изберете типа услуга, която ви интересува.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => { setBookingType("court_rental"); setCurrentStep("datetime"); }}
                  className={cn(
                    "flex flex-col items-start p-6 rounded-2xl border-2 transition-all text-left group hover:shadow-lg",
                    bookingType === "court_rental" ? "border-orange-500 bg-[#FF6600]/10" : "border-white/10 hover:border-[#FF6600]/30 bg-[#111111]"
                  )}
                >
                  <div className="w-14 h-14 rounded-xl bg-[#FF6600]/20 group-hover:bg-orange-200 flex items-center justify-center mb-4 transition-colors">
                    <MapPin className="w-7 h-7 text-[#FF6600]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">Наем на корт</h3>
                  <p className="text-sm text-white/50 mb-3">Резервирайте корт за свободна игра с партньор.</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#FF6600]">от 15</span>
                    <span className="text-sm font-bold text-white/50">€/час</span>
                  </div>
                  <p className="text-xs text-white/40 mt-1">Пикови часове (19-24ч): 25 €/час</p>
                </button>
                <button
                  onClick={() => { setBookingType("coaching_session"); setDurationHours(1); setPreferredCourt(null); setCurrentStep("training"); }}
                  className={cn(
                    "flex flex-col items-start p-6 rounded-2xl border-2 transition-all text-left group hover:shadow-lg",
                    bookingType === "coaching_session" ? "border-orange-500 bg-[#FF6600]/10" : "border-white/10 hover:border-[#FF6600]/30 bg-[#111111]"
                  )}
                >
                  <div className="w-14 h-14 rounded-xl bg-blue-500/20 group-hover:bg-blue-200 flex items-center justify-center mb-4 transition-colors">
                    <GraduationCap className="w-7 h-7 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">Тренировка</h3>
                  <p className="text-sm text-white/50 mb-3">Изберете от различните видове тренировки.</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-blue-500">от 20</span>
                    <span className="text-sm font-bold text-white/50">€/сесия</span>
                  </div>
                  <p className="text-xs text-white/40 mt-1">Наем корт и ракета са включени</p>
                </button>
              </div>
            </div>
          )}

          {currentStep === "training" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Вид тренировка</h2>
                  <p className="text-white/50">Изберете вида на вашата тренировка.</p>
                </div>
                <Button variant="ghost" onClick={() => setCurrentStep("service")} className="text-white/50">← Назад</Button>
              </div>

              <Card className="border-0 shadow-md rounded-2xl">
                <CardContent className="p-6">
                  <div className="grid gap-3">
                    {(Object.entries(COACHING_PRICES) as [CoachingType, number][]).map(([type, price]) => {
                      return (
                        <button
                          key={type}
                          onClick={() => {
                            setCoachingTypeSelected(type);
                            const firstCoach = mockCoaches.find(c => c.is_active);
                            if (firstCoach) setSelectedCoach(firstCoach.id);
                          }}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                            coachingTypeSelected === type
                              ? "border-orange-500 bg-[#FF6600]/10"
                              : "border-white/10 hover:border-[#FF6600]/30"
                          )}
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                            <GraduationCap className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-white">{COACHING_LABELS[type]}</p>
                            <p className="text-xs text-white/50">Включва корт, треньор и ракета</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white">{price} €</p>
                            <p className="text-xs text-white/40">/сесия</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={() => setCurrentStep("datetime")}
                      disabled={!coachingTypeSelected}
                      className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8"
                    >
                      Продължи →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === "datetime" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Изберете дата и час</h2>
                  <p className="text-white/50">
                    {bookingType === "court_rental"
                      ? "Изберете удобно време за вашата игра."
                      : "Изберете удобно време за вашата тренировка."}
                  </p>
                </div>
                <Button variant="ghost" onClick={() => setCurrentStep(bookingType === "coaching_session" ? "training" : "service")} className="text-white/50">← Назад</Button>
              </div>

              {bookingType === "court_rental" && (
                <Card className="border-0 shadow-md rounded-2xl">
                  <CardContent className="p-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-bold text-white/80 mb-2 block">
                          <Clock className="w-4 h-4 inline mr-1.5 text-[#FF6600]" />
                          Продължителност
                        </Label>
                        <div className="flex gap-2">
                          {[1, 2, 3].map((h) => (
                            <button
                              key={h}
                              onClick={() => { setDurationHours(h); setSelectedTime(null); }}
                              className={cn(
                                "flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all",
                                durationHours === h
                                  ? "border-orange-500 bg-[#FF6600]/10 text-[#FF6600]"
                                  : "border-white/10 text-white/70 hover:border-[#FF6600]/30"
                              )}
                            >
                              {h} {h === 1 ? "час" : "часа"}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-bold text-white/80 mb-2 block">
                          <MapPin className="w-4 h-4 inline mr-1.5 text-[#FF6600]" />
                          Предпочитание за корт
                        </Label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPreferredCourt(null)}
                            className={cn(
                              "flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all",
                              !preferredCourt ? "border-orange-500 bg-[#FF6600]/10 text-[#FF6600]" : "border-white/10 text-white/70 hover:border-[#FF6600]/30"
                            )}
                          >Без значение</button>
                          <button
                            onClick={() => setPreferredCourt(COURT_A_ID)}
                            className={cn(
                              "flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all",
                              preferredCourt === COURT_A_ID ? "border-b border-white/10lue-500 bg-blue-500/10 text-blue-400" : "border-white/10 text-white/70 hover:border-b border-white/10lue-500/30"
                            )}
                          >Корт A</button>
                          <button
                            onClick={() => setPreferredCourt(COURT_B_ID)}
                            className={cn(
                              "flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all",
                              preferredCourt === COURT_B_ID ? "border-green-500 bg-green-500/10 text-green-400" : "border-white/10 text-white/70 hover:border-green-500/30"
                            )}
                          >Корт B</button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-0 shadow-md rounded-2xl">
                <CardContent className="p-6">
                  <DatePicker
                    selectedDate={selectedDate}
                    onDateSelect={(date) => { setSelectedDate(date); setSelectedTime(null); }}
                  />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-2xl">
                <CardContent className="p-6">
                  <TimeSlotGrid slots={timeSlots} selectedTime={selectedTime} onTimeSelect={handleTimeSelect} />
                  {timeSlots.length === 0 && (
                    <div className="text-center py-8 text-white/40">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Няма налични часове за тази дата</p>
                    </div>
                  )}
                </CardContent>
              </Card>



              {selectedTime && assignedCourt && (
                <div className="bg-[#FF6600]/10 border border-[#FF6600]/20 rounded-2xl p-5">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-sm text-[#FF6600] font-medium">Избрано:</p>
                      <p className="text-lg font-bold text-white">
                        {formatDateBG(selectedDate)} • {formatTimeRange(selectedTime, durationHours)}
                      </p>
                      <p className="text-sm text-white/70">
                        {assignedCourtName} • <strong>{totalPrice} €</strong>
                      </p>
                    </div>
                    <Button
                      onClick={() => setCurrentStep("details")}
                      className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6"
                      disabled={!canProceedToDetails}
                    >Продължи →</Button>
                  </div>
                  {bookingType === "coaching_session" && !coachAvailable && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-red-500 bg-red-500/10 rounded-xl p-3">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      Избраната тренировка не е свободна в този час. Моля, изберете друг час.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentStep === "details" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Вашите данни</h2>
                  <p className="text-white/50">Моля, попълнете информацията за контакт.</p>
                </div>
                <Button variant="ghost" onClick={() => setCurrentStep("datetime")} className="text-white/50">← Назад</Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-md rounded-2xl">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium mb-1.5">Име и фамилия *</Label>
                      <Input id="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Иван Петров"
                        className={cn("rounded-xl", formErrors.customerName && "border-red-400")} />
                      {formErrors.customerName && <p className="text-xs text-red-500 mt-1">{formErrors.customerName}</p>}
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium mb-1.5">Телефон *</Label>
                      <Input id="phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+359 88 6731212" className="bg-black/40 border-white/10 text-white placeholder:text-gray-600 focus:border-[#FF6600] focus:ring-[#FF6600]/20 transition-all duration-300 h-12" />
                      {formErrors.customerPhone && <p className="text-xs text-red-500 mt-1">{formErrors.customerPhone}</p>}
                    </div>
                    <div>
                      <Label htmlFor="notes" className="text-sm font-medium mb-1.5">Забележки (по желание)</Label>
                      <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Допълнителна информация..." className="rounded-xl resize-none" rows={3} />
                    </div>
                    <div className="border-t border-white/10 pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#FF6600]">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 2a14.5 14.5 0 0 0 0 20" />
                            <path d="M2 12a14.5 14.5 0 0 0 20 0" />
                          </svg>
                          <Label className="text-sm font-medium">Наем на кош топки (+10 €)</Label>
                        </div>
                        <button
                          onClick={() => setHasBallBasket(!hasBallBasket)}
                          className={cn("w-10 h-6 rounded-full transition-colors relative", hasBallBasket ? "bg-orange-600" : "bg-white/10")}
                        >
                          <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-[#111111] transition-transform shadow", hasBallBasket ? "left-[18px]" : "left-0.5")} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <Repeat className="w-4 h-4 text-[#FF6600]" />
                          <Label className="text-sm font-medium">Повтаряща се резервация</Label>
                        </div>
                        <button
                          onClick={() => setIsRecurring(!isRecurring)}
                          className={cn("w-10 h-6 rounded-full transition-colors relative", isRecurring ? "bg-orange-600" : "bg-white/10")}
                        >
                          <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-[#111111] transition-transform shadow", isRecurring ? "left-[18px]" : "left-0.5")} />
                        </button>
                      </div>
                      {isRecurring && (
                        <div className="mt-3">
                          <Label className="text-xs text-white/50 mb-1.5 block">Брой седмици</Label>
                          <Select value={String(recurringWeeks)} onValueChange={(v) => setRecurringWeeks(Number(v))}>
                            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4].map((w) => (
                                <SelectItem key={w} value={String(w)}>{w} {w === 1 ? "седмица" : "седмици"}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md rounded-2xl">
                  <CardHeader><CardTitle className="text-lg">Обобщение</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-[#FF6600]" />
                        <div><p className="text-xs text-white/50">Дата</p><p className="text-sm font-medium">{formatDateBG(selectedDate)}</p></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-[#FF6600]" />
                        <div><p className="text-xs text-white/50">Час</p><p className="text-sm font-medium">{selectedTime && formatTimeRange(selectedTime, durationHours)} ({durationHours} {durationHours === 1 ? "час" : "часа"})</p></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-[#FF6600]" />
                        <div><p className="text-xs text-white/50">Корт</p><p className="text-sm font-medium">{assignedCourtName}</p></div>
                      </div>
                      {bookingType === "coaching_session" && coachingTypeSelected && (
                        <div className="flex items-center gap-3">
                          <GraduationCap className="w-4 h-4 text-[#FF6600]" />
                          <div><p className="text-xs text-white/50">Вид тренировка</p><p className="text-sm font-medium">{COACHING_LABELS[coachingTypeSelected]}</p></div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-[#FF6600]" />
                        <div><p className="text-xs text-white/50">Тип</p><p className="text-sm font-medium">{bookingType === "court_rental" ? "Наем на корт" : "Тренировка"}</p></div>
                      </div>
                      {hasBallBasket && (
                        <div className="flex items-center gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#FF6600]">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 2a14.5 14.5 0 0 0 0 20" />
                            <path d="M2 12a14.5 14.5 0 0 0 20 0" />
                          </svg>
                          <div><p className="text-xs text-white/50">Допълнителни услуги</p><p className="text-sm font-medium">Наем на кош (+10 €)</p></div>
                        </div>
                      )}
                      {isRecurring && (
                        <div className="flex items-center gap-3">
                          <Repeat className="w-4 h-4 text-[#FF6600]" />
                          <div><p className="text-xs text-white/50">Повтаряне</p><p className="text-sm font-medium">{recurringWeeks} седмици</p></div>
                        </div>
                      )}
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 font-medium">{isRecurring ? "Цена на сесия:" : "Обща цена:"}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">{totalPrice}</span>
                        <span className="text-sm font-bold text-white/50">€</span>
                      </div>
                    </div>
                    {isRecurring && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/50">Общо за {recurringWeeks} седмици:</span>
                        <span className="font-bold text-[#FF6600]">{totalPrice * recurringWeeks} €</span>
                      </div>
                    )}
                    <Button
                      onClick={handleSubmit}
                      disabled={!canSubmit || isSubmitting}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-full h-12 text-base font-bold"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t border-white/10-white rounded-full animate-spin" />
                          Обработване...
                        </span>
                      ) : "Потвърди резервацията"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {currentStep === "confirmation" && bookingConfirmed && (
            <div className="max-w-md mx-auto text-center space-y-6 py-12">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Резервацията е потвърдена!</h2>
                <p className="text-white/50">Резервацията ви е успешно записана.</p>
              </div>
              <Card className="border-0 shadow-md rounded-2xl text-left">
                <CardContent className="p-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/50">Дата:</span>
                    <span className="font-medium">{formatDateBG(selectedDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Час:</span>
                    <span className="font-medium">{selectedTime && formatTimeRange(selectedTime, durationHours)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Корт:</span>
                    <span className="font-medium">{assignedCourtName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Продължителност:</span>
                    <span className="font-medium">{durationHours} {durationHours === 1 ? "час" : "часа"}</span>
                  </div>
                  {hasBallBasket && (
                    <div className="flex justify-between">
                      <span className="text-white/50">Допълнително:</span>
                      <span className="font-medium">Кош топки (+10 €)</span>
                    </div>
                  )}
                  {isRecurring && (
                    <div className="flex justify-between">
                      <span className="text-white/50">Повтаряне:</span>
                      <span className="font-medium">{recurringWeeks} седмици</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-white/50">Цена:</span>
                    <span className="font-bold text-lg">
                      {isRecurring ? `${totalPrice * recurringWeeks} € (${recurringWeeks}x${totalPrice})` : `${totalPrice} €`}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={resetBooking} className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8">Нова резервация</Button>
                <Link href="/"><Button variant="outline" className="rounded-full px-8">Към началото</Button></Link>
              </div>
            </div>
          )}
        </div>

        {/* Court Conflict Dialog */}
        <Dialog
          open={courtConflictDialog.open}
          onOpenChange={(open) => setCourtConflictDialog((prev) => ({ ...prev, open }))}
        >
          <DialogContent className="rounded-2xl max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#FF6600]" />
                Кортът е зает
              </DialogTitle>
              <DialogDescription className="text-left">
                <strong>{courtConflictDialog.preferredCourtName}</strong> е зает в{" "}
                <strong>{courtConflictDialog.time}ч</strong>. Свободен е{" "}
                <strong>{courtConflictDialog.alternativeCourtName}</strong>.
                Желаете ли да резервирате него вместо това?
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 mt-2">
              <Button
                onClick={() => {
                  setPreferredCourt(courtConflictDialog.alternativeCourt);
                  setSelectedTime(courtConflictDialog.time);
                  setCourtConflictDialog((prev) => ({ ...prev, open: false }));
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white rounded-full"
              >
                Да, резервирай {courtConflictDialog.alternativeCourtName}
              </Button>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setCourtConflictDialog((prev) => ({ ...prev, open: false }))}
              >
                Не, ще избера друг час
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
